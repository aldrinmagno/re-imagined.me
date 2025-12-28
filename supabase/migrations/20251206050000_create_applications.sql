create extension if not exists "pgcrypto";

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role_title text not null,
  source text,
  date_applied date,
  status text not null default 'applied',
  contact text,
  notes text,
  next_step text,
  next_step_date date,
  updated_at timestamptz not null default now()
);

create or replace function public.update_applications_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_applications_updated_at
before update on public.applications
for each row execute function public.update_applications_timestamp();

alter table public.applications enable row level security;

create policy "Allow authenticated select own applications" on public.applications
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow authenticated insert own applications" on public.applications
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow authenticated update own applications" on public.applications
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Allow authenticated delete own applications" on public.applications
  for delete
  to authenticated
  using (auth.uid() = user_id);
