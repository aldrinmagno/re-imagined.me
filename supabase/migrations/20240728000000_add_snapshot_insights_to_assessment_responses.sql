-- Add snapshot_insights column used to persist AI generated snapshot copy
alter table public.assessment_responses
  add column if not exists snapshot_insights jsonb;

-- Down migration
alter table public.assessment_responses
  drop column if exists snapshot_insights;
