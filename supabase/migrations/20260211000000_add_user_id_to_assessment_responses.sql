-- Add user_id column to assessment_responses so lookups use a proper FK
-- instead of matching on the mutable email field.

-- 1. Add nullable user_id column with FK to auth.users
alter table public.assessment_responses
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- 2. Backfill user_id from auth.users where emails match
update public.assessment_responses ar
  set user_id = au.id
  from auth.users au
  where ar.email = au.email
    and ar.user_id is null;

-- 3. Index for fast lookups by user_id (most common query path)
create index if not exists idx_assessment_responses_user_id
  on public.assessment_responses(user_id);

-- 4. Replace the overly-permissive select policy with user_id-scoped access.
--    Authenticated users can only read their own assessments.
--    Anonymous users can read rows with no user_id (pre-signup submissions).
drop policy if exists "Allow public select assessments" on public.assessment_responses;

create policy "Allow authenticated select own assessments"
  on public.assessment_responses
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Allow anon select unowned assessments"
  on public.assessment_responses
  for select
  to anon
  using (user_id is null);

-- 5. Allow authenticated users to update their own assessments
--    (needed for attaching snapshot_insights after submission).
create policy "Allow authenticated update own assessments"
  on public.assessment_responses
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
