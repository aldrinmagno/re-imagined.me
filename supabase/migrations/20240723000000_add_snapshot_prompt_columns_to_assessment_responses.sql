-- Add snapshot and prompt columns referenced in Home.tsx
alter table public.assessment_responses
  add column if not exists snapshot_how_work_may_evolve text,
  add column if not exists snapshot_potential_future_directions text,
  add column if not exists snapshot_structured_next_steps text,
  add column if not exists prompt_how_work_may_evolve text,
  add column if not exists prompt_potential_future_directions text,
  add column if not exists prompt_structured_next_steps text;

-- Down migration
alter table public.assessment_responses
  drop column if exists snapshot_how_work_may_evolve,
  drop column if exists snapshot_potential_future_directions,
  drop column if exists snapshot_structured_next_steps,
  drop column if exists prompt_how_work_may_evolve,
  drop column if exists prompt_potential_future_directions,
  drop column if exists prompt_structured_next_steps;
