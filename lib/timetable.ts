import { createClient } from '@/lib/supabase/client';
import {
  DayOfWeek,
  ScannedTimetableClass,
  TimetableClassInsert,
  TimetableClassRow,
  WEEKDAY_NUMBER,
} from '@/types/timetable';

export type TimetablePersistenceIssue = 'table_missing' | 'permission_denied' | 'save_failed';

export class TimetablePersistenceError extends Error {
  constructor(readonly issue: TimetablePersistenceIssue) {
    super(timetablePersistenceMessage(issue));
    this.name = 'TimetablePersistenceError';
  }
}

export function timetablePersistenceMessage(issue: TimetablePersistenceIssue): string {
  if (issue === 'table_missing') {
    return 'The timetable table is not available in Supabase yet. Apply the migration supabase/migrations/20260926000000_create_timetable_classes.sql, then try again.';
  }
  if (issue === 'permission_denied') {
    return 'Supabase denied access to your timetable. Check that you are signed in and that the timetable owner policies are applied.';
  }
  return 'Bloom could not save that timetable block. Please try again.';
}

function persistenceError(code?: string | null): TimetablePersistenceError {
  if (code === 'PGRST205' || code === '42P01') return new TimetablePersistenceError('table_missing');
  if (code === '42501' || code === 'PGRST301') return new TimetablePersistenceError('permission_denied');
  return new TimetablePersistenceError('save_failed');
}

function requireUserId(userId?: string | null): string {
  if (!userId) throw new Error('Sign in to manage your timetable.');
  return userId;
}

function normalizeTime(value: string): string {
  return value.slice(0, 5);
}

function classKey(row: {
  subject: string;
  course_code?: string | null;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  room?: string | null;
}): string {
  return [
    row.subject.trim().toLowerCase(),
    row.course_code?.trim().toLowerCase() ?? '',
    row.day_of_week,
    normalizeTime(row.start_time),
    normalizeTime(row.end_time),
    row.room?.trim().toLowerCase() ?? '',
  ].join('|');
}

export async function fetchTimetableClasses(userId?: string | null): Promise<TimetableClassRow[]> {
  if (!userId) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from('timetable_classes')
    .select('*')
    .eq('user_id', userId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw persistenceError(error.code);
  return (data ?? []) as unknown as TimetableClassRow[];
}

/** Resolve already-persisted rows for confirmed scanner/manual inputs. */
export async function fetchMatchingTimetableClasses(
  rows: TimetableClassInsert[],
  userId?: string | null
): Promise<TimetableClassRow[]> {
  if (rows.length === 0) return [];
  const expected = new Set(rows.map(classKey));
  const existing = await fetchTimetableClasses(userId);
  return existing.filter((row) => expected.has(classKey(row)));
}

/** Save confirmed or manually entered classes, skipping exact schedule duplicates. */
export async function createTimetableClasses(
  rows: TimetableClassInsert[],
  userId?: string | null
): Promise<TimetableClassRow[]> {
  const ownerId = requireUserId(userId);
  if (rows.length === 0) return [];

  const supabase = createClient();
  const { data: existingData, error: readError } = await supabase
    .from('timetable_classes')
    .select('subject,course_code,day_of_week,start_time,end_time,room')
    .eq('user_id', ownerId);

  if (readError) throw persistenceError(readError.code);

  const seen = new Set(
    ((existingData ?? []) as unknown as TimetableClassInsert[]).map(classKey)
  );
  const uniqueRows = rows.filter((row) => {
    const key = classKey(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (uniqueRows.length === 0) return [];

  const { data, error } = await supabase
    .from('timetable_classes')
    .insert(uniqueRows.map((row) => ({ ...row, user_id: ownerId })))
    .select('*');

  if (error) throw persistenceError(error.code);
  return (data ?? []) as unknown as TimetableClassRow[];
}

/** Update a timetable class in place, scoped to its authenticated owner. */
export async function updateTimetableClass(
  id: string,
  row: TimetableClassInsert,
  userId?: string | null
): Promise<TimetableClassRow> {
  const ownerId = requireUserId(userId);
  const supabase = createClient();
  const { data, error } = await supabase
    .from('timetable_classes')
    .update({ ...row, user_id: ownerId })
    .eq('id', id)
    .eq('user_id', ownerId)
    .select('*')
    .maybeSingle();

  if (error) throw persistenceError(error.code);
  if (!data) throw new TimetablePersistenceError('permission_denied');
  return data as unknown as TimetableClassRow;
}

/** Delete a timetable class in place, scoped to its authenticated owner. */
export async function deleteTimetableClass(id: string, userId?: string | null): Promise<void> {
  const ownerId = requireUserId(userId);
  const supabase = createClient();
  const { data, error } = await supabase
    .from('timetable_classes')
    .delete()
    .eq('id', id)
    .eq('user_id', ownerId)
    .select('id')
    .maybeSingle();

  if (error) throw persistenceError(error.code);
  if (!data) throw new TimetablePersistenceError('permission_denied');
}

export function scannedClassToInsert(scanned: ScannedTimetableClass): TimetableClassInsert {
  return {
    subject: scanned.subject.trim(),
    course_code: scanned.course_code?.trim() || null,
    day_of_week: WEEKDAY_NUMBER[scanned.day],
    start_time: scanned.start_time,
    end_time: scanned.end_time,
    room: scanned.room?.trim() || null,
    lecturer: scanned.lecturer?.trim() || null,
    category: 'class',
  };
}
