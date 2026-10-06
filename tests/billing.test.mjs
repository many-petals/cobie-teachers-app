import test from 'node:test';
import assert from 'node:assert/strict';
import { createBillingHandler } from '../api/billing.mjs';

const env = {
  APP_URL: 'https://school.example', SUPABASE_URL: 'https://auth.example',
  SUPABASE_ANON_KEY: 'public-test-key', SUPABASE_SERVICE_ROLE_KEY: 'server-test-key',
  STRIPE_SECRET_KEY: 'sk_test_offline_fixture', STRIPE_PRICE_ID: 'price_teacher',
};
const user = { id: 'teacher-1', email: 'teacher@example.org', email_confirmed_at: '2026-09-15', app_metadata: {} };
const customer = { id: 'cus_teacher', metadata: { application: 'cobie-teachers', user_id: user.id } };
const subscription = { id: 'sub_1', status: 'active', metadata: { application: 'cobie-teachers' }, items: { data: [{ price: { id: 'price_teacher' } }] } };

async function call({ action = 'status', method, headers = {}, authenticatedUser = user, environment = env, routes = {}, body } = {}) {
  const calls = [];
  const fetcher = async (url, options) => {
    const parsed = new URL(url);
    calls.push({ url, options });
    let value;
    if (parsed.pathname === '/auth/v1/user') value = authenticatedUser;
    else if (parsed.pathname === '/rest/v1/manc50_entitlements') {
      const route = routes[`${options.method || 'GET'} ${parsed.pathname}`];
      value = route ? (typeof route === 'function' ? await route(options, parsed) : route) : [];
    }
    else {
      const route = routes[`${options.method || 'GET'} ${parsed.pathname}`];
      assert.ok(route, `Unexpected request: ${options.method || 'GET'} ${parsed.pathname}`);
      value = typeof route === 'function' ? await route(options, parsed) : route;
    }
    if (value instanceof Response) return value;
    return new Response(JSON.stringify(value), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const res = { code: 0, data: null, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
  await createBillingHandler({ env: environment, fetcher })({
    url: `/api/billing?action=${action}`, method: method || (action === 'status' ? 'GET' : 'POST'),
    headers: { authorization: 'Bearer valid-token', origin: env.APP_URL, ...headers }, body,
  }, res);
  return { ...res, calls };
}
const mappedUser = { ...user, app_metadata: { cobie_stripe_customer_test: customer.id } };
const mappedRoutes = subscriptions => ({
  'GET /v1/customers/cus_teacher': customer,
  'GET /v1/subscriptions': { data: subscriptions, has_more: false },
});

test('signed-out and forged-token requests cannot access billing', async () => {
  const missing = await call({ headers: { authorization: undefined } });
  assert.equal(missing.code, 401);
  assert.equal(missing.calls.length, 0);
  const forged = await call({ authenticatedUser: new Response('{}', { status: 401 }) });
  assert.equal(forged.code, 401);
  assert.equal(forged.calls.length, 1);
});
test('requires confirmed email, including for pilot accounts', async () => {
  const result = await call({ authenticatedUser: { ...user, email: 'mand1984@yahoo.co.uk', email_confirmed_at: null } });
  assert.equal(result.code, 403);
  assert.equal(result.calls.length, 1);
});
test('pilot access is bound to the authenticated user without a Stripe dependency', async () => {
  const result = await call({ environment: { ...env, STRIPE_SECRET_KEY: '' }, routes: {
    'GET /rest/v1/manc50_entitlements': (options, parsed) => {
      assert.equal(options.headers.apikey, env.SUPABASE_SERVICE_ROLE_KEY);
      assert.equal(parsed.searchParams.get('or'), `(purchased_by_user_id.eq.${user.id},activated_by_user_id.eq.${user.id})`);
      assert.equal(parsed.searchParams.get('status'), 'eq.activated');
      assert.match(parsed.searchParams.get('expires_at'), /^gt\./);
      return [{ id: 'entitlement-1', expires_at: '2026-12-15T00:00:00Z' }];
    },
  } });
  assert.equal(result.data.hasFullAccess, true);
  assert.equal(result.data.status, 'pilot');
  assert.equal(result.data.pilotEntitlementId, 'entitlement-1');
  assert.equal(result.data.pilotExpiresAt, '2026-12-15T00:00:00Z');
  assert.equal(result.calls.some(call => call.url.includes('api.stripe.com')), false);
});
test('an account without a bound active entitlement remains free', async () => {
  const result = await call();
  assert.equal(result.code, 200);
  assert.equal(result.data.hasFullAccess, false);
  assert.equal(result.data.status, 'free');
});
test('active pilot access cannot create a second checkout', async () => {
  const result = await call({ action: 'checkout', routes: {
    'GET /rest/v1/manc50_entitlements': [{ id: 'entitlement-1', expires_at: '2026-12-15T00:00:00Z' }],
  } });
  assert.equal(result.code, 409);
  assert.equal(result.calls.some(call => call.url.includes('api.stripe.com')), false);
});
test('free account cannot grant itself access through editable user metadata', async () => {
  const result = await call({ authenticatedUser: { ...user, user_metadata: { hasFullAccess: true, cobie_stripe_customer_test: customer.id } } });
  assert.equal(result.data.hasFullAccess, false);
  assert.equal(result.calls.length, 2);
  assert.equal(result.headers['Cache-Control'], 'private, no-store');
});
for (const status of ['active', 'trialing', 'past_due', 'unpaid', 'canceled', 'incomplete', 'incomplete_expired', 'paused']) {
  test(`subscription status ${status} grants only the intended access`, async () => {
    const result = await call({ authenticatedUser: mappedUser, routes: mappedRoutes([{ ...subscription, status }]) });
    assert.equal(result.code, 200);
    assert.equal(result.data.hasFullAccess, ['active', 'trialing'].includes(status));
    assert.equal(result.data.canManageBilling, true);
  });
}
test('wrong product and paused collection do not grant access', async () => {
  for (const sub of [
    { ...subscription, items: { data: [{ price: { id: 'price_other' } }] } },
    { ...subscription, metadata: { application: 'other-app' } },
    { ...subscription, pause_collection: { behavior: 'void' } },
  ]) {
    const result = await call({ authenticatedUser: mappedUser, routes: mappedRoutes([sub]) });
    assert.equal(result.data.hasFullAccess, false);
  }
});
test('a mapping to another teacher is rejected', async () => {
  const result = await call({ authenticatedUser: mappedUser, routes: { 'GET /v1/customers/cus_teacher': { ...customer, metadata: { ...customer.metadata, user_id: 'teacher-2' } } } });
  assert.equal(result.code, 403);
  assert.equal(result.calls.length, 3);
});
test('checkout rejects cross-origin POSTs and GET mutation attempts', async () => {
  const crossOrigin = await call({ action: 'checkout', headers: { origin: 'https://evil.example' } });
  assert.equal(crossOrigin.code, 403);
  assert.equal(crossOrigin.calls.length, 0);
  assert.equal((await call({ action: 'checkout', method: 'GET' })).code, 405);
});
test('new checkout maps the customer first and uses only server-owned price and user identity', async () => {
  const result = await call({ action: 'checkout', body: { price: 'price_attacker', user_id: 'teacher-2', hasFullAccess: true }, routes: {
    'POST /v1/customers': (options) => {
      const params = new URLSearchParams(options.body);
      assert.equal(params.get('metadata[user_id]'), user.id);
      assert.ok(options.headers['Idempotency-Key']);
      return customer;
    },
    'PUT /auth/v1/admin/users/teacher-1': options => {
      assert.equal(JSON.parse(options.body).app_metadata.cobie_stripe_customer_test, customer.id);
      assert.equal(options.headers.apikey, env.SUPABASE_SERVICE_ROLE_KEY);
      return user;
    },
    'GET /v1/checkout/sessions': { data: [], has_more: false },
    'POST /v1/checkout/sessions': options => {
      const params = new URLSearchParams(options.body);
      assert.equal(params.get('client_reference_id'), user.id);
      assert.equal(params.get('line_items[0][price]'), env.STRIPE_PRICE_ID);
      assert.equal(params.get('subscription_data[trial_period_days]'), '14');
      assert.equal(params.get('success_url'), `${env.APP_URL}/upgrade?checkout=success`);
      return { url: 'https://checkout.stripe.com/session' };
    },
  } });
  assert.equal(result.code, 200);
  assert.equal(result.data.url, 'https://checkout.stripe.com/session');
  assert.ok(result.calls.findIndex(c => c.url.includes('/admin/users/')) < result.calls.findIndex(c => c.options.method === 'POST' && c.url.includes('checkout/sessions')));
});
test('customer mapping failure prevents opening a checkout', async () => {
  const result = await call({ action: 'checkout', routes: {
    'POST /v1/customers': customer,
    'PUT /auth/v1/admin/users/teacher-1': new Response('{}', { status: 500 }),
  } });
  assert.equal(result.code, 503);
  assert.equal(result.calls.some(c => c.url.includes('checkout/sessions')), false);
});
test('existing subscription cannot create a second subscription', async () => {
  for (const status of ['active', 'trialing', 'past_due', 'unpaid', 'paused', 'incomplete']) {
    const result = await call({ action: 'checkout', authenticatedUser: mappedUser, routes: mappedRoutes([{ ...subscription, status }]) });
    assert.equal(result.code, 409);
  }
});
test('returning subscriber does not receive another trial', async () => {
  const result = await call({ action: 'checkout', authenticatedUser: mappedUser, routes: {
    ...mappedRoutes([{ ...subscription, status: 'canceled' }]),
    'GET /v1/checkout/sessions': { data: [], has_more: false },
    'POST /v1/checkout/sessions': options => {
      assert.equal(new URLSearchParams(options.body).has('subscription_data[trial_period_days]'), false);
      return { url: 'https://checkout.stripe.com/new' };
    },
  } });
  assert.equal(result.code, 200);
});
test('double click reuses an existing open checkout', async () => {
  const result = await call({ action: 'checkout', authenticatedUser: mappedUser, routes: {
    ...mappedRoutes([]),
    'GET /v1/checkout/sessions': { data: [{ id: 'cs_open', status: 'open', metadata: { application: 'cobie-teachers', price_id: env.STRIPE_PRICE_ID }, url: 'https://checkout.stripe.com/existing' }], has_more: false },
  } });
  assert.equal(result.data.url, 'https://checkout.stripe.com/existing');
  assert.equal(result.calls.some(c => c.options.method === 'POST'), false);
});
test('portal is bound to the signed-in customer even if the body supplies another ID', async () => {
  const result = await call({ action: 'portal', authenticatedUser: mappedUser, body: { customer: 'cus_other' }, routes: {
    ...mappedRoutes([subscription]),
    'POST /v1/billing_portal/sessions': options => {
      assert.equal(new URLSearchParams(options.body).get('customer'), customer.id);
      return { url: 'https://billing.stripe.com/portal' };
    },
  } });
  assert.equal(result.code, 200);
});
test('provider failure fails closed and does not expose provider responses', async () => {
  const result = await call({ authenticatedUser: mappedUser, routes: { 'GET /v1/customers/cus_teacher': new Response('private upstream details', { status: 500 }) } });
  assert.equal(result.code, 503);
  assert.equal(JSON.stringify(result.data).includes('private upstream'), false);
  assert.notEqual(result.data.hasFullAccess, true);
});
