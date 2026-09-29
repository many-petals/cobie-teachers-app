-- Read-only verification for the Cobie pilot database baseline.
-- Run after migrations/20260929_pilot_database_baseline.sql.
-- Expected result: every row should have status = 'ok'.

WITH required_tables(table_name) AS (
  VALUES
    ('teachers'),
    ('favourites'),
    ('completed_lessons'),
    ('saved_calm_configs'),
    ('tracker_pupils'),
    ('tracker_assessments'),
    ('tracker_emotion_logs')
),
required_policies(table_name, policy_name) AS (
  VALUES
    ('teachers', 'Teachers can manage own profile'),
    ('favourites', 'Teachers can manage own favourites'),
    ('completed_lessons', 'Teachers can manage own completed lessons'),
    ('saved_calm_configs', 'Teachers can manage own calm configs'),
    ('tracker_pupils', 'Teachers can manage own pupils'),
    ('tracker_assessments', 'Teachers can manage own assessments'),
    ('tracker_emotion_logs', 'Teachers can manage own emotion logs')
),
table_oids AS (
  SELECT
    table_name,
    to_regclass('public.' || table_name) AS table_oid
  FROM required_tables
),
table_checks AS (
  SELECT
    'table exists: ' || table_name AS check_name,
    CASE WHEN table_oid IS NOT NULL THEN 'ok' ELSE 'missing' END AS status
  FROM table_oids
),
rls_checks AS (
  SELECT
    'rls enabled: ' || t.table_name AS check_name,
    CASE WHEN c.relrowsecurity THEN 'ok' ELSE 'missing' END AS status
  FROM table_oids t
  LEFT JOIN pg_class c ON c.oid = t.table_oid
),
policy_checks AS (
  SELECT
    'policy exists: ' || rp.table_name || ' / ' || rp.policy_name AS check_name,
    CASE WHEN p.policyname IS NOT NULL THEN 'ok' ELSE 'missing' END AS status
  FROM required_policies rp
  LEFT JOIN pg_policies p
    ON p.schemaname = 'public'
   AND p.tablename = rp.table_name
   AND p.policyname = rp.policy_name
),
column_checks AS (
  SELECT
    'column exists: tracker_assessments.scale_version' AS check_name,
    CASE WHEN EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'tracker_assessments'
        AND column_name = 'scale_version'
    ) THEN 'ok' ELSE 'missing' END AS status
),
function_oids AS (
  SELECT to_regprocedure('public.save_tracker_observations(uuid,text,text,jsonb)') AS function_oid
),
function_checks AS (
  SELECT
    'function exists: save_tracker_observations(uuid,text,text,jsonb)' AS check_name,
    CASE WHEN function_oid IS NOT NULL THEN 'ok' ELSE 'missing' END AS status
  FROM function_oids
),
privilege_checks AS (
  SELECT
    'authenticated can use: ' || table_name AS check_name,
    CASE
      WHEN table_oid IS NOT NULL
       AND has_table_privilege('authenticated', table_oid, 'SELECT')
       AND has_table_privilege('authenticated', table_oid, 'INSERT')
       AND has_table_privilege('authenticated', table_oid, 'UPDATE')
       AND has_table_privilege('authenticated', table_oid, 'DELETE')
      THEN 'ok'
      ELSE 'missing'
    END AS status
  FROM table_oids
),
function_privilege_checks AS (
  SELECT
    'authenticated can execute: save_tracker_observations' AS check_name,
    CASE
      WHEN function_oid IS NOT NULL
       AND has_function_privilege('authenticated', function_oid, 'EXECUTE')
      THEN 'ok'
      ELSE 'missing'
    END AS status
  FROM function_oids
)
SELECT * FROM table_checks
UNION ALL SELECT * FROM rls_checks
UNION ALL SELECT * FROM policy_checks
UNION ALL SELECT * FROM column_checks
UNION ALL SELECT * FROM function_checks
UNION ALL SELECT * FROM privilege_checks
UNION ALL SELECT * FROM function_privilege_checks
ORDER BY status DESC, check_name;
