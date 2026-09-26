import { ScannedTimetable, ScannedTimetableClass, WEEKDAYS } from '@/types/timetable';

const CLASS_KEYS = new Set([
  'subject',
  'course_code',
  'day',
  'start_time',
  'end_time',
  'room',
  'lecturer',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nullableText(value: unknown, field: string, maxLength: number): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') throw new Error(`Invalid ${field}.`);
  const clean = value.trim();
  if (!clean) return null;
  if (clean.length > maxLength) throw new Error(`Invalid ${field}.`);
  return clean;
}

function parseClass(value: unknown, index: number): ScannedTimetableClass {
  if (!isRecord(value) || Object.keys(value).some((key) => !CLASS_KEYS.has(key))) {
    throw new Error(`Class ${index + 1} has an unexpected structure.`);
  }

  for (const key of Array.from(CLASS_KEYS)) {
    if (!(key in value)) throw new Error(`Class ${index + 1} is missing ${key}.`);
  }

  const subject = nullableText(value.subject, 'subject', 180);
  const courseCode = nullableText(value.course_code, 'course code', 80);
  const room = nullableText(value.room, 'room', 120);
  const lecturer = nullableText(value.lecturer, 'lecturer', 160);
  const day = value.day;
  const startTime = value.start_time;
  const endTime = value.end_time;

  if (!subject) throw new Error(`Class ${index + 1} needs a subject.`);
  if (typeof day !== 'string' || !WEEKDAYS.includes(day as (typeof WEEKDAYS)[number])) {
    throw new Error(`Class ${index + 1} has an invalid day.`);
  }
  if (
    typeof startTime !== 'string' ||
    typeof endTime !== 'string' ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime) ||
    startTime >= endTime
  ) {
    throw new Error(`Class ${index + 1} has an invalid time range.`);
  }

  return {
    subject,
    course_code: courseCode,
    day: day as ScannedTimetableClass['day'],
    start_time: startTime,
    end_time: endTime,
    room,
    lecturer,
  };
}

/** Runtime validation and normalization for untrusted model or user-edited data. */
export function parseScannedTimetable(value: unknown): ScannedTimetable {
  if (!isRecord(value) || Object.keys(value).some((key) => key !== 'classes')) {
    throw new Error('The timetable response has an unexpected structure.');
  }
  if (!Array.isArray(value.classes) || value.classes.length > 200) {
    throw new Error('The timetable response contains an invalid class list.');
  }

  return { classes: value.classes.map((item, index) => parseClass(item, index)) };
}
