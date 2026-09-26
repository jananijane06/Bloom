export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type Weekday = (typeof WEEKDAYS)[number];
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type TimetableCategory = 'class' | 'focus' | 'wellness' | 'routine';

export interface ScannedTimetableClass {
  subject: string;
  course_code: string | null;
  day: Weekday;
  start_time: string;
  end_time: string;
  room: string | null;
  lecturer: string | null;
}

export interface ScannedTimetable {
  classes: ScannedTimetableClass[];
}

export interface TimetableClassRow {
  id: string;
  user_id: string;
  subject: string;
  course_code: string | null;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  room: string | null;
  lecturer: string | null;
  category: TimetableCategory | string;
  created_at: string;
  updated_at: string;
}

export interface TimetableClassInsert {
  subject: string;
  course_code?: string | null;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  room?: string | null;
  lecturer?: string | null;
  category?: TimetableCategory;
}

export const WEEKDAY_NUMBER: Record<Weekday, DayOfWeek> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  Sunday: 'Sun',
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
};

export const SHORT_DAY_TO_NUMBER: Record<string, DayOfWeek> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export const NUMBER_TO_SHORT_DAY: Record<DayOfWeek, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};
