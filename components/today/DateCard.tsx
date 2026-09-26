"use client";

import { useState } from "react";

const days = [
  { day: "MON", date: "21" },
  { day: "TUE", date: "22" },
  { day: "WED", date: "23" },
  { day: "THU", date: "24" },
  { day: "FRI", date: "25", today: true, events: 3 },
  { day: "SAT", date: "26" },
  { day: "SUN", date: "27" },
];

export default function DateCard() {
  const [view, setView] = useState<"weekly" | "monthly">("weekly");

  return (
    <section className="glass-card relative overflow-hidden rounded-[24px] sm:rounded-[30px] p-5 sm:p-7 h-full min-h-[380px] sm:min-h-[420px] flex flex-col justify-between">
      {/* subtle glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-rose-300/20 blur-3xl" />

      {/* TOP: Header + View Switcher */}
      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
              <p className="editorial-label text-primary">
              Your week
            </p>
            <h2 className="mt-1 text-[24px] sm:text-[28px] font-bold tracking-[-0.03em] text-[#351A26]">
              September 25
            </h2>
          </div>

          <button
            type="button"
            aria-label="Calendar view options"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full
            border border-white/80 bg-white/60 text-[#684653]
            shadow-sm transition hover:bg-white active:scale-95"
          >
            <span className="material-symbols-outlined text-[19px]">
              calendar_month
            </span>
          </button>
        </div>

        {/* VIEW SWITCHER */}
        <div className="mt-4 sm:mt-5 flex w-fit items-center rounded-full border border-white/70 bg-white/45 p-1">
          <button
            type="button"
            onClick={() => setView("weekly")}
            className={`rounded-full px-4 sm:px-5 py-1.5 text-[11px] sm:text-[12px] font-semibold transition ${
              view === "weekly"
                ? "bg-white text-primary shadow-sm"
                : "text-outline hover:text-on-surface"
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setView("monthly")}
            className={`rounded-full px-4 sm:px-5 py-1.5 text-[11px] sm:text-[12px] font-semibold transition ${
              view === "monthly"
                ? "bg-white text-primary shadow-sm"
                : "text-outline hover:text-on-surface"
            }`}
          >
            Monthly
          </button>
        </div>

        {/* WEEK GRID */}
        <div className="mt-6 sm:mt-7 grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((item) => (
            <div
              key={item.date}
              className="flex flex-col items-center"
            >
              {/* DAY */}
              <span
                className={`text-[10px] sm:text-[11px] font-semibold tracking-wide mb-2 ${
                  item.today ? "text-primary" : "text-outline"
                }`}
              >
                {item.day}
              </span>

              {/* DATE BUTTON */}
              <div
                className={`relative flex h-11 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl sm:rounded-full text-[13px] sm:text-[14px] font-semibold transition-all ${
                  item.today
                    ? "berry-button text-white shadow-md scale-105"
                    : "text-on-surface hover:bg-white/60"
                }`}
              >
                {item.date}

                {/* event indicator dot */}
                {item.events && (
                  <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-[#B85C7A] ring-2 ring-white/80" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM SECTION: Today Summary + Footer Actions */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/60">
        {/* TODAY SUMMARY */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary/10">
              <span className="material-symbols-outlined text-[17px] text-primary">
                event
              </span>
            </div>
            <div>
              <p className="text-[12px] sm:text-[13px] font-semibold text-on-surface">
                3 classes today
              </p>
              <p className="text-[10px] sm:text-[11px] text-outline">
                Friday rhythm
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-outline">
              Next up
            </p>
            <p className="text-[11px] sm:text-[12px] font-semibold text-primary">
              Computer Networks · 10:00 AM
            </p>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-between pt-3 border-t border-white/50">
          <button
            type="button"
            className="flex items-center gap-1.5 text-[11px] sm:text-[12px] font-medium text-outline transition hover:text-primary"
          >
            <span className="material-symbols-outlined text-[17px]">
              edit_note
            </span>
            Add a note
          </button>

          <button
            type="button"
            className="rounded-full bg-white/80 px-4 py-2 text-[11px] sm:text-[12px] font-semibold text-on-surface-variant shadow-sm transition hover:bg-white active:scale-95"
          >
            + New Event
          </button>
        </div>
      </div>
    </section>
  );
}
