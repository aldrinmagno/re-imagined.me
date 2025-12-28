create extension if not exists "pgcrypto";

create table if not exists public.application_comms (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.application_comms enable row level security;

create policy "Allow authenticated select own application comms" on public.application_comms
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow authenticated insert own application comms" on public.application_comms
  for insert
  to authenticated
  with check (auth.uid() = user_id);
