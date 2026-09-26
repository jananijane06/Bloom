create table if not exists public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  mood text not null,
  energy_level integer not null check (energy_level between 1 and 5),
  tags text[] not null default '{}',
  note text,
  created_at timestamptz not null default now()
);

create index if not exists mood_logs_user_recorded_idx
  on public.mood_logs (user_id, recorded_at desc);

alter table public.mood_logs enable row level security;
drop policy if exists "Users can manage own mood logs" on public.mood_logs;
create policy "Users can manage own mood logs"
  on public.mood_logs for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
