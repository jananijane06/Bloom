export type MoodType = 'serene' | 'radiant' | 'focused' | 'reflective' | 'drained' | 'anxious';

export interface MoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mood: MoodType;
  energyLevel: number; // 1 to 5
  tags: string[];
  note?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
  mood: MoodType;
  promptUsed?: string;
  tags: string[];
  isBookmarked?: boolean;
}
