-- Add transition_target column to store transition goals
alter table public.assessment_responses
  add column if not exists transition_target text;

-- Down migration
alter table public.assessment_responses
  drop column if exists transition_target;
