-- Create structured report storage aligned with product flow
create extension if not exists "pgcrypto";

-- Core reports table linked to assessments
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessment_responses(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text,
  summary text,
  strengths_snapshot jsonb,
  where_you_are jsonb,
  goal_text text,
  headline_suggestion text,
  interview_overview text,
  status text not null default 'draft' check (status in ('draft', 'final'))
);

create index if not exists reports_assessment_id_idx on public.reports(assessment_id);

create or replace function public.update_reports_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_reports_updated_at
before update on public.reports
for each row execute function public.update_reports_updated_at();

alter table public.reports enable row level security;

create policy "Allow authenticated select own reports" on public.reports
  for select
  to authenticated
  using (exists (
    select 1 from public.assessment_responses ar
    where ar.id = assessment_id
      and ar.email = (auth.jwt() ->> 'email')
  ));

create policy "Allow authenticated insert own reports" on public.reports
  for insert
  to authenticated
  with check (exists (
    select 1 from public.assessment_responses ar
    where ar.id = assessment_id
      and ar.email = (auth.jwt() ->> 'email')
  ));

create policy "Allow authenticated update own reports" on public.reports
  for update
  to authenticated
  using (exists (
    select 1 from public.assessment_responses ar
    where ar.id = assessment_id
      and ar.email = (auth.jwt() ->> 'email')
  ))
  with check (exists (
    select 1 from public.assessment_responses ar
    where ar.id = assessment_id
      and ar.email = (auth.jwt() ->> 'email')
  ));

-- Future roles suggested in the report
create table if not exists public.future_roles (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  title text not null,
  description text,
  reasons text[] not null default '{}',
  ordering integer not null default 0
);

create index if not exists future_roles_report_id_idx on public.future_roles(report_id);
create index if not exists future_roles_report_order_idx on public.future_roles(report_id, ordering);

alter table public.future_roles enable row level security;

create policy "Allow authenticated select own future roles" on public.future_roles
  for select
  to authenticated
  using (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

create policy "Allow authenticated insert own future roles" on public.future_roles
  for insert
  to authenticated
  with check (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

create policy "Allow authenticated update own future roles" on public.future_roles
  for update
  to authenticated
  using (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ))
  with check (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

-- Skills the user should build, linked to the target role
create table if not exists public.skills_to_build (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  future_role_id uuid references public.future_roles(id) on delete cascade,
  skill_name text not null,
  skill_summary text,
  category text,
  ordering integer not null default 0
);

create index if not exists skills_to_build_report_idx on public.skills_to_build(report_id);
create index if not exists skills_to_build_role_idx on public.skills_to_build(future_role_id);

alter table public.skills_to_build enable row level security;

create policy "Allow authenticated select own skills" on public.skills_to_build
  for select
  to authenticated
  using (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

create policy "Allow authenticated insert own skills" on public.skills_to_build
  for insert
  to authenticated
  with check (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

create policy "Allow authenticated update own skills" on public.skills_to_build
  for update
  to authenticated
  using (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ))
  with check (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

-- 90-day plan phases (e.g., Month 1/2/3)
create table if not exists public.ninety_day_plan_phases (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  future_role_id uuid references public.future_roles(id) on delete set null,
  month_label text not null,
  title text not null,
  description text,
  position integer not null default 0
);

create index if not exists ninety_day_plan_phases_report_idx on public.ninety_day_plan_phases(report_id);
create index if not exists ninety_day_plan_phases_role_idx on public.ninety_day_plan_phases(future_role_id);

alter table public.ninety_day_plan_phases enable row level security;

create policy "Allow authenticated select own plan phases" on public.ninety_day_plan_phases
  for select
  to authenticated
  using (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

create policy "Allow authenticated insert own plan phases" on public.ninety_day_plan_phases
  for insert
  to authenticated
  with check (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

create policy "Allow authenticated update own plan phases" on public.ninety_day_plan_phases
  for update
  to authenticated
  using (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ))
  with check (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

-- Individual plan actions within each phase
create table if not exists public.plan_actions (
  id text primary key,
  report_id uuid not null references public.reports(id) on delete cascade,
  phase_id uuid not null references public.ninety_day_plan_phases(id) on delete cascade,
  future_role_id uuid references public.future_roles(id) on delete set null,
  label text not null,
  time_per_week text,
  position integer not null default 0
);

create index if not exists plan_actions_report_idx on public.plan_actions(report_id);
create index if not exists plan_actions_phase_idx on public.plan_actions(phase_id);

alter table public.plan_actions enable row level security;

create policy "Allow authenticated select own plan actions" on public.plan_actions
  for select
  to authenticated
  using (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

create policy "Allow authenticated insert own plan actions" on public.plan_actions
  for insert
  to authenticated
  with check (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

create policy "Allow authenticated update own plan actions" on public.plan_actions
  for update
  to authenticated
  using (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ))
  with check (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

-- Learning resources linked to the report, role, or skill
create table if not exists public.learning_resources (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade,
  future_role_id uuid references public.future_roles(id) on delete set null,
  skill_id uuid references public.skills_to_build(id) on delete set null,
  title text not null,
  description text,
  url text not null,
  tags text[] not null default '{}',
  position integer not null default 0
);

create index if not exists learning_resources_report_idx on public.learning_resources(report_id);
create index if not exists learning_resources_role_idx on public.learning_resources(future_role_id);
create index if not exists learning_resources_skill_idx on public.learning_resources(skill_id);

alter table public.learning_resources enable row level security;

create policy "Allow authenticated select own resources" on public.learning_resources
  for select
  to authenticated
  using (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

create policy "Allow authenticated insert own resources" on public.learning_resources
  for insert
  to authenticated
  with check (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

create policy "Allow authenticated update own resources" on public.learning_resources
  for update
  to authenticated
  using (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ))
  with check (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

-- Interview data attached to a report (headline, talking points, etc.)
create table if not exists public.interview_data (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  headline text,
  how_to_describe text,
  talking_points text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists interview_data_report_idx on public.interview_data(report_id);

alter table public.interview_data enable row level security;

create policy "Allow authenticated select own interview data" on public.interview_data
  for select
  to authenticated
  using (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

create policy "Allow authenticated insert own interview data" on public.interview_data
  for insert
  to authenticated
  with check (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

create policy "Allow authenticated update own interview data" on public.interview_data
  for update
  to authenticated
  using (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ))
  with check (exists (
    select 1 from public.reports r
    join public.assessment_responses ar on ar.id = r.assessment_id
    where r.id = report_id and ar.email = (auth.jwt() ->> 'email')
  ));

-- Tie saved progress to defined plan actions
alter table public.action_plan_progress
  add constraint if not exists action_plan_progress_action_fk
    foreign key (action_id) references public.plan_actions(id) on delete cascade;
