alter table public.assessment_responses
  add column if not exists snapshot_summary text;
