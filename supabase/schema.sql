-- ==============================================================================
-- BLOOM SANCTUARY — SUPABASE DATABASE SCHEMA
-- Profiles table, Row Level Security (RLS), and Auto-Creation Trigger
-- ==============================================================================

-- 1. Create the profiles table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Row Level Security Policies
-- Policy: A user can view only their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy: A user can update only their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Policy: A user can insert their own profile
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 4. Function to automatically create a profile when a new user signs up in auth.users
create or replace function public.handle_new_user()
returns trigger
security definer set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    display_name = coalesce(excluded.display_name, profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url);

  return new;
end;
$$;

-- 5. Trigger to invoke handle_new_user on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 6. SPACES TABLE & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  icon text default '🌷',
  cover_color text default 'rose',
  type text default 'Personal',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security (RLS) for spaces
alter table public.spaces enable row level security;

-- Policy: Users can view their own spaces
create policy "Users can view own spaces"
  on public.spaces for select
  using (auth.uid() = user_id);

-- Policy: Users can create their own spaces
create policy "Users can create own spaces"
  on public.spaces for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own spaces
create policy "Users can update own spaces"
  on public.spaces for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own spaces
create policy "Users can delete own spaces"
  on public.spaces for delete
  using (auth.uid() = user_id);

-- Trigger to automatically update updated_at on spaces modification
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_spaces_updated on public.spaces;

create trigger on_spaces_updated
  before update on public.spaces
  for each row execute function public.handle_updated_at();

-- ==============================================================================
-- 7. TASKS TABLE & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  space_id uuid references public.spaces(id) on delete set null,
  title text not null,
  description text,
  completed boolean default false not null,
  priority text default 'medium',
  due_date timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.tasks enable row level security;

create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can create own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

drop trigger if exists on_tasks_updated on public.tasks;
create trigger on_tasks_updated
  before update on public.tasks
  for each row execute function public.handle_updated_at();

-- ==============================================================================
-- 8. MINDFUL NOTES TABLE & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

create table if not exists public.mindful_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  space_id uuid references public.spaces(id) on delete set null,
  title text not null,
  content text not null,
  mood text,
  pinned boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.mindful_notes enable row level security;

create policy "Users can view own mindful notes"
  on public.mindful_notes for select
  using (auth.uid() = user_id);

create policy "Users can create own mindful notes"
  on public.mindful_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own mindful notes"
  on public.mindful_notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own mindful notes"
  on public.mindful_notes for delete
  using (auth.uid() = user_id);

drop trigger if exists on_mindful_notes_updated on public.mindful_notes;
create trigger on_mindful_notes_updated
  before update on public.mindful_notes
  for each row execute function public.handle_updated_at();

-- ==============================================================================
-- 9. DEADLINES TABLE & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

create table if not exists public.deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  space_id uuid references public.spaces(id) on delete set null,
  title text not null,
  description text,
  due_date timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.deadlines enable row level security;

create policy "Users can view own deadlines"
  on public.deadlines for select
  using (auth.uid() = user_id);

create policy "Users can create own deadlines"
  on public.deadlines for insert
  with check (auth.uid() = user_id);

create policy "Users can update own deadlines"
  on public.deadlines for update
  using (auth.uid() = user_id);

create policy "Users can delete own deadlines"
  on public.deadlines for delete
  using (auth.uid() = user_id);

drop trigger if exists on_deadlines_updated on public.deadlines;
create trigger on_deadlines_updated
  before update on public.deadlines
  for each row execute function public.handle_updated_at();

-- ==============================================================================
-- 10. RESOURCES TABLE & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  space_id uuid references public.spaces(id) on delete set null,
  title text not null,
  url text,
  description text,
  resource_type text default 'Link',
  created_at timestamptz default now() not null
);

alter table public.resources enable row level security;

create policy "Users can view own resources"
  on public.resources for select
  using (auth.uid() = user_id);

create policy "Users can create own resources"
  on public.resources for insert
  with check (auth.uid() = user_id);

create policy "Users can update own resources"
  on public.resources for update
  using (auth.uid() = user_id);

create policy "Users can delete own resources"
  on public.resources for delete
  using (auth.uid() = user_id);


