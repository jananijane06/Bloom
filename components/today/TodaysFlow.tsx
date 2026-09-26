"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchTimetableClasses } from "@/lib/timetable";
import { fetchTasksFromSupabase } from "@/lib/tasks";
import { fetchCalendarEvents } from "@/lib/calendarEvents";
import { fetchUserSpaces } from "@/lib/spaces";
import { TimetableClassRow } from "@/types/timetable";
import { CalendarEvent } from "@/types/event";
import { Task } from "@/types/task";
import { Space } from "@/types/space";
import { useTodayDate } from "@/components/today/TodayDateContext";

interface TimelineItem {
  id: string;
  time: string | null;
  title: string;
  description?: string;
  category: string;
  completed?: boolean;
}

function dateFromKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function formatTime(value: string | null): string {
  if (!value) return "Anytime";
  const [hours, minutes] = value.split(":").map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
}

export default function TodaysFlow() {
  const { user } = useAuth();
  const { selectedDate } = useTodayDate();
  const [classes, setClasses] = useState<TimetableClassRow[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMounted, setHasMounted] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) {
      setClasses([]); setEvents([]); setTasks([]); setSpaces([]); setLoading(false); return;
    }
    setLoading(true);
    try {
      const [classRows, calendarRows, taskRows, spaceRows] = await Promise.all([
        fetchTimetableClasses(user.id), fetchCalendarEvents(user.id),
        fetchTasksFromSupabase(user.id), fetchUserSpaces(user.id),
      ]);
      setClasses(classRows); setEvents(calendarRows); setTasks(taskRows); setSpaces(spaceRows); setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the day's schedule.");
    } finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setHasMounted(true); }, []);
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    window.addEventListener("focus", refresh); document.addEventListener("visibilitychange", refresh);
    return () => { window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [load]);

  const timeline = useMemo(() => {
    const selectedWeekday = dateFromKey(selectedDate).getDay();
    const dayClasses = classes.filter((item) => item.day_of_week === selectedWeekday);
    const items: TimelineItem[] = [
      ...tasks.filter((task) => task.status !== "archived" && task.due_date?.slice(0, 10) === selectedDate).map((task) => {
        const spaceName = spaces.find((space) => space.id === task.space_id)?.name;
        return {
          id: `task-${task.id}`, time: task.due_time?.slice(0, 5) ?? null, title: task.title,
          description: ["Task", spaceName, task.priority && `${task.priority} priority`, task.estimated_minutes && `${task.estimated_minutes} min`, ...(task.tags ?? [])].filter(Boolean).join(" | "),
          category: "Task", completed: task.completed || task.status === "completed",
        };
      }),
      ...events.filter((event) => event.startDate === selectedDate && (!event.sourceTimetableClassId || !dayClasses.some((item) => item.id === event.sourceTimetableClassId))).map((event) => ({
        id: `event-${event.id}`, time: event.isAllDay ? null : event.startTime, title: event.title,
        description: ["Calendar event", event.location, event.courseCode, event.description].filter(Boolean).join(" | "),
        category: event.type,
      })),
      ...dayClasses.map((item) => ({
        id: `class-${item.id}`, time: item.start_time.slice(0, 5), title: item.subject,
        description: [item.category === "class" ? "Lecture" : "Timetable", item.course_code, item.room, item.end_time.slice(0, 5)].filter(Boolean).join(" | "),
        category: "Class",
      })),
    ];
    return items.sort((a, b) => {
      if (!a.time && b.time) return 1;
      if (a.time && !b.time) return -1;
      return (a.time ?? "").localeCompare(b.time ?? "");
    });
  }, [selectedDate, classes, events, tasks, spaces]);
  const timedItems = timeline.filter((item) => item.time !== null);
  const formattedDate = hasMounted && selectedDate ? dateFromKey(selectedDate).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" }) : "Loading date";

  return <section className="glass-card flex h-full flex-col justify-between rounded-[24px] p-5 sm:rounded-[30px] sm:p-7">
    <div>
      <div className="mb-4 flex items-center justify-between gap-2 sm:mb-6">
        <div><h2 className="text-[17px] font-bold text-on-surface sm:text-[18px]">Today's Flow</h2><p className="text-[11px] text-outline sm:text-[12px]">{formattedDate}</p></div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-white/60 text-primary shadow-sm sm:h-9 sm:w-9"><span className="material-symbols-outlined text-[18px]">spa</span></div>
      </div>
      {loading || !selectedDate ? <p className="text-sm text-outline">Loading your schedule…</p> : error ? <p role="alert" className="text-sm text-primary">{error}</p> : timeline.length === 0 ? <p className="py-4 text-sm text-on-surface-variant">Nothing scheduled yet.</p> : <div className="flex flex-col gap-2.5 sm:gap-3">
        {timeline.map((item) => <div key={item.id} className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/70 bg-white/45 p-3 sm:gap-4 sm:p-4">
          <span className="w-11 shrink-0 text-[10px] font-semibold text-outline sm:w-12 sm:text-[11px]">{formatTime(item.time)}</span>
          <span className={`h-9 w-1 shrink-0 rounded-full ${item.category === "Task" ? "bg-[#B85C7A]" : item.category === "Class" ? "bg-primary" : "bg-[#D9829B]"}`} />
          <div className="min-w-0 flex-1"><p className={`break-words text-[12px] font-bold sm:text-[13px] ${item.completed ? "text-outline line-through" : "text-on-surface"}`}>{item.title}</p>{item.description && <p className="break-words text-[10px] text-outline sm:text-[11px]">{item.description}</p>}</div>
        </div>)}
      </div>}
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/60 pt-3 text-[12px]">
      <span className="text-outline">{timeline.length} {timeline.length === 1 ? "item" : "items"}</span>
      {timeline.length === 0 && !loading && <Link href="/timetable" className="font-semibold text-primary hover:underline">Add to your day</Link>}
      {timedItems[0] && <span className="font-semibold text-primary">Next: {timedItems[0].title} · {timedItems[0].time}</span>}
    </div>
  </section>;
}
