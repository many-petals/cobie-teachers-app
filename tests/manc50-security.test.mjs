import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('billing has no email allow-list and queries user-bound active entitlements', async () => {
  const source = await read('../api/billing.mjs');
  assert.doesNotMatch(source, /PILOT_EMAILS|hotmail\.com|yahoo\.co\.uk/i);
  assert.match(source, /activated_by_user_id/);
  assert.match(source, /status:\s*'eq\.activated'/);
  assert.match(source, /expires_at:\s*`gt\./);
});

test('activation verifies the signed-in account and binds its user id', async () => {
  const source = await read('../supabase/functions/manc50-activate/index.ts');
  assert.match(source, /auth\.getUser\(token\)/);
  assert.match(source, /p_user_id:\s*user\.id/);
  assert.match(source, /email_confirmed_at/);
});

test('activation lets a teacher sign in before requiring the token', async () => {
  const source = await read('../app/manc50-activate.tsx');
  assert.match(source, /if \(!user\)[\s\S]*setShowAuthModal\(true\)/);
  assert.match(source, /body:\s*token\.trim\(\)\s*\?\s*\{\s*activation_token/);
  assert.match(source, /Older purchase token \(optional\)/);
  assert.doesNotMatch(source, /disabled=\{[^}]*!token\.trim\(\)/);
});

test('new checkout is authenticated, account-bound and capacity-reserved before Stripe', async () => {
  const checkout = await read('../supabase/functions/manc50-checkout/index.ts');
  const buyScreen = await read('../app/manc50-buy.tsx');
  assert.match(checkout, /auth\.getUser\(token\)/);
  assert.match(checkout, /reserve_manc50_checkout/);
  assert.match(checkout, /attach_manc50_checkout_session/);
  assert.match(checkout, /manc50-checkout-\$\{reservation\.id\}/);
  assert.match(checkout, /expires_at:\s*String\(Math\.floor\(Date\.now\(\) \/ 1000\) \+ 35 \* 60\)/);
  assert.match(checkout, /typeof error\.message === 'string'/);
  assert.match(checkout, /allowedSettingTypes/);
  assert.match(checkout, /servesAgesThreeToSeven/);
  assert.match(checkout, /p_postcode:\s*postcode/);
  assert.match(checkout, /p_setting_type:\s*settingType/);
  assert.match(checkout, /p_serves_ages_3_7:\s*servesAgesThreeToSeven/);
  assert.match(checkout, /Enter a valid UK school or setting postcode/);
  assert.match(checkout, /canonicalSchoolKey\(schoolName, postcode\)/);
  assert.match(buyScreen, /Sign in to continue/);
  assert.match(buyScreen, /School or setting postcode/);
  assert.match(buyScreen, /I confirm this setting serves children aged 3–7/);
  assert.match(buyScreen, /ScrollView/);
  assert.doesNotMatch(buyScreen, /school_key:/);
  assert.doesNotMatch(buyScreen, /contact_email:/);
});

test('release controls prevent overselling and make paid access recoverable by account', async () => {
  const migration = await read('../migrations/20260930_manc50_release_controls.sql');
  assert.match(migration, /create table if not exists public\.manc50_checkout_reservations/i);
  assert.match(migration, /pg_advisory_xact_lock\(hashtext\('manc50-entitlement-cap'\)\)/i);
  assert.match(migration, /manc50_entitlements[\s\S]*manc50_checkout_reservations[\s\S]*>= 50/i);
  assert.match(migration, /create or replace function public\.finalize_manc50_checkout/i);
  assert.match(migration, /Stripe can legitimately deliver the same completed session/i);
  assert.match(migration, /create or replace function public\.activate_manc50_entitlement_for_user/i);
  assert.match(migration, /create or replace function public\.get_manc50_pilot_metrics/i);
  assert.match(migration, /revoke all on function public\.reserve_manc50_checkout/i);
  assert.match(migration, /grant execute on function public\.get_manc50_pilot_metrics\(\) to service_role/i);
});

test('eligibility is enforced by the server and retained for SEND-first reporting', async () => {
  const migration = await read('../migrations/20260930_manc50_eligibility.sql');
  const verify = await read('../migrations/20260930_manc50_eligibility_verify.sql');
  assert.match(migration, /p_serves_ages_3_7 is distinct from true/i);
  assert.match(migration, /p_setting_type not in/i);
  assert.match(migration, /A valid UK school or setting postcode is required/i);
  assert.match(migration, /send_priority/i);
  assert.match(migration, /sync_manc50_school_eligibility_after_conversion/i);
  assert.match(migration, /drop function if exists public\.reserve_manc50_checkout\(uuid, text, text, text, text\)/i);
  assert.match(migration, /grant execute on function public\.reserve_manc50_checkout\(uuid, text, text, text, text, text, text, boolean\)\s+to service_role/i);
  assert.match(verify, /eligibility_rpc_private/i);
  assert.match(verify, /legacy_rpc_removed/i);
});

test('webhook finalizes reserved checkout and retains legacy paid-session support', async () => {
  const source = await read('../supabase/functions/manc50-webhook/index.ts');
  assert.match(source, /metadata\?\.reservation_id/);
  assert.match(source, /finalize_manc50_checkout/);
  assert.match(source, /create_manc50_entitlement/);
});

test('measurement verifies the signed-in account and cannot use another entitlement', async () => {
  const source = await read('../supabase/functions/manc50-event/index.ts');
  assert.match(source, /auth\.getUser\(token\)/);
  assert.match(source, /p_user_id:\s*user\.id/);
  assert.match(source, /p_entitlement_id:\s*entitlementId/);
});

test('database migration removes legacy RPC signatures and restricts execution', async () => {
  const source = await read('../migrations/20260929_manc50_account_binding.sql');
  assert.match(source, /drop function if exists public\.activate_manc50_entitlement\(text\)/i);
  assert.match(source, /drop function if exists public\.record_manc50_event\(uuid, text, date, text, jsonb\)/i);
  assert.match(source, /activated_by_user_id = p_user_id/i);
  assert.match(source, /revoke all on function public\.activate_manc50_entitlement/i);
  assert.match(source, /grant execute on function public\.record_manc50_event/i);
});

test('first-value and qualifying-use analytics have stable, meaningful identities', async () => {
  const measurement = await read('../app/lib/manc50.ts');
  const auth = await read('../app/context/AuthContext.tsx');
  assert.match(measurement, /pilot:first_value:\$\{entitlementId\}/);
  assert.match(measurement, /lesson:\$\{eventName\}:\$\{entitlementId\}:\$\{today\}:\$\{lessonId\}/);
  assert.match(auth, /recordManc50Use\('first_value'/);
  assert.match(auth, /recordManc50Use\('qualifying_use'/);
});

test('pilot feedback is account-bound, structured, private and reachable in the app', async () => {
  const migration = await read('../migrations/20260930_manc50_feedback.sql');
  const edge = await read('../supabase/functions/manc50-feedback/index.ts');
  const screen = await read('../app/manc50-feedback.tsx');
  const layout = await read('../app/_layout.tsx');
  assert.match(migration, /create table if not exists public\.manc50_feedback/i);
  assert.match(migration, /activated_by_user_id = p_user_id/i);
  assert.match(migration, /revoke all on table public\.manc50_feedback from public, anon, authenticated/i);
  assert.match(migration, /unique \(entitlement_id, user_id, stage\)/i);
  assert.match(edge, /auth\.getUser\(token\)/);
  assert.match(edge, /submit_manc50_feedback/);
  assert.match(screen, /Do not include pupil names or identifying information/);
  assert.match(screen, /SEND suitability/);
  assert.match(layout, /name="manc50-feedback"/);
});

test('pilot entry screens expose labels and the published support contact', async () => {
  const buy = await read('../app/manc50-buy.tsx');
  const activate = await read('../app/manc50-activate.tsx');
  const privacy = await read('../app/privacy.tsx');
  assert.match(buy, /accessibilityLabel="School or setting name"/);
  assert.match(activate, /accessibilityLabel="Older activation token, optional"/);
  assert.match(privacy, /info@manypetals\.co\.uk/);
  assert.doesNotMatch(privacy, /manypetalslearning\.co\.uk/);
});
