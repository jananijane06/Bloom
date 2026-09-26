"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchMoodLogs } from "@/lib/moodLogs";
import { MoodLog } from "@/types/journal";
import { localDateString } from "@/lib/dates";

export default function MoodCard() {
  const { user } = useAuth();
  const [todayLog, setTodayLog] = useState<MoodLog | null>(null);
  const load = useCallback(async () => {
    if (!user?.id) { setTodayLog(null); return; }
    try { const logs = await fetchMoodLogs(user.id); setTodayLog(logs.find((log) => log.date === localDateString()) ?? null); }
    catch { setTodayLog(null); }
  }, [user?.id]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    window.addEventListener("focus", refresh); document.addEventListener("visibilitychange", refresh);
    return () => { window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [load]);

  return <section className="glass-card flex h-full min-h-[240px] flex-col justify-between rounded-[24px] p-5 sm:min-h-[280px] sm:rounded-[30px] sm:p-7">
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-[17px] font-bold text-on-surface sm:text-[18px]">State of Mind</h2>{todayLog && <span className="text-[11px] text-outline">{todayLog.time}</span>}</div>
      <div className="mt-8 text-center">
        {todayLog ? <><p className="editorial text-3xl capitalize text-primary">{todayLog.mood}</p><p className="mt-2 text-[12px] text-outline">Energy {todayLog.energyLevel}/5</p>{todayLog.tags.length > 0 && <p className="mt-2 break-words text-[11px] text-outline">{todayLog.tags.join(" · ")}</p>}</> : <><p className="editorial text-2xl text-primary">How are you feeling today?</p><p className="mt-2 text-[12px] text-outline">Your check-in will appear here.</p></>}
      </div>
    </div>
    <Link href="/mood" className="mt-5 block w-full rounded-full border border-white bg-white/70 py-2 text-center text-[11px] font-semibold text-on-surface shadow-sm transition hover:bg-white sm:py-2.5 sm:text-[12px]">{todayLog ? "View mood history" : "Check in with yourself"}</Link>
  </section>;
}
