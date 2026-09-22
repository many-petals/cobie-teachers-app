-- Apply using the database owner's SQL console before publishing the app.
-- Historical clients omit this field and continue to write scale 1.
BEGIN;
ALTER TABLE public.tracker_assessments
  ADD COLUMN IF NOT EXISTS scale_version smallint NOT NULL DEFAULT 1
  CHECK (scale_version IN (1, 2));

CREATE OR REPLACE FUNCTION public.save_tracker_observations(
  p_pupil_id uuid, p_term text, p_academic_year text, p_observations jsonb
) RETURNS SETOF public.tracker_assessments
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE
  item jsonb;
  previous public.tracker_assessments%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  -- Serialise saves for this pupil. All reads/writes remain subject to RLS.
  PERFORM 1 FROM public.tracker_pupils
    WHERE id = p_pupil_id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pupil not available'; END IF;
  IF p_term NOT IN ('Autumn', 'Spring', 'Summer') OR p_term IS NULL
    OR p_academic_year IS NULL OR p_academic_year !~ '^\d{4}/\d{4}$'
    OR jsonb_typeof(p_observations) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Invalid observation request';
  END IF;
  IF (SELECT count(*) <> count(DISTINCT x->>'milestone_id')
      FROM jsonb_array_elements(p_observations) x) THEN
    RAISE EXCEPTION 'Duplicate or missing observation identifiers';
  END IF;
  FOR item IN SELECT * FROM jsonb_array_elements(p_observations) LOOP
    IF item->>'area_id' IS NULL OR item->>'milestone_id' IS NULL
      OR coalesce((item->>'rating')::integer, 0) NOT BETWEEN 1 AND 4
      OR coalesce((item->>'scale_version')::integer, 0) NOT IN (1, 2) THEN
      RAISE EXCEPTION 'Invalid observation';
    END IF;
    SELECT * INTO previous FROM public.tracker_assessments
      WHERE user_id = auth.uid() AND pupil_id = p_pupil_id
        AND term = p_term AND academic_year = p_academic_year
        AND milestone_id = item->>'milestone_id';
    IF (item->>'scale_version')::integer = 1 THEN
      -- Historical entries may only be carried forward unchanged.
      IF previous.id IS NULL OR previous.scale_version <> 1
        OR previous.rating <> (item->>'rating')::integer
        OR previous.area_id <> item->>'area_id' THEN
        RAISE EXCEPTION 'Historical observation changed; reload and review';
      END IF;
    ELSIF previous.id IS NULL THEN
      INSERT INTO public.tracker_assessments
        (user_id, pupil_id, milestone_id, area_id, rating, term, academic_year, scale_version)
      VALUES (auth.uid(), p_pupil_id, item->>'milestone_id', item->>'area_id',
        (item->>'rating')::integer, p_term, p_academic_year, 2);
    ELSIF previous.rating IS DISTINCT FROM (item->>'rating')::integer
      OR previous.scale_version <> 2 THEN
      UPDATE public.tracker_assessments SET rating = (item->>'rating')::integer,
        scale_version = 2, assessed_at = now()
        WHERE id = previous.id AND user_id = auth.uid();
    END IF;
  END LOOP;
  -- Clearing new entries never removes historical entries implicitly.
  DELETE FROM public.tracker_assessments a
    WHERE a.user_id = auth.uid() AND a.pupil_id = p_pupil_id
      AND a.term = p_term AND a.academic_year = p_academic_year AND a.scale_version = 2
      AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p_observations) x
        WHERE x->>'milestone_id' = a.milestone_id);
  RETURN QUERY SELECT * FROM public.tracker_assessments
    WHERE user_id = auth.uid() AND pupil_id = p_pupil_id
      AND term = p_term AND academic_year = p_academic_year;
END;
$$;
REVOKE ALL ON FUNCTION public.save_tracker_observations(uuid, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_tracker_observations(uuid, text, text, jsonb) TO authenticated;
COMMIT;
