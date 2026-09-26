"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { fetchTasksFromSupabase, updateTaskStatusInDatabase } from "@/lib/tasks";
import { fetchUserSpaces } from "@/lib/spaces";
import { Task } from "@/types/task";
import { Space } from "@/types/space";

export default function TodayTasks() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) { setTasks([]); setSpaces([]); setLoading(false); return; }
    try {
      const [loadedTasks, loadedSpaces] = await Promise.all([
        fetchTasksFromSupabase(user.id), fetchUserSpaces(user.id),
      ]);
      setTasks(loadedTasks.filter((task) => task.status !== "archived"));
      setSpaces(loadedSpaces);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your tasks.");
    } finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [load]);

  const spaceNames = useMemo(() => new Map(spaces.map((space) => [space.id, space.name])), [spaces]);
  const completed = tasks.filter((task) => task.completed || task.status === "completed").length;
  const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;

  const toggle = async (task: Task) => {
    if (saving) return;
    const next = !(task.completed || task.status === "completed");
    const previous = tasks;
    const completedAt = next ? new Date().toISOString() : null;
    setSaving(task.id); setError("");
    setTasks((items) => items.map((item) => item.id === task.id ? { ...item, completed: next, status: next ? "completed" : "todo", completed_at: completedAt } : item));
    try {
      const updated = await updateTaskStatusInDatabase(task.id, next ? "completed" : "todo", user?.id);
      setTasks((items) => items.map((item) => item.id === task.id ? updated : item));
    } catch (e) {
      setTasks(previous);
      setError(e instanceof Error ? e.message : "Could not update this task.");
    } finally { setSaving(null); }
  };

  return <section className="glass-card flex h-full min-h-[380px] flex-col rounded-[24px] p-5 sm:min-h-[420px] sm:rounded-[30px] sm:p-7">
    <header className="mb-4 flex items-center justify-between gap-2 sm:mb-6">
      <h2 className="text-[17px] font-bold text-on-surface sm:text-[18px]">Things to do</h2>
      <button type="button" onClick={() => router.push("/tasks")} className="shrink-0 text-[11px] font-medium text-primary hover:underline sm:text-[12px]">+ Add item</button>
    </header>
    {error && <p role="alert" className="mb-3 text-xs text-primary">{error}</p>}
    {loading ? <p className="text-sm text-outline">Loading your tasks…</p> : tasks.length === 0 ? <p className="py-4 text-sm text-on-surface-variant">Nothing needs your attention right now.</p> : <div className="flex-1 space-y-2 overflow-y-auto">
      {tasks.map((task) => {
        const done = task.completed || task.status === "completed";
        const details = [
          task.due_date && `Due ${formatTaskDate(task.due_date)}`,
          task.due_time,
          task.priority && `${task.priority} priority`,
          task.space_id && spaceNames.get(task.space_id),
          task.estimated_minutes && `${task.estimated_minutes} min`,
          ...(task.tags ?? []),
        ].filter(Boolean).join(" · ");
        return <div key={task.id} className="flex min-w-0 items-start gap-3 rounded-2xl border border-white/60 bg-white/35 p-3 transition hover:bg-white/55 sm:p-3.5">
          <input type="checkbox" aria-label={`Mark ${task.title} ${done ? "incomplete" : "complete"}`} checked={done} disabled={saving === task.id} onChange={() => void toggle(task)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#701F43]" />
          <button type="button" onClick={() => router.push("/tasks")} className="min-w-0 flex-1 text-left">
            <span className={`block break-words text-[12px] font-medium sm:text-[13px] ${done ? "line-through text-outline" : "text-on-surface"}`}>{task.title}</span>
            {details && <span className="mt-0.5 block break-words text-[10px] text-outline sm:text-[11px]">{details}</span>}
          </button>
        </div>;
      })}
    </div>}
    {!loading && tasks.length > 0 && <footer className="mt-4 flex items-center justify-between gap-2 border-t border-white/60 pt-3 text-[11px] sm:text-[12px]">
      <span className="text-outline">{completed} of {tasks.length} completed</span>
      <span className="font-semibold text-primary">{percent}% done</span>
    </footer>}
  </section>;
}

function formatTaskDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  // Parse a date-only value in UTC so SSR and the browser render the same label.
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}
