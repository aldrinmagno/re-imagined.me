create extension if not exists "pgcrypto";

create table if not exists public.action_plan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint action_plan_unique_user unique (user_id)
);

create or replace function public.update_action_plan_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_action_plan_updated_at
before update on public.action_plan
for each row execute function public.update_action_plan_timestamp();

alter table public.action_plan enable row level security;

create policy "Allow authenticated select own action plan" on public.action_plan
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow authenticated insert own action plan" on public.action_plan
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow authenticated update own action plan" on public.action_plan
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
