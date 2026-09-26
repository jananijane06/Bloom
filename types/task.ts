export type Priority = "low" | "medium" | "high" | "urgent";

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "completed"
  | "archived";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  user_id: string;

  title: string;
  description?: string | null;

  completed: boolean;
  status?: TaskStatus;

  priority: Priority | string;

  // Space this task belongs to.
  // null = general/personal task
  space_id?: string | null;

  // Due information
  due_date?: string | null;
  due_time?: string | null;

  tags?: string[];

  subtasks?: SubTask[];

  estimated_minutes?: number | null;

  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
}
