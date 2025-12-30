create extension if not exists "pgcrypto";

create table if not exists public.job_search_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.job_search_events enable row level security;

create policy "Allow authenticated select own job search events" on public.job_search_events
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow authenticated insert own job search events" on public.job_search_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);
