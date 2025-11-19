create policy if not exists "Allow anonymous updates" on public.assessment_responses
  for update
  to anon
  using (true)
  with check (true);

create policy if not exists "Allow authenticated updates" on public.assessment_responses
  for update
  to authenticated
  using (true)
  with check (true);
