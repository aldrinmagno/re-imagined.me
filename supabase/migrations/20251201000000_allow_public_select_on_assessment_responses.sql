-- Broaden select access for assessment responses to include anonymous users.
-- Replace existing authenticated-only select policy with a permissive rule for
-- both anonymous and authenticated roles (service_role bypasses RLS).
drop policy if exists "Allow authenticated select own assessments" on public.assessment_responses;

create policy "Allow public select assessments" on public.assessment_responses
  for select
  to anon, authenticated
  using (true);
