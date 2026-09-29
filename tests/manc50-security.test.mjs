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
  assert.match(buyScreen, /Sign in to continue/);
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
