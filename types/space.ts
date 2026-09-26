export type SpaceType =
  | 'University'
  | 'Club'
  | 'Work'
  | 'Personal'
  | 'Project'
  | 'Other';

export type SpaceColor =
  | 'rose'
  | 'berry'
  | 'coral'
  | 'peach'
  | 'violet'
  | 'lilac'
  | 'emerald'
  | 'sky'
  | 'amber'
  | 'indigo'
  | 'teal';

export interface Space {
  id: string;
  user_id?: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  icon?: string | null;
  cover_color?: string | null;
  type?: SpaceType | string | null;
  slug?: string;
  color?: string | null;
  isFavorite?: boolean;
  created_at?: string;
  updated_at?: string;

  // Counts & metrics for dashboard
  taskCount?: number;
  noteCount?: number;
  deadlinesCount?: number;
  resourceCount?: number;
  completedTaskCount?: number;
}
