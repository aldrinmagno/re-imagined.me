create extension if not exists "pgcrypto";

create table if not exists public.impact_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entries jsonb not null default '[]'::jsonb,
  include_in_report boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint impact_inventory_unique_user unique (user_id)
);

create or replace function public.update_impact_inventory_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_impact_inventory_updated_at
before update on public.impact_inventory
for each row execute function public.update_impact_inventory_timestamp();

alter table public.impact_inventory enable row level security;

create policy "Allow authenticated select own impact inventory" on public.impact_inventory
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow authenticated insert own impact inventory" on public.impact_inventory
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow authenticated update own impact inventory" on public.impact_inventory
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
