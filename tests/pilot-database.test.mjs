import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const baseline = fs.readFileSync(new URL('../migrations/20260929_pilot_database_baseline.sql', import.meta.url), 'utf8');
const verify = fs.readFileSync(new URL('../migrations/20260929_pilot_database_verify.sql', import.meta.url), 'utf8');
const readme = fs.readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const rolloutPlan = fs.readFileSync(new URL('../docs/PILOT-ROLLOUT-PLAN.md', import.meta.url), 'utf8');
const readiness = fs.readFileSync(new URL('../docs/ROLLOUT-READINESS.md', import.meta.url), 'utf8');

const liveTables = [
  'teachers',
  'favourites',
  'completed_lessons',
  'saved_calm_configs',
  'tracker_pupils',
  'tracker_assessments',
  'tracker_emotion_logs',
];

const policyNames = [
  'Teachers can manage own profile',
  'Teachers can manage own favourites',
  'Teachers can manage own completed lessons',
  'Teachers can manage own calm configs',
  'Teachers can manage own pupils',
  'Teachers can manage own assessments',
  'Teachers can manage own emotion logs',
];

const legacyTableNames = [
  'user_profiles',
  'user_favourites',
  'user_completed_lessons',
  'user_calm_configs',
];

test('pilot baseline covers every live app table with RLS and authenticated grants', () => {
  for (const table of liveTables) {
    assert.match(baseline, new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}\\b`, 'i'), `${table} table is created`);
    assert.match(baseline, new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`, 'i'), `${table} enables RLS`);
    assert.match(baseline, new RegExp(`public\\.${table}[,\\s]`, 'i'), `${table} is included in authenticated grants`);
  }
});

test('pilot baseline uses current app table names rather than stale README names', () => {
  for (const legacyName of legacyTableNames) {
    assert.equal(baseline.includes(legacyName), false, `${legacyName} should not be in the pilot baseline`);
    assert.equal(readme.includes(legacyName), false, `${legacyName} should not be documented as current`);
  }
});

test('pilot baseline contains per-teacher policies and observation RPC', () => {
  for (const policyName of policyNames) {
    assert.match(baseline, new RegExp(`CREATE POLICY "${policyName}"`, 'i'), `${policyName} policy exists`);
  }

  assert.match(baseline, /CREATE OR REPLACE FUNCTION public\.save_tracker_observations\(/i);
  assert.match(baseline, /SECURITY INVOKER/i);
  assert.match(baseline, /GRANT EXECUTE ON FUNCTION public\.save_tracker_observations\(uuid, text, text, jsonb\) TO authenticated/i);
  assert.match(baseline, /ADD COLUMN IF NOT EXISTS scale_version smallint NOT NULL DEFAULT 1/i);
});

test('read-only verification checks the same baseline objects', () => {
  for (const table of liveTables) {
    assert.match(verify, new RegExp(`\\('${table}'\\)`, 'i'), `${table} is checked`);
  }

  for (const policyName of policyNames) {
    assert.match(verify, new RegExp(policyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `${policyName} is checked`);
  }

  assert.match(verify, /to_regprocedure\('public\.save_tracker_observations\(uuid,text,text,jsonb\)'\)/i);
  assert.match(verify, /has_function_privilege\('authenticated', function_oid, 'EXECUTE'\)/i);
  assert.match(verify, /ORDER BY status DESC, check_name/i);
});

test('pilot docs require baseline, verification, email setup and disposable account testing', () => {
  const docs = `${readme}\n${rolloutPlan}\n${readiness}`;
  assert.match(docs, /20260929_pilot_database_baseline\.sql/);
  assert.match(docs, /20260929_pilot_database_verify\.sql/);
  assert.match(docs, /dedicated auth email/i);
  assert.match(docs, /two disposable teacher accounts|disposable-account journey/i);
  assert.match(docs, /cross-account (database )?isolation/i);
});

test('privacy policy date is set for the current production deployment', () => {
  const privacy = fs.readFileSync(new URL('../app/privacy.tsx', import.meta.url), 'utf8');
  assert.match(privacy, /const LAST_UPDATED = '30 September 2026';/);
  assert.doesNotMatch(readiness, /privacy-policy date remains a deployment placeholder/i);
  assert.match(readiness, /privacy-policy date is set to 30 September 2026/i);
});
