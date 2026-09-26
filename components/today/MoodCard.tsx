"use client";

export default function MoodCard() {
  return (
    <section className="glass-card h-full rounded-[24px] sm:rounded-[30px] p-5 sm:p-7 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] sm:text-[18px] font-bold text-on-surface">
            State of Mind
          </h2>

          <span className="text-[11px] font-medium text-outline">
            Updated 1h ago
          </span>
        </div>

        <div className="mt-4 sm:mt-6 flex flex-col items-center">
          <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-white/60 shadow-inner" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin-slow" />

            <span className="editorial text-2xl sm:text-3xl text-primary">steady</span>
          </div>

          <span className="mt-3 sm:mt-4 text-[15px] sm:text-[16px] font-bold text-on-surface">
            Steady
          </span>

          <p className="mt-1 text-center text-[11px] sm:text-[12px] text-outline">
            "You have a little room to breathe today."
          </p>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-full border border-white bg-white/70 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-semibold text-on-surface shadow-sm transition hover:bg-white active:scale-95"
      >
        Check in with yourself 
      </button>
    </section>
  );
}
