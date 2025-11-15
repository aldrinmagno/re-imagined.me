create extension if not exists "pgcrypto";

create table if not exists public.mailing_list_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  interests text
);

alter table public.mailing_list_signups enable row level security;

create policy "Allow anonymous inserts" on public.mailing_list_signups
  for insert
  to anon
  with check (true);

create policy "Allow authenticated inserts" on public.mailing_list_signups
  for insert
  to authenticated
  with check (true);
