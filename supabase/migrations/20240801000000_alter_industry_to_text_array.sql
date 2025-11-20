-- Ensure existing databases store industry as text[] instead of text
alter table public.assessment_responses
  alter column industry type text[] using case when industry is null then '{}'::text[] else array[industry] end;

-- Down migration
alter table public.assessment_responses
  alter column industry type text using industry[1];
