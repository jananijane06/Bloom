import AppShell from "@/components/layout/AppShell";

import GreetingHeader from "@/components/today/GreetingHeader";
import DateCard from "@/components/today/DateCard";
import TodaysFlow from "@/components/today/TodaysFlow";
import MoodCard from "@/components/today/MoodCard";
import LittleThought from "@/components/today/LittleThought";
import TodayTasks from "@/components/today/TodayTasks";
import { TodayDateProvider } from "@/components/today/TodayDateContext";

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
        <div className="relative z-10 mx-auto w-full max-w-[1400px] min-w-0">

          {/* GREETING HEADER */}
          <GreetingHeader />

          {/* RESPONSIVE GRID */}
          <TodayDateProvider>
          <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 sm:gap-5 md:grid-cols-2 min-[1400px]:grid-cols-12">

            {/* CALENDAR */}
            <div className="min-w-0 h-full md:col-span-2 min-[1400px]:col-span-5">
              <DateCard />
            </div>

            {/* TODAY'S FLOW */}
            <div className="min-w-0 h-full min-[1400px]:col-span-4">
              <TodaysFlow />
            </div>

            {/* MOOD */}
            <div className="min-w-0 h-full min-[1400px]:col-span-3">
              <MoodCard />
            </div>

            {/* THINGS TO DO */}
            <div className="min-w-0 h-full min-[1400px]:col-span-6"><TodayTasks /></div>

            {/* LITTLE THOUGHT */}
            <div className="min-w-0 h-full min-[1400px]:col-span-6">
              <LittleThought />
            </div>

          </div>
          </TodayDateProvider>
        </div>
      </div>
    </AppShell>
  );
}
