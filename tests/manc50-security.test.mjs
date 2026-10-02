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

test('new accounts are told to confirm email and can request a replacement link', async () => {
  const authContext = await read('../app/context/AuthContext.tsx');
  const authModal = await read('../app/components/AuthModal.tsx');
  assert.match(authContext, /emailRedirectTo:\s*authEmailRedirectTo\(\)/);
  assert.match(authContext, /requiresEmailConfirmation:\s*!data\.session/);
  assert.match(authContext, /supabase\.auth\.resend\(\{[\s\S]*type:\s*'signup'/);
  assert.match(authContext, /Confirm your email before signing in/);
  assert.match(authModal, /Account created\. We sent you a confirmation email/);
  assert.match(authModal, /Resend confirmation email/);
  assert.match(authModal, /Check your junk or spam folder/);
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
  assert.match(checkout, /p_dfe_urn:\s*schoolUrn/);
  assert.match(checkout, /client_reference_id:\s*reservation\.school_key/);
  assert.match(checkout, /metadata\[dfe_urn\]/);
  assert.match(checkout, /customer_email:\s*contactEmail/);
  assert.match(buyScreen, /Sign in to continue/);
  assert.match(buyScreen, /School postcode/);
  assert.match(buyScreen, /eligible Greater Manchester school/);
  assert.match(buyScreen, /manc50-schools/);
  assert.match(buyScreen, /We could not start secure checkout/);
  assert.match(buyScreen, /finally \{\s*setLoading\(false\)/);
  assert.match(buyScreen, /school_urn:\s*selectedSchool\.dfe_urn/);
  assert.match(buyScreen, /DfE URN/);
  assert.match(buyScreen, /ScrollView/);
  assert.doesNotMatch(buyScreen, /school_key:/);
  assert.doesNotMatch(buyScreen, /contact_email:/);
  assert.doesNotMatch(buyScreen, /School or setting name/);
  assert.doesNotMatch(buyScreen, /serves_ages_3_7/);
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

test('eligibility is resolved from the approved Edubase master by DfE URN', async () => {
  const migration = await read('../migrations/20261001_manc50_authoritative_identity_and_fulfilment.sql');
  const verify = await read('../migrations/20261001_manc50_authoritative_identity_and_fulfilment_verify.sql');
  const correction = await read('../migrations/20261001_manc50_priority_140_correction.sql');
  const correctionVerify = await read('../migrations/20261001_manc50_priority_140_correction_verify.sql');
  const lookup = await read('../supabase/functions/manc50-schools/index.ts');
  const seededUrns = [...migration.matchAll(/\((\d{6}), 'dfe-urn-\1'/g)].map((match) => match[1]);
  const correctedUrns = [...correction.matchAll(/\((\d{6}), 'dfe-urn-\1'/g)].map((match) => match[1]);
  assert.equal(seededUrns.length, 140);
  assert.equal(new Set(seededUrns).size, 140);
  assert.equal(correctedUrns.length, 140);
  assert.equal(new Set(correctedUrns).size, 140);
  assert.ok(correctedUrns.includes('106322'));
  assert.match(correction, /update public\.manc50_eligible_schools[\s\S]*eligible_for_manc50 = false/i);
  assert.match(correction, /\(106322, 'dfe-urn-106322', 'Kings Road Primary School'[\s\S]*'M16 0GR'[\s\S]*'M160GR'/i);
  assert.match(correctionVerify, /priority_140_exact_urn_set/);
  assert.match(correctionVerify, /kings_road_primary_lookup/);
  assert.match(migration, /create table if not exists public\.manc50_eligible_schools/i);
  assert.match(migration, /where dfe_urn = p_dfe_urn\s+and eligible_for_manc50 is true/i);
  assert.match(migration, /v_source\.school_key/);
  assert.match(migration, /drop function if exists public\.reserve_manc50_checkout\(uuid, text, text, text, text, text, text, boolean\)/i);
  assert.match(migration, /grant execute on function public\.reserve_manc50_checkout\(uuid, text, integer, text\)\s+to service_role/i);
  assert.match(lookup, /auth\.getUser\(token\)/);
  assert.match(lookup, /from\('manc50_eligible_schools'\)/);
  assert.match(lookup, /eq\('eligible_for_manc50', true\)/);
  assert.match(verify, /eligible_school_count/);
  assert.match(verify, /self_declared_reservation_rpc_removed/);
});

test('paid checkout creates one auditable order and physical fulfilment record', async () => {
  const migration = await read('../migrations/20261001_manc50_authoritative_identity_and_fulfilment.sql');
  const webhook = await read('../supabase/functions/manc50-webhook/index.ts');
  assert.match(migration, /create table if not exists public\.manc50_orders/i);
  assert.match(migration, /create table if not exists public\.manc50_fulfilments/i);
  assert.match(migration, /amount_total integer not null check \(amount_total = 500\)/i);
  assert.match(migration, /insert into public\.manc50_orders/i);
  assert.match(migration, /insert into public\.manc50_fulfilments/i);
  assert.match(migration, /create or replace function public\.update_manc50_fulfilment/i);
  assert.match(migration, /Carrier and tracking reference are required for dispatch/i);
  assert.match(migration, /Invalid fulfilment transition from % to %/i);
  assert.match(migration, /v_current\.status = 'pending' and p_status in \('preparing', 'issue', 'cancelled', 'refunded'\)/i);
  assert.match(migration, /create or replace function public\.get_manc50_fulfilment_queue\(\)/i);
  assert.match(migration, /fulfilment\.dispatch_due_at < now\(\) as is_overdue/i);
  assert.match(migration, /revoke all on function public\.get_manc50_fulfilment_queue\(\)[\s\S]*from public, anon, authenticated/i);
  assert.match(webhook, /session\.amount_total !== 500/);
  assert.match(webhook, /p_amount_total:\s*session\.amount_total/);
  assert.match(webhook, /p_currency:\s*session\.currency/);
});

test('webhook finalizes reserved checkout and retains legacy paid-session support', async () => {
  const source = await read('../supabase/functions/manc50-webhook/index.ts');
  assert.match(source, /metadata\?\.reservation_id/);
  assert.match(source, /finalize_manc50_checkout/);
  assert.match(source, /create_manc50_entitlement/);
  assert.match(source, /Invalid MANC50 amount or currency/);
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
  assert.match(buy, /accessibilityLabel="School postcode"/);
  assert.match(buy, /accessibilityRole="radio"/);
  assert.match(buy, /accessibilityLiveRegion="polite"/);
  assert.match(activate, /accessibilityLabel="Older activation token, optional"/);
  assert.match(privacy, /info@manypetals\.co\.uk/);
  assert.doesNotMatch(privacy, /manypetalslearning\.co\.uk/);
});
