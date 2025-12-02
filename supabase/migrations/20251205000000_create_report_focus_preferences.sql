create extension if not exists "pgcrypto";

create table if not exists public.report_focus_preferences (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id uuid not null references public.reports(id) on delete cascade,
  selected_role_id uuid references public.future_roles(id) on delete set null,
  constraint report_focus_preferences_unique unique (user_id, report_id)
);

create index if not exists report_focus_preferences_report_idx on public.report_focus_preferences(report_id);

create or replace function public.update_report_focus_preferences_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_report_focus_preferences_updated_at
before update on public.report_focus_preferences
for each row execute function public.update_report_focus_preferences_updated_at();

alter table public.report_focus_preferences enable row level security;

create policy "Allow authenticated select own focused role" on public.report_focus_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow authenticated insert own focused role" on public.report_focus_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow authenticated update own focused role" on public.report_focus_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
