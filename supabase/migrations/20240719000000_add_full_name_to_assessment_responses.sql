alter table public.assessment_responses
  add column if not exists full_name text;
