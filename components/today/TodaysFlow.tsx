"use client";

export default function TodaysFlow() {
  return (
    <section className="glass-card h-full rounded-[24px] sm:rounded-[30px] p-5 sm:p-7 flex flex-col justify-between">
      <div>
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-[17px] sm:text-[18px] font-bold text-on-surface">
              Today's Flow
            </h2>

            <p className="text-[11px] sm:text-[12px] text-outline">
              4 milestones lined up gently
            </p>
          </div>

          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white bg-white/60 text-primary shadow-sm">
            <span className="material-symbols-outlined text-[18px]">
              spa
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:gap-3">
          {[
            ["08:30", "Morning Ritual", "Matcha, light stretch & breath"],
            ["10:00", "Computer Networks", "TCP/IP Handshake & Routing"],
            ["12:30", "Lunch with S...", "Campus Green & match..."],
            ["15:00", "Data Analytics", "MapReduce cluster pipe..."],
          ].map(([time, title, subtitle], index) => (
            <div
              key={title}
              className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-white/70 bg-white/45 p-3.5 sm:p-4 transition hover:bg-white/60"
            >
              <div className="w-11 sm:w-12 text-[11px] sm:text-[12px] font-semibold text-outline">
                {time}
              </div>

              <div
                className={`h-9 sm:h-10 w-1 rounded-full flex-shrink-0 ${
                  index === 0
                    ? "bg-primary"
                    : index === 1
                    ? "bg-[#B85C7A]"
                    : "bg-[#701F43]"
                }`}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] sm:text-[13px] font-bold text-on-surface">
                  {title}
                </p>

                <p className="truncate text-[10px] sm:text-[11px] text-outline">
                  {subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/60 pt-3 text-[12px]">
        <span className="text-outline">
          Free until 10:00 AM
        </span>

        <span className="font-semibold text-primary">
          Nothing urgent right now.
        </span>
      </div>
    </section>
  );
}
