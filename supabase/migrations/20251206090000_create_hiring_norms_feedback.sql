create extension if not exists "pgcrypto";

create table if not exists public.hiring_norms_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  country_code text not null,
  card_key text not null,
  sentiment text not null,
  created_at timestamptz not null default now()
);

alter table public.hiring_norms_feedback enable row level security;

create policy "Allow authenticated insert own hiring norms feedback" on public.hiring_norms_feedback
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow authenticated select own hiring norms feedback" on public.hiring_norms_feedback
  for select
  to authenticated
  using (auth.uid() = user_id);
