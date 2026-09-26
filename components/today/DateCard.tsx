"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchTimetableClasses } from "@/lib/timetable";
import { TimetableClassRow } from "@/types/timetable";
import { fetchCalendarEvents } from "@/lib/calendarEvents";
import { CalendarEvent } from "@/types/event";
import { localDateString } from "@/lib/dates";
import { useTodayDate } from "@/components/today/TodayDateContext";

function dateFromKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function keyFromDate(date: Date): string { return localDateString(date); }
function stableDateLabel(key: string, options: Intl.DateTimeFormatOptions): string {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
}

export default function DateCard() {
  const { user } = useAuth();
  const router = useRouter();
  const { selectedDate, setSelectedDate } = useTodayDate();
  const [classes, setClasses] = useState<TimetableClassRow[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const [hasMounted, setHasMounted] = useState(false);
  const selected = dateFromKey(selectedDate);
  const weekdayIndex = (selected.getDay() + 6) % 7;
  const weekStart = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() - weekdayIndex, 12);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index, 12);
    const key = localDateString(date);
    return {
      key,
      day: stableDateLabel(key, { weekday: "short" }).toUpperCase(),
      date: String(date.getDate()),
      isToday: key === localDateString(),
      isSelected: key === selectedDate,
      hasItems: classes.some((item) => item.day_of_week === date.getDay()) || events.some((item) => item.startDate === key),
    };
  });
  const monthStart = new Date(selected.getFullYear(), selected.getMonth(), 1, 12);
  const monthGridStart = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 - ((monthStart.getDay() + 6) % 7), 12);
  const monthDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(monthGridStart.getFullYear(), monthGridStart.getMonth(), monthGridStart.getDate() + index, 12);
    const key = keyFromDate(date);
    return { key, date: date.getDate(), inMonth: date.getMonth() === selected.getMonth(), isToday: key === localDateString(), hasItems: classes.some((item) => item.day_of_week === date.getDay()) || events.some((item) => item.startDate === key) };
  });

  const selectedWeekday = selected.getDay();
  const selectedClasses = classes.filter((item) => item.day_of_week === selectedWeekday).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const selectedEvents = events.filter((event) => event.startDate === selectedDate && (!event.sourceTimetableClassId || !selectedClasses.some((item) => item.id === event.sourceTimetableClassId)));
  const selectedItems = [
    ...selectedClasses.map((item) => ({ title: item.subject, time: item.start_time.slice(0, 5) })),
    ...selectedEvents.filter((event) => !event.isAllDay).map((event) => ({ title: event.title, time: event.startTime })),
  ].filter((item) => item.time >= (selectedDate === localDateString() ? new Date().toTimeString().slice(0, 5) : "00:00")).sort((a, b) => a.time.localeCompare(b.time));

  const load = useCallback(async () => {
    if (!user?.id) { setClasses([]); setEvents([]); return; }
    try {
      const [loadedClasses, loadedEvents] = await Promise.all([fetchTimetableClasses(user.id), fetchCalendarEvents(user.id)]);
      setClasses(loadedClasses); setEvents(loadedEvents);
    } catch { setClasses([]); setEvents([]); }
  }, [user?.id]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setHasMounted(true); }, []);
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    window.addEventListener("focus", refresh); document.addEventListener("visibilitychange", refresh);
    return () => { window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [load]);

  if (!hasMounted || !selectedDate) {
    return <section aria-busy="true" className="glass-card min-h-[190px] rounded-[24px] p-4 sm:rounded-[30px] sm:p-5"><p className="editorial-label text-primary">Your week</p><p className="mt-3 text-sm text-outline">Loading calendar…</p></section>;
  }

  return (
    <section className="glass-card relative flex h-full flex-col rounded-[24px] p-4 sm:rounded-[30px] sm:p-5">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-rose-300/20 blur-3xl" />
      <div className="relative z-10">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="editorial-label text-primary">Your week</p>
            <h2 className="editorial mt-0.5 text-[22px] leading-tight text-[#351A26] sm:text-[25px]">
              {stableDateLabel(selectedDate, { month: "long", day: "numeric" })}
            </h2>
          </div>
          <button type="button" onClick={() => router.push("/calendar")} aria-label="Open calendar" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/60 text-[#684653] shadow-sm transition hover:bg-white active:scale-95">
            <span className="material-symbols-outlined text-[17px]">calendar_month</span>
          </button>
        </div>

        <div className="mt-2.5 flex w-fit items-center rounded-full border border-white/70 bg-white/45 p-0.5">
          {(["weekly", "monthly"] as const).map((item) => <button key={item} type="button" onClick={() => setView(item)} className={`rounded-full px-3 py-1 text-[10px] font-semibold transition sm:text-[11px] ${view === item ? "bg-white text-primary shadow-sm" : "text-outline hover:text-on-surface"}`}>{item === "weekly" ? "Weekly" : "Monthly"}</button>)}
        </div>

        {view === "weekly" ? <div className="mt-3 grid grid-cols-[repeat(7,minmax(0,1fr))] gap-1 sm:gap-1.5">
          {days.map((item) => <button key={item.key} type="button" aria-label={`${item.day}, ${item.date}${item.isToday ? ", today" : ""}`} aria-pressed={item.isSelected} onClick={() => setSelectedDate(item.key)} className="group flex min-w-0 flex-col items-center gap-1 rounded-xl py-1 transition hover:bg-white/50">
            <span className={`text-[9px] font-semibold tracking-wide sm:text-[10px] ${item.isSelected ? "text-primary" : "text-outline"}`}>{item.day}</span>
            <span className={`relative flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold transition sm:h-9 sm:w-9 sm:text-[13px] ${item.isSelected ? "berry-button text-white shadow-sm" : item.isToday ? "border border-primary/25 bg-primary/5 text-primary" : "text-on-surface group-hover:bg-white/60"}`}>
              {item.date}
              {item.hasItems && <span className={`absolute -bottom-0.5 h-1 w-1 rounded-full ring-1 ring-white/80 ${item.isSelected ? "bg-white" : "bg-[#B85C7A]"}`} />}
            </span>
          </button>)}
        </div> : <div className="mt-3 rounded-2xl border border-white/70 bg-white/35 px-2.5 pb-2.5 pt-2 sm:px-3">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" aria-label="Previous month" onClick={() => setSelectedDate(keyFromDate(new Date(selected.getFullYear(), selected.getMonth() - 1, 1, 12)))} className="flex h-7 w-7 items-center justify-center rounded-full text-outline transition hover:bg-white/80 hover:text-primary">‹</button>
            <p className="text-[11px] font-semibold text-on-surface">{stableDateLabel(`${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, "0")}-01`, { month: "long", year: "numeric" })}</p>
            <button type="button" aria-label="Next month" onClick={() => setSelectedDate(keyFromDate(new Date(selected.getFullYear(), selected.getMonth() + 1, 1, 12)))} className="flex h-7 w-7 items-center justify-center rounded-full text-outline transition hover:bg-white/80 hover:text-primary">›</button>
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center">
            {["M", "T", "W", "T", "F", "S", "S"].map((label, index) => <span key={`${label}-${index}`} className="pb-1 text-[9px] font-semibold text-outline">{label}</span>)}
            {monthDays.map((item) => <button key={item.key} type="button" aria-label={stableDateLabel(item.key, { weekday: "long", month: "long", day: "numeric" })} aria-pressed={item.key === selectedDate} onClick={() => setSelectedDate(item.key)} className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-medium transition sm:h-9 sm:w-9 ${item.key === selectedDate ? "berry-button font-semibold text-white shadow-sm" : item.isToday ? "bg-primary/10 font-semibold text-primary ring-1 ring-primary/20" : item.inMonth ? "text-on-surface hover:bg-white/80" : "text-outline/35 hover:bg-white/50"}`}>{item.date}{item.hasItems && <span className={`absolute bottom-1 h-1 w-1 rounded-full ${item.key === selectedDate ? "bg-white" : "bg-primary"}`} />}</button>)}
          </div>
        </div>}
      </div>

      <div className="relative z-10 mt-3 border-t border-white/60 pt-2.5">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10"><span className="material-symbols-outlined text-[15px] text-primary">event</span></span>
            <div className="min-w-0"><p className="text-[11px] font-semibold text-on-surface">{selectedClasses.length + selectedEvents.length} {selectedClasses.length + selectedEvents.length === 1 ? "item" : "items"}</p><p className="text-[10px] text-outline">{stableDateLabel(selectedDate, { weekday: "long" })}</p></div>
          </div>
          <div className="min-w-0 text-right"><p className="text-[9px] text-outline">Next up</p><p className="break-words text-[10px] font-semibold leading-tight text-primary sm:text-[11px]">{selectedItems[0] ? `${selectedItems[0].title} · ${selectedItems[0].time}` : "Nothing scheduled"}</p></div>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-white/50 pt-2">
          <button type="button" onClick={() => router.push("/journal")} className="flex items-center gap-1 text-[10px] font-medium text-outline transition hover:text-primary sm:text-[11px]"><span className="material-symbols-outlined text-[14px]">edit_note</span>Add a note</button>
          <button type="button" onClick={() => router.push("/calendar")} className="rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-semibold text-on-surface-variant shadow-sm transition hover:bg-white sm:text-[11px]">+ New Event</button>
        </div>
      </div>
    </section>
  );
}
