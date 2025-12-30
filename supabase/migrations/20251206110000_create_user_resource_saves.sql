create extension if not exists "pgcrypto";

create table if not exists public.user_resource_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id text not null,
  status text not null default 'saved',
  created_at timestamptz not null default now()
);

alter table public.user_resource_saves enable row level security;

create policy "Allow authenticated select own resource saves" on public.user_resource_saves
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow authenticated insert own resource saves" on public.user_resource_saves
  for insert
  to authenticated
  with check (auth.uid() = user_id);
