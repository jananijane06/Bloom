import AppShell from "@/components/layout/AppShell";

import GreetingHeader from "@/components/today/GreetingHeader";
import DateCard from "@/components/today/DateCard";
import TodaysFlow from "@/components/today/TodaysFlow";
import MoodCard from "@/components/today/MoodCard";
import LittleThought from "@/components/today/LittleThought";

export default function Home() {
  return (
    <AppShell>
      {/* Ambient background */}
      <div className="bloom-ambient">
        <div className="bloom-glow-pink" />
        <div className="bloom-glow-peach" />
        <div className="bloom-glow-lilac" />
      </div>

      <div className="sanctuary-bg relative min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8">
        <div className="relative z-10 mx-auto max-w-[1400px]">

          {/* GREETING HEADER */}
          <GreetingHeader />

          {/* RESPONSIVE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">

            {/* CALENDAR */}
            <div className="col-span-1 md:col-span-2 lg:col-span-5 h-full">
              <DateCard />
            </div>

            {/* TODAY'S FLOW */}
            <div className="col-span-1 md:col-span-1 lg:col-span-4 h-full">
              <TodaysFlow />
            </div>

            {/* MOOD */}
            <div className="col-span-1 md:col-span-1 lg:col-span-3 h-full">
              <MoodCard />
            </div>

            {/* THINGS TO DO */}
            <div className="col-span-1 md:col-span-1 lg:col-span-4 h-full">
              <section className="glass-card h-full min-h-[380px] sm:min-h-[420px] rounded-[24px] sm:rounded-[30px] p-5 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="mb-4 sm:mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[17px] sm:text-[18px] font-bold text-on-surface">
                        Things to do
                      </h2>

                      <span className="text-[15px] text-primary"></span>
                    </div>

                    <span className="text-[11px] sm:text-[12px] font-medium text-primary cursor-pointer hover:underline">
                      + Add item
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 sm:gap-2.5">
                    {[
                      ["Submit CS402 assignment draft", "Due 11:59 PM · High priority", false],
                      ["Read AI lecture slides (week 4)", "20 mins · Study", false],
                      ["Water the desk monstera", "Personal care", true],
                      ["Reply to hackathon committee", "Club · Urgent", false],
                    ].map(([text, meta, done]) => (
                      <div
                        key={String(text)}
                        className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/35 p-3 sm:p-3.5 transition hover:bg-white/55"
                      >
                        <div
                          className={`
                            flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border
                            transition-all
                            ${
                              done
                                ? "bg-primary border-primary text-white"
                                : "border-white/80 bg-white/60"
                            }
                          `}
                        >
                          {done && (
                            <span className="material-symbols-outlined text-[14px]">
                              check
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-[12px] sm:text-[13px] font-medium ${
                              done
                                ? "line-through text-outline"
                                : "text-on-surface"
                            }`}
                          >
                            {text}
                          </p>

                          <p className="truncate text-[10px] sm:text-[11px] text-outline">
                            {meta}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/60 pt-3 text-[11px] sm:text-[12px]">
                  <span className="text-outline">
                    1 of 4 completed
                  </span>

                  <span className="font-semibold text-primary">
                    25% done
                  </span>
                </div>
              </section>
            </div>

            {/* TIMETABLE SCANNER */}
            <div className="col-span-1 md:col-span-1 lg:col-span-5 h-full">
              <section className="glass-card h-full min-h-[380px] sm:min-h-[420px] rounded-[24px] sm:rounded-[30px] p-5 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                        Interactive AI Tool
                      </span>

                      <h2 className="text-[17px] sm:text-[18px] font-bold text-on-surface">
                        Timetable Scanner
                      </h2>
                    </div>

                    <div className="berry-button flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md">
                      <span className="material-symbols-outlined text-[18px]">
                        document_scanner
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-[12px] sm:text-[13px] text-on-surface-variant leading-relaxed">
                    Upload your semester timetable PDF, photo, or screenshot. Bloom automatically
                    extracts courses, lecture halls, and exam schedules.
                  </p>

                  <div className="mt-4 sm:mt-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-white/30 p-6 sm:p-7 text-center transition hover:bg-white/45">
                    <span className="material-symbols-outlined text-[28px] sm:text-[32px] text-primary mb-1">
                      cloud_upload
                    </span>

                    <span className="text-[12px] sm:text-[13px] font-semibold text-on-surface">
                      Drop your timetable image here
                    </span>

                    <span className="mt-1 text-[10px] sm:text-[11px] text-outline">
                      PNG, JPG, PDF up to 10MB
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/60 pt-3">
                  <span className="text-[11px] text-outline">
                    Reads your timetable
                  </span>

                  <button
                    type="button"
                    className="berry-button rounded-full px-5 py-2 text-[11px] sm:text-[12px] font-semibold text-white shadow-sm transition hover:shadow-md active:scale-95"
                  >
                    Scan Timetable Flow →
                  </button>
                </div>
              </section>
            </div>

            {/* LITTLE THOUGHT */}
            <div className="col-span-1 md:col-span-1 lg:col-span-3 h-full">
              <LittleThought />
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}
