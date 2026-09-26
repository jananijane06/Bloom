export type EventType = 'meeting' | 'focus' | 'personal' | 'wellness' | 'class' | 'deadline';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  endTime: string;   // HH:mm (24h)
  endDate?: string;  // YYYY-MM-DD (defaults to startDate)
  spaceId: string;
  type: EventType;
  color?: string; // hex or tailwind token
  location?: string;
  courseCode?: string;
  lecturer?: string;
  sourceTimetableClassId?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
}
