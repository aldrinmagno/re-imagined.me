-- Ensure inserts succeed for assessment responses when RLS is enabled.
-- Drop legacy insert policies to avoid conflicts and recreate permissive checks
-- for both anonymous and authenticated users (service_role bypasses RLS).
drop policy if exists "Allow anonymous inserts" on public.assessment_responses;
drop policy if exists "Allow authenticated inserts" on public.assessment_responses;

-- Keep select policy intact; add new insert policy covering anon and authenticated roles.
create policy "Allow public inserts for assessments" on public.assessment_responses
  for insert
  to anon, authenticated
  with check (true);
