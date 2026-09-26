export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SpaceTask {
  id: string;
  user_id?: string;
  space_id?: string | null;
  spaceId?: string | null;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: TaskPriority | string;
  due_date?: string | null;
  due_time?: string | null;
  dueDate?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type MindfulMood = 'calm' | 'grateful' | 'inspired' | 'reflective' | 'focused' | 'peaceful' | 'energized';

export interface MindfulNote {
  id: string;
  user_id?: string;
  space_id?: string | null;
  title: string;
  content: string;
  mood?: MindfulMood | string | null;
  pinned: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Deadline {
  id: string;
  user_id?: string;
  space_id?: string | null;
  title: string;
  description?: string | null;
  due_date: string; // ISO date string
  created_at?: string;
  updated_at?: string;
}

export type ResourceType = 'Link' | 'PDF/reference' | 'Other';

export interface Resource {
  id: string;
  user_id?: string;
  space_id?: string | null;
  title: string;
  url?: string | null;
  description?: string | null;
  resource_type: ResourceType | string;
  created_at?: string;
}

export type AddItemType = 'task' | 'note' | 'deadline' | 'resource';
