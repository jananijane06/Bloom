"use client";

import { useState } from "react";

export default function LittleThought() {
  const [thought, setThought] = useState("");

  return (
    <section className="glass-card relative overflow-hidden rounded-[24px] sm:rounded-[30px] p-5 sm:p-7 h-full min-h-[380px] sm:min-h-[420px] flex flex-col justify-between">
      {/* decorative glow */}
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-rose-300/20 blur-3xl" />

      {/* TOP & CONTENT */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/70 shadow-sm">
              <span className="material-symbols-outlined text-[17px] text-primary">
                edit_note
              </span>
            </div>

            <div>
              <h2 className="text-[17px] sm:text-[18px] font-bold text-on-surface">
                Little Thought
              </h2>
              <p className="text-[11px] sm:text-[12px] text-outline">
                A tiny space for today
              </p>
            </div>
          </div>

          <span className="rounded-full bg-white/60 px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-primary">
            Diary
          </span>
        </div>

        {/* PROMPT BOX */}
        <div className="mt-4 sm:mt-5 flex-1 flex flex-col rounded-2xl border border-white/70 bg-white/40 p-4 sm:p-5">
          <p className="text-[11px] sm:text-[12px] font-semibold text-on-surface-variant">
              What would you like to remember?
          </p>

          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder="The little things count... crisp morning air, hot tea, finished assignments."
            className="mt-3 w-full flex-1 min-h-[140px] sm:min-h-[160px] resize-none bg-transparent text-[12px] sm:text-[13px] leading-relaxed text-on-surface outline-none placeholder:text-outline/70"
          />

          <div className="mt-2 flex items-center justify-between text-[10px] text-outline pt-2 border-t border-white/40">
            <span>{thought.length} characters</span>
            <span className="text-primary font-medium">Daily reflection</span>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-white/60 pt-3">
        <div className="flex items-center gap-1.5 text-[11px] text-outline">
          <span className="material-symbols-outlined text-[15px]">
            lock
          </span>
          Private to you
        </div>

        <button
          type="button"
          className="berry-button rounded-full px-5 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-semibold text-white shadow-sm transition active:scale-95 hover:shadow-md"
        >
          Save thought
        </button>
      </div>
    </section>
  );
}
