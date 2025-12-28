create extension if not exists "pgcrypto";

create table if not exists public.cv_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  role_key text not null,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.update_cv_versions_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_cv_versions_updated_at
before update on public.cv_versions
for each row execute function public.update_cv_versions_timestamp();

alter table public.cv_versions enable row level security;

create policy "Allow authenticated select own cv versions" on public.cv_versions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow authenticated insert own cv versions" on public.cv_versions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow authenticated update own cv versions" on public.cv_versions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Allow authenticated delete own cv versions" on public.cv_versions
  for delete
  to authenticated
  using (auth.uid() = user_id);
