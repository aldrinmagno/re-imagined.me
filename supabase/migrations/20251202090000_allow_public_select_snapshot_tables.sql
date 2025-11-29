-- Broaden select access for snapshot/report tables to anonymous users.
-- Replace authenticated-only select policies with permissive rules for
-- both anonymous and authenticated roles.

drop policy if exists "Allow authenticated select own reports" on public.reports;
create policy "Allow public select reports" on public.reports
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow authenticated select own future roles" on public.future_roles;
create policy "Allow public select future roles" on public.future_roles
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow authenticated select own skills" on public.skills_to_build;
create policy "Allow public select skills" on public.skills_to_build
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow authenticated select own plan phases" on public.ninety_day_plan_phases;
create policy "Allow public select plan phases" on public.ninety_day_plan_phases
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow authenticated select own plan actions" on public.plan_actions;
create policy "Allow public select plan actions" on public.plan_actions
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow authenticated select own resources" on public.learning_resources;
create policy "Allow public select learning resources" on public.learning_resources
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow authenticated select own interview data" on public.interview_data;
create policy "Allow public select interview data" on public.interview_data
  for select
  to anon, authenticated
  using (true);
