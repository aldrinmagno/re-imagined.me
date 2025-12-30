create extension if not exists "pgcrypto";

create table if not exists public.radar_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  name text not null,
  link text,
  priority smallint not null default 2,
  status text not null default 'watching',
  meta jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.update_radar_items_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_radar_items_updated_at
before update on public.radar_items
for each row execute function public.update_radar_items_timestamp();

alter table public.radar_items enable row level security;

create policy "Allow authenticated select own radar items" on public.radar_items
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow authenticated insert own radar items" on public.radar_items
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow authenticated update own radar items" on public.radar_items
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Allow authenticated delete own radar items" on public.radar_items
  for delete
  to authenticated
  using (auth.uid() = user_id);
