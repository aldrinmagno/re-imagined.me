create extension if not exists "pgcrypto";

create table if not exists public.action_plan_progress (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id uuid not null references public.assessment_responses(id) on delete cascade,
  action_id text not null,
  completed boolean not null default false,
  constraint action_plan_progress_unique unique (user_id, report_id, action_id)
);

create or replace function public.update_action_plan_progress_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_action_plan_progress_updated_at
before update on public.action_plan_progress
for each row execute function public.update_action_plan_progress_timestamp();

alter table public.action_plan_progress enable row level security;

create policy "Allow authenticated select own action plan progress" on public.action_plan_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow authenticated insert own action plan progress" on public.action_plan_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow authenticated update own action plan progress" on public.action_plan_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
