import { TimetableScannerProvider } from '@/lib/ai/provider';

export class GeminiProviderError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly httpStatus?: number,
    readonly providerStatus?: string
  ) {
    super(message);
    this.name = 'GeminiProviderError';
  }
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Gemini's JSON Schema field accepts standard JSON Schema unions (unlike the
// protobuf responseSchema `type` enum, which rejected nullable properties).
const RESPONSE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    classes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          subject: { type: 'string' },
          course_code: { type: ['string', 'null'] },
          day: { type: 'string', enum: DAY_NAMES },
          start_time: { type: 'string' },
          end_time: { type: 'string' },
          room: { type: ['string', 'null'] },
          lecturer: { type: ['string', 'null'] },
        },
        required: ['subject', 'course_code', 'day', 'start_time', 'end_time', 'room', 'lecturer'],
        additionalProperties: false,
      },
    },
  },
  required: ['classes'],
  additionalProperties: false,
};

const SCANNER_INSTRUCTIONS = `Read the uploaded university timetable by understanding its visual grid, row and column headers, cell positions, merged cells, and time slots. Extract every identifiable class and associate it with the correct day and complete time range. Return one class per actual meeting; combine adjacent slots only when they clearly belong to the same class. Preserve subject names and course codes as printed. Include room and lecturer when visible. Never guess: use null for unavailable course code, room, or lecturer. Skip empty cells, breaks, and unreadable entries that have no identifiable subject. Times must use 24-hour HH:mm. Return only the requested JSON object.`;

export const geminiTimetableProvider: TimetableScannerProvider = {
  async extract(file) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new GeminiProviderError('Gemini API key is not configured.', 'MISSING_API_KEY');

    const model = process.env.GEMINI_TIMETABLE_MODEL || 'gemini-3.1-flash-lite';
    const bytes = Buffer.from(await file.arrayBuffer()).toString('base64');
    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [
                { text: SCANNER_INSTRUCTIONS },
                { inlineData: { mimeType: file.type, data: bytes } },
              ],
            }],
            generationConfig: {
              responseMimeType: 'application/json',
              responseJsonSchema: RESPONSE_JSON_SCHEMA,
              temperature: 0,
            },
          }),
          signal: AbortSignal.timeout(60_000),
        }
      );
    } catch (error) {
      const code = error instanceof Error && error.name === 'TimeoutError' ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR';
      throw new GeminiProviderError('The Gemini request could not be completed.', code);
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null) as {
        error?: { status?: unknown; message?: unknown };
      } | null;
      const providerStatus = typeof errorBody?.error?.status === 'string' ? errorBody.error.status : 'UNKNOWN';
      const providerMessage = typeof errorBody?.error?.message === 'string'
        ? errorBody.error.message
            .replace(/AIza[\w-]{20,}/g, '[redacted]')
            .replace(/Bearer\s+\S+/gi, 'Bearer [redacted]')
            .replace(/[A-Za-z0-9+/=_-]{160,}/g, '[redacted]')
            .slice(0, 500)
        : 'No provider message was returned.';
      throw new GeminiProviderError(providerMessage, 'GEMINI_HTTP_ERROR', response.status, providerStatus);
    }
    let result: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    try {
      result = await response.json();
    } catch {
      throw new GeminiProviderError('Gemini returned an invalid API response envelope.', 'INVALID_API_RESPONSE', response.status);
    }
    const text = result.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim();
    if (!text) throw new GeminiProviderError('Gemini returned no structured response.', 'EMPTY_RESPONSE');

    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new GeminiProviderError('Gemini returned invalid JSON.', 'INVALID_JSON');
    }
  },
};
