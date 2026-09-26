import { createClient } from "@/lib/supabase/client";
import { MoodLog } from "@/types/journal";

type MoodRow = { id: string; recorded_at: string; mood: MoodLog["mood"]; energy_level: number; tags: string[]; note: string | null };
function mapLog(row: MoodRow): MoodLog {
  const date = new Date(row.recorded_at);
  return { id: row.id, date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), mood: row.mood,
    energyLevel: row.energy_level, tags: row.tags ?? [], note: row.note ?? undefined };
}
export async function fetchMoodLogs(userId?: string | null): Promise<MoodLog[]> {
  if (!userId) return [];
  const { data, error } = await createClient().from("mood_logs").select("*").eq("user_id", userId).order("recorded_at", { ascending: false });
  if (error) throw new Error(`Could not load your mood history: ${error.message}`);
  return ((data ?? []) as MoodRow[]).map(mapLog);
}
export async function createMoodLog(userId: string | null | undefined, log: Omit<MoodLog, "id" | "date" | "time">): Promise<MoodLog> {
  if (!userId) throw new Error("Sign in to record a mood.");
  const { data, error } = await createClient().from("mood_logs").insert({ user_id: userId, mood: log.mood, energy_level: log.energyLevel, tags: log.tags, note: log.note ?? null }).select("*").single();
  if (error) throw new Error(`Could not save your mood: ${error.message}`);
  return mapLog(data as MoodRow);
}
