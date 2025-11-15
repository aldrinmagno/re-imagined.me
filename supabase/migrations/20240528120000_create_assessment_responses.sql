create extension if not exists "pgcrypto";

create table if not exists public.assessment_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  submitted_at timestamptz not null default now(),
  job_title text not null,
  industry text not null,
  years_experience integer not null check (years_experience >= 0),
  strengths text not null,
  typical_week text,
  looking_for text not null,
  work_preferences text,
  email text not null
);

alter table public.assessment_responses enable row level security;

create policy "Allow anonymous inserts" on public.assessment_responses
  for insert
  to anon
  with check (true);

create policy "Allow authenticated inserts" on public.assessment_responses
  for insert
  to authenticated
  with check (true);
