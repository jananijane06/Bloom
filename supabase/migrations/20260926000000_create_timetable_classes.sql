
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  start_date date not null,
  start_time time not null,
  end_date date not null,
  end_time time not null,
  space_id text not null default 'personal',
  type text not null default 'class',
  color text,
  location text,
  course_code text,
  lecturer text,
  is_all_day boolean not null default false,
  is_recurring boolean not null default false,
  timetable_class_id uuid references public.timetable_classes(id) on delete cascade,
  timetable_period_start date,
  timetable_period_end date,
  created_at timestamptz not null default now(),
  constraint calendar_events_time_range_check check (
    start_date < end_date or (start_date = end_date and start_time < end_time)
  ),
  constraint calendar_events_timetable_period_check check (
    (timetable_class_id is null and timetable_period_start is null and timetable_period_end is null)
    or
    (timetable_class_id is not null and timetable_period_start is not null and timetable_period_end is not null and timetable_period_start <= timetable_period_end)
  )
);

create index if not exists calendar_events_user_date_idx
  on public.calendar_events (user_id, start_date);

create index if not exists calendar_events_timetable_class_idx
  on public.calendar_events (user_id, timetable_class_id)
  where timetable_class_id is not null;

create unique index if not exists calendar_events_timetable_occurrence_unique
  on public.calendar_events (user_id, timetable_class_id, start_date, start_time);

alter table public.calendar_events enable row level security;

drop policy if exists "Users can view own calendar events" on public.calendar_events;
create policy "Users can view own calendar events"
  on public.calendar_events for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create own calendar events" on public.calendar_events;
create policy "Users can create own calendar events"
  on public.calendar_events for insert to authenticated
  with check (
    auth.uid() = user_id
    and (
      timetable_class_id is null
      or exists (
        select 1
        from public.timetable_classes as source_class
        where source_class.id = timetable_class_id
          and source_class.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Users can update own calendar events" on public.calendar_events;
create policy "Users can update own calendar events"
  on public.calendar_events for update to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      timetable_class_id is null
      or exists (
        select 1
        from public.timetable_classes as source_class
        where source_class.id = timetable_class_id
          and source_class.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Users can delete own calendar events" on public.calendar_events;
create policy "Users can delete own calendar events"
  on public.calendar_events for delete to authenticated
  using (auth.uid() = user_id);
