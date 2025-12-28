create extension if not exists "pgcrypto";

create table if not exists public.cv_bullets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_key text not null,
  bullets jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint cv_bullets_unique_user_role unique (user_id, role_key)
);

create or replace function public.update_cv_bullets_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_cv_bullets_updated_at
before update on public.cv_bullets
for each row execute function public.update_cv_bullets_timestamp();

alter table public.cv_bullets enable row level security;

create policy "Allow authenticated select own cv bullets" on public.cv_bullets
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow authenticated insert own cv bullets" on public.cv_bullets
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow authenticated update own cv bullets" on public.cv_bullets
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
