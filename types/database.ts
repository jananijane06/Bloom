export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface SpaceRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  cover_color: string | null;
  type: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskRow {
  id: string;
  user_id: string;
  space_id: string | null;
  title: string;
  description: string | null;
  completed: boolean;
  priority: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MindfulNoteRow {
  id: string;
  user_id: string;
  space_id: string | null;
  title: string;
  content: string;
  mood: string | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeadlineRow {
  id: string;
  user_id: string;
  space_id: string | null;
  title: string;
  description: string | null;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceRow {
  id: string;
  user_id: string;
  space_id: string | null;
  title: string;
  url: string | null;
  description: string | null;
  resource_type: string;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      spaces: {
        Row: SpaceRow;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          cover_color?: string | null;
          type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          cover_color?: string | null;
          type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: TaskRow;
        Insert: {
          id?: string;
          user_id: string;
          space_id?: string | null;
          title: string;
          description?: string | null;
          completed?: boolean;
          priority?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          space_id?: string | null;
          title?: string;
          description?: string | null;
          completed?: boolean;
          priority?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mindful_notes: {
        Row: MindfulNoteRow;
        Insert: {
          id?: string;
          user_id: string;
          space_id?: string | null;
          title: string;
          content: string;
          mood?: string | null;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          space_id?: string | null;
          title?: string;
          content?: string;
          mood?: string | null;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      deadlines: {
        Row: DeadlineRow;
        Insert: {
          id?: string;
          user_id: string;
          space_id?: string | null;
          title: string;
          description?: string | null;
          due_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          space_id?: string | null;
          title?: string;
          description?: string | null;
          due_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      resources: {
        Row: ResourceRow;
        Insert: {
          id?: string;
          user_id: string;
          space_id?: string | null;
          title: string;
          url?: string | null;
          description?: string | null;
          resource_type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          space_id?: string | null;
          title?: string;
          url?: string | null;
          description?: string | null;
          resource_type?: string;
          created_at?: string;
        };
      };
    };
  };
};
