create policy "Allow authenticated select own assessments" on public.assessment_responses
  for select
  to authenticated
  using (email = (auth.jwt() ->> 'email'));
