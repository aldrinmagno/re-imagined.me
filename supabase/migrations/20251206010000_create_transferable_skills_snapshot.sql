create extension if not exists "pgcrypto";

create table if not exists public.transferable_skills_snapshot (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skills jsonb not null default '[]'::jsonb,
  bullets jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.transferable_skills_snapshot enable row level security;

create policy "Allow authenticated select own transferable skills snapshots" on public.transferable_skills_snapshot
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow authenticated insert own transferable skills snapshots" on public.transferable_skills_snapshot
  for insert
  to authenticated
  with check (auth.uid() = user_id);
