create extension if not exists "pgcrypto";

create table if not exists public.network_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  org text,
  role text,
  channel text,
  last_contacted date,
  next_follow_up date,
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.network_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task text not null,
  due_date date,
  status text not null default 'pending',
  linked_contact_id uuid references public.network_contacts(id) on delete set null,
  updated_at timestamptz not null default now()
);

create or replace function public.update_network_contacts_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.update_network_tasks_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_network_contacts_updated_at
before update on public.network_contacts
for each row execute function public.update_network_contacts_timestamp();

create trigger set_network_tasks_updated_at
before update on public.network_tasks
for each row execute function public.update_network_tasks_timestamp();

alter table public.network_contacts enable row level security;
alter table public.network_tasks enable row level security;

create policy "Allow authenticated select own network contacts" on public.network_contacts
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow authenticated insert own network contacts" on public.network_contacts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow authenticated update own network contacts" on public.network_contacts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Allow authenticated delete own network contacts" on public.network_contacts
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow authenticated select own network tasks" on public.network_tasks
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow authenticated insert own network tasks" on public.network_tasks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow authenticated update own network tasks" on public.network_tasks
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Allow authenticated delete own network tasks" on public.network_tasks
  for delete
  to authenticated
  using (auth.uid() = user_id);
