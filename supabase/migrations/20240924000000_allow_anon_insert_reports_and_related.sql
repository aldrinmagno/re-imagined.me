-- Allow anonymous insert access for report-related tables
-- This is needed to persist generated insights prior to user sign-in
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'Allow anon insert reports'
  ) THEN
    CREATE POLICY "Allow anon insert reports" ON public.reports
      FOR INSERT TO anon
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'future_roles' AND policyname = 'Allow anon insert future roles'
  ) THEN
    CREATE POLICY "Allow anon insert future roles" ON public.future_roles
      FOR INSERT TO anon
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'skills_to_build' AND policyname = 'Allow anon insert skills'
  ) THEN
    CREATE POLICY "Allow anon insert skills" ON public.skills_to_build
      FOR INSERT TO anon
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ninety_day_plan_phases' AND policyname = 'Allow anon insert plan phases'
  ) THEN
    CREATE POLICY "Allow anon insert plan phases" ON public.ninety_day_plan_phases
      FOR INSERT TO anon
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'plan_actions' AND policyname = 'Allow anon insert plan actions'
  ) THEN
    CREATE POLICY "Allow anon insert plan actions" ON public.plan_actions
      FOR INSERT TO anon
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'learning_resources' AND policyname = 'Allow anon insert resources'
  ) THEN
    CREATE POLICY "Allow anon insert resources" ON public.learning_resources
      FOR INSERT TO anon
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'interview_data' AND policyname = 'Allow anon insert interview data'
  ) THEN
    CREATE POLICY "Allow anon insert interview data" ON public.interview_data
      FOR INSERT TO anon
      WITH CHECK (true);
  END IF;
END $$;
