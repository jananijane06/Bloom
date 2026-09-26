import { createClient } from '@/lib/supabase/client';
import { CalendarEvent, EventType } from '@/types/event';
import { TimetableClassRow } from '@/types/timetable';

export type TimetableCalendarPeriod = 'week' | 'month' | 'year';

interface CalendarEventRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  space_id: string;
  type: EventType;
  color: string | null;
  location: string | null;
  course_code: string | null;
  lecturer: string | null;
  is_all_day: boolean;
  is_recurring: boolean;
  timetable_class_id: string | null;
  timetable_period_start: string | null;
  timetable_period_end: string | null;
  created_at: string;
}

interface EventWindow {
  start: string;
  end: string;
}

function requireUserId(userId?: string | null): string {
  if (!userId) throw new Error('Sign in to add timetable classes to your Calendar.');
  return userId;
}

function localDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function getPeriodWindow(period: TimetableCalendarPeriod, now = new Date()): EventWindow {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  let start = today;
  let end: Date;
  if (period === 'week') {
    start = new Date(today);
    start.setDate(start.getDate() - start.getDay());
    end = new Date(start);
    end.setDate(end.getDate() + 6);
  } else if (period === 'month') {
    start = new Date(today.getFullYear(), today.getMonth(), 1, 12);
    end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 12);
  } else {
    const targetMonth = today.getMonth() + 12;
    const targetEnd = new Date(today.getFullYear(), targetMonth, today.getDate(), 12);
    targetEnd.setDate(targetEnd.getDate() - 1);
    end = targetEnd;
  }
  return { start: localDate(start), end: localDate(end) };
}

function eventType(category: string): EventType {
  if (category === 'focus' || category === 'wellness' || category === 'class') return category;
  return 'personal';
}

function toEvent(row: CalendarEventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    startDate: row.start_date,
    startTime: row.start_time.slice(0, 5),
    endDate: row.end_date,
    endTime: row.end_time.slice(0, 5),
    spaceId: row.space_id,
    type: row.type,
    color: row.color ?? undefined,
    location: row.location ?? undefined,
    courseCode: row.course_code ?? undefined,
    lecturer: row.lecturer ?? undefined,
    isAllDay: row.is_all_day,
    isRecurring: row.is_recurring,
    sourceTimetableClassId: row.timetable_class_id ?? undefined,
  };
}

function toOccurrence(
  timetableClass: TimetableClassRow,
  userId: string,
  date: string,
  window: EventWindow
) {
  return {
    user_id: userId,
    title: timetableClass.subject,
    description: null,
    start_date: date,
    start_time: timetableClass.start_time,
    end_date: date,
    end_time: timetableClass.end_time,
    space_id: 'personal',
    type: eventType(timetableClass.category),
    color: null,
    location: timetableClass.room,
    course_code: timetableClass.course_code,
    lecturer: timetableClass.lecturer,
    is_all_day: false,
    is_recurring: false,
    timetable_class_id: timetableClass.id,
    timetable_period_start: window.start,
    timetable_period_end: window.end,
  };
}

function datesForClass(row: TimetableClassRow, window: EventWindow): string[] {
  const dates: string[] = [];
  const current = parseLocalDate(window.start);
  const last = parseLocalDate(window.end);
  while (current <= last) {
    if (current.getDay() === row.day_of_week) dates.push(localDate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export async function fetchCalendarEvents(userId?: string | null): Promise<CalendarEvent[]> {
  if (!userId) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: true })
    .order('start_time', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as CalendarEventRow[]).map(toEvent);
}

type ManualCalendarEventInput = Pick<CalendarEvent, 'title' | 'description' | 'startDate' | 'startTime' | 'endTime' | 'spaceId' | 'type' | 'location'> & {
  endDate?: string;
};

function toManualEventRow(event: ManualCalendarEventInput, userId: string) {
  return {
    user_id: userId,
    title: event.title.trim(),
    description: event.description?.trim() || null,
    start_date: event.startDate,
    start_time: event.startTime,
    end_date: event.endDate ?? event.startDate,
    end_time: event.endTime,
    space_id: event.spaceId || 'personal',
    type: event.type,
    color: null,
    location: event.location?.trim() || null,
    course_code: null,
    lecturer: null,
    is_all_day: false,
    is_recurring: false,
    timetable_class_id: null,
    timetable_period_start: null,
    timetable_period_end: null,
  };
}

export async function createManualCalendarEvent(
  event: ManualCalendarEventInput,
  userId?: string | null
): Promise<CalendarEvent> {
  const ownerId = requireUserId(userId);
  const supabase = createClient();
  const { data, error } = await supabase
    .from('calendar_events')
    .insert(toManualEventRow(event, ownerId))
    .select('*')
    .single();
  if (error) throw error;
  return toEvent(data as unknown as CalendarEventRow);
}

export async function updateManualCalendarEvent(
  id: string,
  event: ManualCalendarEventInput,
  userId?: string | null
): Promise<CalendarEvent> {
  const ownerId = requireUserId(userId);
  const supabase = createClient();
  const { data, error } = await supabase
    .from('calendar_events')
    .update(toManualEventRow(event, ownerId))
    .eq('id', id)
    .eq('user_id', ownerId)
    .is('timetable_class_id', null)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('This manual Calendar event could not be found or is not yours to edit.');
  return toEvent(data as unknown as CalendarEventRow);
}

export async function deleteManualCalendarEvent(id: string, userId?: string | null): Promise<void> {
  const ownerId = requireUserId(userId);
  const supabase = createClient();
  const { data, error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
    .eq('user_id', ownerId)
    .is('timetable_class_id', null)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('This manual Calendar event could not be found or is not yours to delete.');
}

/** Add concrete, dated occurrences. The database unique key makes retries idempotent. */
export async function addTimetableClassesToCalendar(
  classes: TimetableClassRow[],
  period: TimetableCalendarPeriod,
  userId?: string | null
): Promise<CalendarEvent[]> {
  const ownerId = requireUserId(userId);
  if (classes.length === 0) return [];

  const supabase = createClient();
  const requestedWindow = getPeriodWindow(period);
  const classIds = classes.map((row) => row.id);
  const { data: existingRows, error: readError } = await supabase
    .from('calendar_events')
    .select('timetable_class_id,timetable_period_start,timetable_period_end')
    .eq('user_id', ownerId)
    .in('timetable_class_id', classIds);
  if (readError) throw readError;

  // Preserve the full period already scheduled for each class when a user
  // adds a broader range later (for example, month after week). The unique
  // occurrence index still ensures that each dated class appears only once.
  const windowsByClass = new Map<string, EventWindow>();
  classes.forEach((row) => windowsByClass.set(row.id, { ...requestedWindow }));
  ((existingRows ?? []) as Array<Pick<CalendarEventRow, 'timetable_class_id' | 'timetable_period_start' | 'timetable_period_end'>>)
    .forEach((event) => {
      if (!event.timetable_class_id || !event.timetable_period_start || !event.timetable_period_end) return;
      const current = windowsByClass.get(event.timetable_class_id);
      if (!current) return;
      windowsByClass.set(event.timetable_class_id, {
        start: event.timetable_period_start < current.start ? event.timetable_period_start : current.start,
        end: event.timetable_period_end > current.end ? event.timetable_period_end : current.end,
      });
    });

  const occurrences = classes.flatMap((row) => {
    const window = windowsByClass.get(row.id) ?? requestedWindow;
    return datesForClass(row, window).map((date) => toOccurrence(row, ownerId, date, window));
  });
  if (occurrences.length === 0) return [];

  const { data, error } = await supabase
    .from('calendar_events')
    .upsert(occurrences, {
      onConflict: 'user_id,timetable_class_id,start_date,start_time',
    })
    .select('*');
  if (error) throw error;
  return ((data ?? []) as unknown as CalendarEventRow[]).map(toEvent);
}

/** Keep existing occurrences aligned with an edited weekly class, without touching manual events. */
export async function syncTimetableCalendarEvents(
  timetableClass: TimetableClassRow,
  userId?: string | null
): Promise<void> {
  const ownerId = requireUserId(userId);
  const supabase = createClient();
  const { data, error } = await supabase
    .from('calendar_events')
    .select('id,start_date,start_time,timetable_period_start,timetable_period_end')
    .eq('user_id', ownerId)
    .eq('timetable_class_id', timetableClass.id);
  if (error) throw error;

  const existing = (data ?? []) as Array<Pick<CalendarEventRow, 'id' | 'start_date' | 'start_time' | 'timetable_period_start' | 'timetable_period_end'>>;
  if (existing.length === 0) return;

  const windows = new Map<string, EventWindow>();
  existing.forEach((event) => {
    if (event.timetable_period_start && event.timetable_period_end) {
      windows.set(`${event.timetable_period_start}|${event.timetable_period_end}`, {
        start: event.timetable_period_start,
        end: event.timetable_period_end,
      });
    }
  });

  const dateWindows = new Map<string, EventWindow>();
  windows.forEach((window) => datesForClass(timetableClass, window).forEach((date) => {
    if (!dateWindows.has(date)) dateWindows.set(date, window);
  }));

  const upserts = Array.from(dateWindows, ([date, window]) => toOccurrence(timetableClass, ownerId, date, window));
  if (upserts.length > 0) {
    const { error: upsertError } = await supabase
      .from('calendar_events')
      .upsert(upserts, { onConflict: 'user_id,timetable_class_id,start_date,start_time' });
    if (upsertError) throw upsertError;
  }

  const targetKeys = new Set(upserts.map((event) => `${event.start_date}|${event.start_time}`));
  const staleIds = existing.filter((event) => !targetKeys.has(`${event.start_date}|${event.start_time}`)).map((event) => event.id);
  if (staleIds.length > 0) {
    const { error: deleteError } = await supabase
      .from('calendar_events')
      .delete()
      .eq('user_id', ownerId)
      .eq('timetable_class_id', timetableClass.id)
      .in('id', staleIds);
    if (deleteError) throw deleteError;
  }
}
