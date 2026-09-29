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
  assert.match(source, /if \(!token\.trim\(\)\)/);
  assert.doesNotMatch(source, /disabled=\{[^}]*!token\.trim\(\)/);
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
