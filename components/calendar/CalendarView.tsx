'use client';

import React, { useState, useMemo } from 'react';
import { CalendarEvent } from '@/types/event';
import { Space } from '@/types/space';
import { Task } from '@/types/task';
import { getMonthDays, getTodayISO, DAYS_OF_WEEK } from '@/lib/dates';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { EventCard } from './EventCard';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { AddTask } from '@/components/tasks/AddTask';

export interface CalendarViewProps {
  events: CalendarEvent[];
  tasks: Task[];
  spaces: Space[];
  onAddEvent: (event: CalendarEvent) => Promise<CalendarEvent>;
  onUpdateEvent: (event: CalendarEvent) => Promise<CalendarEvent>;
  onDeleteEvent: (id: string) => Promise<void>;
  onAddTask?: (task: Task) => void;
}

type CalendarItem =
  | { kind: 'event'; id: string; date: string; title: string; event: CalendarEvent }
  | { kind: 'task'; id: string; date: string; title: string; task: Task };

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  tasks,
  spaces,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onAddTask,
}) => {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventError, setEventError] = useState('');
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CalendarEvent['type']>('focus');
  const [newSpaceId, setNewSpaceId] = useState(spaces[0]?.id || 'personal');
  const [newDate, setNewDate] = useState(selectedDate);
  const [newStartTime, setNewStartTime] = useState('10:00');
  const [newEndTime, setNewEndTime] = useState('11:00');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const spacesMap = useMemo(() => {
    return new Map(spaces.map((s) => [s.id, s.name]));
  }, [spaces]);

  const calendarItems = useMemo<CalendarItem[]>(() => [
    ...events.map((event) => ({
      kind: 'event' as const,
      id: event.id,
      date: event.startDate,
      title: event.title,
      event,
    })),
    ...tasks.flatMap((task) =>
      task.due_date
        ? [{
            kind: 'task' as const,
            id: task.id,
            date: task.due_date,
            title: task.title,
            task,
          }]
        : []
    ),
  ], [events, tasks]);

  const daysInGrid = useMemo(() => {
    return getMonthDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(getTodayISO());
  };

  const selectedDateEvents = useMemo(() => {
    return calendarItems.filter((item) => item.date === selectedDate);
  }, [calendarItems, selectedDate]);

  const openCreateEvent = () => {
    setEditingEvent(null);
    setNewTitle('');
    setNewType('focus');
    setNewSpaceId(spaces[0]?.id || 'personal');
    setNewDate(selectedDate);
    setNewStartTime('10:00');
    setNewEndTime('11:00');
    setNewLocation('');
    setNewDescription('');
    setEventError('');
    setIsAddOpen(true);
  };

  const openEditEvent = (event: CalendarEvent) => {
    if (event.sourceTimetableClassId) return;
    setEditingEvent(event);
    setNewTitle(event.title);
    setNewType(event.type);
    setNewSpaceId(event.spaceId || 'personal');
    setNewDate(event.startDate);
    setNewStartTime(event.startTime);
    setNewEndTime(event.endTime);
    setNewLocation(event.location ?? '');
    setNewDescription(event.description ?? '');
    setEventError('');
    setIsAddOpen(true);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(newStartTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(newEndTime) || newStartTime >= newEndTime) {
      setEventError('Choose a valid time range. The end time must be later than the start time.');
      return;
    }

    const newEvent: CalendarEvent = {
      id: editingEvent?.id ?? `manual-${generateId()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      startDate: newDate,
      endDate: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      spaceId: newSpaceId,
      type: newType,
      location: newLocation.trim() || undefined,
    };

    setIsSavingEvent(true);
    setEventError('');
    try {
      if (editingEvent) await onUpdateEvent(newEvent);
      else await onAddEvent(newEvent);
      setSelectedDate(newDate);
      const date = new Date(`${newDate}T12:00:00`);
      setCurrentYear(date.getFullYear());
      setCurrentMonth(date.getMonth());
      setIsAddOpen(false);
      setEditingEvent(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setEventError(message && !message.includes('fetch failed')
        ? `Bloom could not save that event: ${message}`
        : 'Bloom could not save that event. Check your connection and sign-in, then try again.');
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    if (event.sourceTimetableClassId) return;
    if (!window.confirm(`Delete “${event.title}” from your Calendar?`)) return;
    setEventError('');
    try {
      await onDeleteEvent(event.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setEventError(message && !message.includes('fetch failed')
        ? `Bloom could not delete that event: ${message}`
        : 'Bloom could not delete that event. Check your connection and sign-in, then try again.');
    }
  };

  return (
    <div className="space-y-6">
      {eventError && <p role="alert" className="rounded-xl border border-[#B85C7A]/25 bg-white/70 px-4 py-3 text-sm text-primary">{eventError}</p>}
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <div className="flex items-center gap-1 bg-white/70 border border-white/80 rounded-full p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1.5 hover:bg-white rounded-full text-on-surface-variant transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToday}
              className="px-3 py-1 text-xs font-semibold text-on-surface hover:bg-white rounded-full transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1.5 hover:bg-white rounded-full text-on-surface-variant transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-4 h-4 text-primary" />}
            onClick={() => setIsAddTaskOpen(true)}
          >
            Plant Task
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateEvent}
          >
            Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Monthly Grid */}
        <GlassCard className="lg:col-span-2 p-5 sm:p-6 shadow-sm">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-[11px] font-bold uppercase tracking-wider text-outline py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {daysInGrid.map((day, idx) => {
              const dayEvents = calendarItems.filter((item) => item.date === day.date);
              const isSelected = selectedDate === day.date;
              const isTodayCell = day.date === getTodayISO();

              return (
                <button
                  key={`${day.date}-${idx}`}
                  onClick={() => setSelectedDate(day.date)}
                  className={cn(
                    'min-h-[70px] sm:min-h-[84px] p-2 rounded-2xl border flex flex-col items-start justify-between text-left transition-all duration-200',
                    isSelected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm'
                      : day.isCurrentMonth
                      ? 'border-white/70 bg-white/40 hover:bg-white/70'
                      : 'border-transparent opacity-35 hover:opacity-60 bg-white/20'
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold',
                        isTodayCell
                          ? 'berry-button text-white shadow-sm'
                          : isSelected
                          ? 'text-primary font-bold'
                          : 'text-on-surface'
                      )}
                    >
                      {day.dayNumber}
                    </span>
                      {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-primary px-1.5 rounded-full bg-primary/10">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Micro event indicators */}
                  <div className="w-full space-y-1 mt-1">
                    {dayEvents.slice(0, 2).map((item) => (
                      <div
                        key={`${item.kind}-${item.id}`}
                        className="truncate text-[10px] font-medium px-1.5 py-0.5 rounded-lg bg-white/80 text-on-surface shadow-xs"
                      >
                        {item.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-outline font-medium pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Selected Day Agenda Sidebar */}
        <div className="space-y-4">
          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/60">
              <div>
                <h3 className="text-sm font-bold text-on-surface">
                  Agenda for {selectedDate}
                </h3>
                <p className="text-[11px] text-outline">
                  {selectedDateEvents.length} items scheduled
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5 text-primary" />}
                  onClick={() => setIsAddTaskOpen(true)}
                  title="Plant task for this day"
                >
                  Task
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={openCreateEvent}
                  title="Schedule session for this day"
                >
                  Session
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {selectedDateEvents.length === 0 ? (
                <div className="py-8 text-center text-outline text-xs">
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-primary" />
                  No events on this day.
                  <br />
                  A peaceful window for deep rest or study.
                </div>
              ) : (
                selectedDateEvents.map((item) =>
                  item.kind === 'event' ? (
                    <EventCard
                      key={`event-${item.id}`}
                      event={item.event}
                      spaceName={spacesMap.get(item.event.spaceId)}
                      onEdit={item.event.sourceTimetableClassId ? undefined : () => openEditEvent(item.event)}
                      onDelete={item.event.sourceTimetableClassId ? undefined : () => void handleDeleteEvent(item.event)}
                    />
                  ) : (
                    <EventCard
                      key={`task-${item.id}`}
                      task={item.task}
                      spaceName={item.task.space_id ? spacesMap.get(item.task.space_id) : undefined}
                    />
                  )
                )
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => !isSavingEvent && setIsAddOpen(false)}
        title={editingEvent ? 'Edit Calendar event' : 'Add an event'}
        description={editingEvent ? 'Make a change to this part of your day.' : 'Add a personal event to your Calendar.'}
      >
        <form onSubmit={(event) => void handleCreateEvent(event)} className="space-y-4 pt-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Networks Protocol Lab"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 border border-white/80 text-[13px] text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5">Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 border border-white/80 text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as CalendarEvent['type'])}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 border border-white/80 text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
              >
                <option value="focus">Focus time</option>
                <option value="meeting">Meeting</option>
                <option value="wellness">Wellbeing</option>
                <option value="personal">Personal</option>
                <option value="class">Study / class</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Space
              </label>
              <select
                value={newSpaceId}
                onChange={(e) => setNewSpaceId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 border border-white/80 text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
              >
                <option value="personal">Personal</option>
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5">
              Location / Link (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Science Block Room 402, Google Meet"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 border border-white/80 text-[13px] text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5">Description (Optional)</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              className="w-full resize-y px-3.5 py-2.5 rounded-2xl bg-white/70 border border-white/80 text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
          </div>

          {eventError && <p role="alert" className="rounded-xl bg-[#F8E3E8]/70 px-3 py-2 text-xs text-primary">{eventError}</p>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" disabled={isSavingEvent} onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSavingEvent}>
              {editingEvent ? 'Save Changes' : 'Add Event'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Plant Task Modal for Calendar */}
      <AddTask
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        spaces={spaces}
        defaultDueDate={selectedDate}
        onAddTask={(newTask) => {
          onAddTask?.(newTask);
          setIsAddTaskOpen(false);
        }}
      />
    </div>
  );
};

export default CalendarView;
