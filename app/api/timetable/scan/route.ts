import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { getSupabaseProjectInfo } from '@/lib/supabase/projectInfo';
import { extractTimetable, GeminiProviderError, TimetableOutputValidationError } from '@/lib/ai/timetableScannerServer';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const FILE_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

function diagnostic(stage: string, details: Record<string, string | number | boolean | null> = {}) {
  console.info('[timetable-scan]', { stage, ...details });
}

function hasExpectedSignature(bytes: Uint8Array, mime: string): boolean {
  if (mime === 'application/pdf') {
    return new TextDecoder().decode(bytes.slice(0, 1024)).includes('%PDF-');
  }
  if (mime === 'image/png') {
    return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  }
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  diagnostic('request_received', {
    ...getSupabaseProjectInfo(),
    authorizationHeaderPresent: Boolean(authorization),
    accessTokenExtracted: Boolean(accessToken),
    originHeaderPresent: Boolean(request.headers.get('origin')),
    multipartContentType: request.headers.get('content-type')?.toLowerCase().startsWith('multipart/form-data') ?? false,
    clientProjectReference: request.headers.get('x-bloom-client-project-reference') ?? null,
    projectReferenceMatches: request.headers.get('x-bloom-client-project-reference') === getSupabaseProjectInfo().projectReference,
    geminiApiKeyPresent: Boolean(process.env.GEMINI_API_KEY),
  });

  if (!accessToken) {
    diagnostic('supabase_auth_failed', { reason: 'missing_bearer_token' });
    return NextResponse.json({ error: 'Your sign-in could not be verified. Refresh Bloom and try again.' }, { status: 401 });
  }

  const user = await getCurrentUser(accessToken);
  diagnostic('supabase_auth_result', {
    userResolved: Boolean(user),
    userIdExists: Boolean(user?.id),
  });
  if (!user) {
    diagnostic('supabase_auth_failed', { reason: 'token_rejected' });
    return NextResponse.json({ error: 'Your sign-in could not be verified. Refresh Bloom and sign in again.' }, { status: 401 });
  }

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_FILE_SIZE + 256 * 1024) {
    diagnostic('file_rejected', { reason: 'request_too_large' });
    return NextResponse.json({ error: 'Choose a timetable file under 10 MB.' }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    diagnostic('file_upload_failed', { reason: 'multipart_parse_failed' });
    return NextResponse.json({ error: 'Bloom could not read that upload. Please choose a PDF, JPG, or PNG.' }, { status: 400 });
  }

  const upload = formData.get('file');
  if (!upload || typeof upload === 'string' || typeof upload.arrayBuffer !== 'function') {
    diagnostic('file_upload_failed', { reason: 'file_field_missing' });
    return NextResponse.json({ error: 'Choose a PDF, JPG, or PNG timetable file.' }, { status: 400 });
  }
  if (upload.size === 0 || upload.size > MAX_FILE_SIZE) {
    diagnostic('file_rejected', { reason: 'invalid_file_size', sizeBytes: upload.size });
    return NextResponse.json({ error: 'Choose a timetable file under 10 MB.' }, { status: 413 });
  }

  const extension = upload.name.split('.').pop()?.toLowerCase() || '';
  const mime = FILE_TYPES[extension];
  if (!mime || (upload.type && upload.type !== mime && upload.type !== 'application/octet-stream')) {
    diagnostic('file_rejected', { reason: 'unsupported_file_type' });
    return NextResponse.json({ error: 'Please choose a PDF, JPG, JPEG, or PNG file.' }, { status: 415 });
  }

  try {
    const bytes = new Uint8Array(await upload.arrayBuffer());
    diagnostic('file_received', { fileReceived: true, sizeBytes: upload.size, declaredMimeAccepted: true });
    if (!hasExpectedSignature(bytes, mime)) {
      diagnostic('file_rejected', { reason: 'signature_mismatch' });
      return NextResponse.json({ error: 'That file does not look like a valid PDF or image. Please choose another file.' }, { status: 415 });
    }

    const normalizedFile = new File([bytes], upload.name, { type: mime });
    if (!process.env.GEMINI_API_KEY) {
      diagnostic('gemini_not_configured', { geminiApiKeyPresent: false });
      return NextResponse.json({ error: 'Timetable scanning is not configured on the server yet.' }, { status: 503 });
    }
    diagnostic('gemini_request_started', { geminiApiKeyPresent: true, fileSignatureValid: true });
    const result = await extractTimetable(normalizedFile);
    diagnostic('model_response_validated', { classCount: result.classes.length });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GeminiProviderError) {
      diagnostic('gemini_request_failed', {
        code: error.code,
        httpStatus: error.httpStatus ?? null,
        providerStatus: error.providerStatus ?? null,
        providerMessage: error.code === 'GEMINI_HTTP_ERROR' ? error.message : null,
      });
      if (error.code === 'GEMINI_HTTP_ERROR' && (error.httpStatus === 401 || error.httpStatus === 403)) {
        return NextResponse.json({ error: 'The scanner could not authenticate with Gemini. Check the server API key and Gemini API access.' }, { status: 502 });
      }
      if (error.httpStatus === 429) {
        return NextResponse.json({ error: 'The scanner is busy right now. Wait a moment and try again.' }, { status: 503 });
      }
      if (error.code === 'REQUEST_TIMEOUT' || error.code === 'NETWORK_ERROR') {
        return NextResponse.json({ error: 'Bloom could not reach Gemini. Check the server connection and try again.' }, { status: 502 });
      }
      if (error.code === 'INVALID_JSON' || error.code === 'EMPTY_RESPONSE') {
        return NextResponse.json({ error: 'Gemini returned an incomplete timetable reading. Try a clearer image or PDF.' }, { status: 502 });
      }
      if (error.code === 'INVALID_API_RESPONSE') {
        return NextResponse.json({ error: 'Gemini returned an unreadable response. Please try the scan again.' }, { status: 502 });
      }
      return NextResponse.json({ error: `Gemini could not process this timetable (HTTP ${error.httpStatus ?? 'request error'}). Check the server logs for the provider reason.` }, { status: 502 });
    }
    if (error instanceof TimetableOutputValidationError) {
      diagnostic('model_output_validation_failed', { reason: 'schema_mismatch' });
      return NextResponse.json({ error: 'Bloom could not organize the timetable reading. Try a clearer image or PDF.' }, { status: 422 });
    }
    diagnostic('scanner_failed', { stage: 'unexpected_server_error' });
    return NextResponse.json(
      { error: 'Bloom could not quite read this timetable. Try a clearer image or PDF.' },
      { status: 502 }
    );
  }
}
