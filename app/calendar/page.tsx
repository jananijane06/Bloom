'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { CalendarView } from '@/components/calendar/CalendarView';
import { CalendarEvent } from '@/types/event';
import { Task } from '@/types/task';
import { Space } from '@/types/space';
import { fetchTasks } from '@/lib/tasks';
import { fetchUserSpaces } from '@/lib/spaces';
import { createManualCalendarEvent, deleteManualCalendarEvent, fetchCalendarEvents, updateManualCalendarEvent } from '@/lib/calendarEvents';
import { useAuth } from '@/components/auth/AuthProvider';

export default function CalendarPage() {
  const { user, isLoading } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (isLoading) return;

    let active = true;
    Promise.all([
      fetchTasks({ userId: user?.id }),
      fetchUserSpaces(user?.id),
      fetchCalendarEvents(user?.id),
    ])
      .then(([loadedTasks, loadedSpaces, loadedEvents]) => {
        if (!active) return;
        setTasks(loadedTasks);
        setSpaces(loadedSpaces);
        setEvents(loadedEvents);
        setLoadError('');
      })
      .catch((error) => {
        console.error('Failed to load calendar tasks:', error);
        if (active) setLoadError('Bloom could not load your Calendar. Check your connection and try refreshing.');
      });

    return () => {
      active = false;
    };
  }, [isLoading, user?.id]);

  const handleAddEvent = async (newEvent: CalendarEvent) => {
    if (!user?.id) throw new Error('Sign in to save a Calendar event.');
    const saved = await createManualCalendarEvent(newEvent, user.id);
    setEvents((prev) => [...prev, saved]);
    return saved;
  };

  const handleUpdateEvent = async (updatedEvent: CalendarEvent) => {
    if (!user?.id) throw new Error('Sign in to edit a Calendar event.');
    const saved = await updateManualCalendarEvent(updatedEvent.id, updatedEvent, user.id);
    setEvents((prev) => prev.map((event) => event.id === saved.id ? saved : event));
    return saved;
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user?.id) throw new Error('Sign in to delete a Calendar event.');
    await deleteManualCalendarEvent(eventId, user.id);
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
  };

  const handleAddTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  return (
    <AppShell>
      {/* Ambient background */}
      <div className="bloom-ambient">
        <div className="bloom-glow-pink" />
        <div className="bloom-glow-peach" />
        <div className="bloom-glow-lilac" />
      </div>

      <div className="sanctuary-bg relative min-h-[calc(100vh-64px)] p-6 lg:p-8">
        <div className="relative z-10 mx-auto max-w-[1400px] space-y-6">
          {loadError && <p role="alert" className="rounded-xl border border-[#B85C7A]/25 bg-white/70 px-4 py-3 text-sm text-primary">{loadError}</p>}
          <div>
            <p className="editorial-label mb-2 text-primary">YOUR WEEK, AT A GLANCE</p>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">
              your week, at a glance
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Make space for what matters.
            </p>
          </div>

          <CalendarView
            events={events}
            tasks={tasks}
            spaces={spaces}
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onAddTask={handleAddTask}
          />
        </div>
      </div>
    </AppShell>
  );
}
