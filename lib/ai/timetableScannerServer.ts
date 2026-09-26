import { ScannedTimetable } from '@/types/timetable';
import { TimetableScannerProvider } from '@/lib/ai/provider';
import { geminiTimetableProvider } from '@/lib/ai/providers/gemini';
import { parseScannedTimetable } from '@/lib/ai/timetableSchema';
import { GeminiProviderError } from '@/lib/ai/providers/gemini';

export class TimetableOutputValidationError extends Error {
  constructor() {
    super('The model response did not match the timetable schema.');
    this.name = 'TimetableOutputValidationError';
  }
}

function getProvider(): TimetableScannerProvider {
  const providerName = process.env.TIMETABLE_AI_PROVIDER || 'gemini';
  if (providerName === 'gemini') return geminiTimetableProvider;
  throw new Error('SCANNER_NOT_CONFIGURED');
}

export async function extractTimetable(file: File): Promise<ScannedTimetable> {
  const untrustedResult = await getProvider().extract(file);
  try {
    return parseScannedTimetable(untrustedResult);
  } catch {
    throw new TimetableOutputValidationError();
  }
}

export { GeminiProviderError };
