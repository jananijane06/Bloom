import { parseScannedTimetable } from '@/lib/ai/timetableSchema';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseProjectInfo } from '@/lib/supabase/projectInfo';
import { ScannedTimetableClass } from '@/types/timetable';

export async function scanTimetable(file: File): Promise<ScannedTimetableClass[]> {
  const supabase = createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (process.env.NODE_ENV === 'development') {
    console.info('[timetable-scan-client-diagnostic]', {
      stage: 'browser_session_read',
      ...getSupabaseProjectInfo(),
      sessionExists: Boolean(session),
      userExists: Boolean(session?.user),
      userIdExists: Boolean(session?.user?.id),
      sessionLookupSucceeded: !sessionError,
    });
  }
  if (sessionError || !session?.access_token) {
    throw new Error('Your sign-in needs a refresh. Please sign in again, then retry the scan.');
  }

  const formData = new FormData();
  formData.set('file', file);

  const projectInfo = getSupabaseProjectInfo();
  const headers = {
    Authorization: `Bearer ${session.access_token}`,
    'x-bloom-client-project-reference': projectInfo.projectReference,
  };
  if (process.env.NODE_ENV === 'development') {
    console.info('[timetable-scan-client-diagnostic]', {
      stage: 'upload_request_ready',
      ...projectInfo,
      authorizationHeaderAttached: Boolean(headers.Authorization),
      fileAttached: formData.get('file') instanceof File,
      multipartContentTypeSetManually: false,
    });
  }

  let response: Response;
  try {
    response = await fetch('/api/timetable/scan', {
      method: 'POST',
      body: formData,
      headers,
    });
  } catch {
    throw new Error('Bloom could not reach the scanner. Check your connection and try again.');
  }

  const result = await response.json().catch(() => null) as { classes?: unknown; error?: string } | null;
  if (process.env.NODE_ENV === 'development') {
    console.info('[timetable-scan-client-diagnostic]', {
      stage: 'upload_response',
      httpStatus: response.status,
      requestSucceeded: response.ok,
      serverErrorReturned: Boolean(result?.error),
    });
  }
  if (!response.ok) {
    throw new Error(result?.error || 'Bloom could not read this timetable. Try another file.');
  }

  try {
    return parseScannedTimetable({ classes: result?.classes }).classes;
  } catch {
    throw new Error('Bloom received an unreadable result. Please scan the timetable again.');
  }
}
