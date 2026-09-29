-- Pilot database baseline for the Cobie teacher app.
-- Apply from the database owner's SQL console before inviting pilot schools.
-- The statements are idempotent and use the table names referenced by the live app.

BEGIN;

CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  school text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'Teacher',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.favourites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN ('lesson', 'activity', 'printable')),
  resource_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, resource_type, resource_id)
);

CREATE TABLE IF NOT EXISTS public.completed_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.saved_calm_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  emotion text NOT NULL,
  noise text NOT NULL,
  time_available integer NOT NULL CHECK (time_available > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tracker_pupils (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_code text NOT NULL,
  age_group text NOT NULL CHECK (age_group IN ('EYFS', 'KS1')),
  sen_status boolean NOT NULL DEFAULT false,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, display_code)
);

CREATE TABLE IF NOT EXISTS public.tracker_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pupil_id uuid NOT NULL REFERENCES public.tracker_pupils(id) ON DELETE CASCADE,
  milestone_id text NOT NULL,
  area_id text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 4),
  scale_version smallint NOT NULL DEFAULT 1 CHECK (scale_version IN (1, 2)),
  term text NOT NULL CHECK (term IN ('Autumn', 'Spring', 'Summer')),
  academic_year text NOT NULL CHECK (academic_year ~ '^\d{4}/\d{4}$'),
  assessed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, pupil_id, milestone_id, term, academic_year)
);

CREATE TABLE IF NOT EXISTS public.tracker_emotion_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pupil_id uuid NOT NULL REFERENCES public.tracker_pupils(id) ON DELETE CASCADE,
  emotion_id text NOT NULL,
  emotion_name text NOT NULL,
  context text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  logged_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tracker_assessments
  ADD COLUMN IF NOT EXISTS scale_version smallint NOT NULL DEFAULT 1 CHECK (scale_version IN (1, 2));

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_calm_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_pupils ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_emotion_logs ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.teachers,
  public.favourites,
  public.completed_lessons,
  public.saved_calm_configs,
  public.tracker_pupils,
  public.tracker_assessments,
  public.tracker_emotion_logs
TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'teachers' AND policyname = 'Teachers can manage own profile') THEN
    CREATE POLICY "Teachers can manage own profile" ON public.teachers
      FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'favourites' AND policyname = 'Teachers can manage own favourites') THEN
    CREATE POLICY "Teachers can manage own favourites" ON public.favourites
      FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'completed_lessons' AND policyname = 'Teachers can manage own completed lessons') THEN
    CREATE POLICY "Teachers can manage own completed lessons" ON public.completed_lessons
      FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_calm_configs' AND policyname = 'Teachers can manage own calm configs') THEN
    CREATE POLICY "Teachers can manage own calm configs" ON public.saved_calm_configs
      FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tracker_pupils' AND policyname = 'Teachers can manage own pupils') THEN
    CREATE POLICY "Teachers can manage own pupils" ON public.tracker_pupils
      FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tracker_assessments' AND policyname = 'Teachers can manage own assessments') THEN
    CREATE POLICY "Teachers can manage own assessments" ON public.tracker_assessments
      FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tracker_emotion_logs' AND policyname = 'Teachers can manage own emotion logs') THEN
    CREATE POLICY "Teachers can manage own emotion logs" ON public.tracker_emotion_logs
      FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.save_tracker_observations(
  p_pupil_id uuid,
  p_term text,
  p_academic_year text,
  p_observations jsonb
) RETURNS SETOF public.tracker_assessments
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  item jsonb;
  previous public.tracker_assessments%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  PERFORM 1
  FROM public.tracker_pupils
  WHERE id = p_pupil_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pupil not available';
  END IF;

  IF p_term NOT IN ('Autumn', 'Spring', 'Summer')
    OR p_academic_year IS NULL
    OR p_academic_year !~ '^\d{4}/\d{4}$'
    OR jsonb_typeof(p_observations) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Invalid observation request';
  END IF;

  IF (SELECT count(*) <> count(DISTINCT x->>'milestone_id') FROM jsonb_array_elements(p_observations) x) THEN
    RAISE EXCEPTION 'Duplicate or missing observation identifiers';
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(p_observations) LOOP
    IF item->>'area_id' IS NULL
      OR item->>'milestone_id' IS NULL
      OR coalesce((item->>'rating')::integer, 0) NOT BETWEEN 1 AND 4
      OR coalesce((item->>'scale_version')::integer, 0) NOT IN (1, 2) THEN
      RAISE EXCEPTION 'Invalid observation';
    END IF;

    SELECT * INTO previous
    FROM public.tracker_assessments
    WHERE user_id = auth.uid()
      AND pupil_id = p_pupil_id
      AND term = p_term
      AND academic_year = p_academic_year
      AND milestone_id = item->>'milestone_id';

    IF (item->>'scale_version')::integer = 1 THEN
      IF previous.id IS NULL
        OR previous.scale_version <> 1
        OR previous.rating <> (item->>'rating')::integer
        OR previous.area_id <> item->>'area_id' THEN
        RAISE EXCEPTION 'Historical observation changed; reload and review';
      END IF;
    ELSIF previous.id IS NULL THEN
      INSERT INTO public.tracker_assessments
        (user_id, pupil_id, milestone_id, area_id, rating, term, academic_year, scale_version)
      VALUES
        (auth.uid(), p_pupil_id, item->>'milestone_id', item->>'area_id', (item->>'rating')::integer, p_term, p_academic_year, 2);
    ELSIF previous.rating IS DISTINCT FROM (item->>'rating')::integer
      OR previous.scale_version <> 2 THEN
      UPDATE public.tracker_assessments
      SET rating = (item->>'rating')::integer,
          scale_version = 2,
          assessed_at = now()
      WHERE id = previous.id AND user_id = auth.uid();
    END IF;
  END LOOP;

  DELETE FROM public.tracker_assessments a
  WHERE a.user_id = auth.uid()
    AND a.pupil_id = p_pupil_id
    AND a.term = p_term
    AND a.academic_year = p_academic_year
    AND a.scale_version = 2
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(p_observations) x
      WHERE x->>'milestone_id' = a.milestone_id
    );

  RETURN QUERY
  SELECT *
  FROM public.tracker_assessments
  WHERE user_id = auth.uid()
    AND pupil_id = p_pupil_id
    AND term = p_term
    AND academic_year = p_academic_year;
END;
$$;

REVOKE ALL ON FUNCTION public.save_tracker_observations(uuid, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_tracker_observations(uuid, text, text, jsonb) TO authenticated;

COMMIT;