import { createHash } from 'node:crypto';

const APP = 'cobie-teachers';
const PILOT_EMAILS = ['caroline_marklew@hotmail.com', 'mand1984@yahoo.co.uk'];
class BillingError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// Dependency injection keeps tests offline: no test creates a real customer or charge.
export function createBillingHandler({ env = process.env, fetcher = fetch } = {}) {
  function required(name) {
    if (!env[name]) throw new BillingError(503, 'Billing is not available yet. Please try again later.');
    return env[name];
  }
  async function request(url, options) {
    let response;
    try { response = await fetcher(url, { ...options, signal: AbortSignal.timeout(10000) }); }
    catch { throw new BillingError(503, 'We could not check your account. Please try again.'); }
    if (!response.ok) {
      throw new BillingError(response.status === 401 && url.includes('/auth/v1/user') ? 401 : 503,
        response.status === 401 && url.includes('/auth/v1/user')
          ? 'Please sign in again.' : 'Billing is temporarily unavailable. Please try again.');
    }
    return response.json();
  }
  async function stripe(path, params = {}, method = 'GET', idempotencyKey) {
    const form = new URLSearchParams(params);
    const headers = { Authorization: `Bearer ${required('STRIPE_SECRET_KEY')}` };
    if (method === 'POST') headers['Content-Type'] = 'application/x-www-form-urlencoded';
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    return request(`https://api.stripe.com/v1/${path}${method === 'GET' ? `?${form}` : ''}`, {
      method, headers, ...(method === 'POST' ? { body: form.toString() } : {}),
    });
  }
  async function list(path, params) {
    const result = [];
    let cursor;
    for (let page = 0; page < 20; page++) {
      const batch = await stripe(path, { ...params, limit: '100', ...(cursor ? { starting_after: cursor } : {}) });
      result.push(...batch.data);
      if (!batch.has_more) return result;
      cursor = batch.data.at(-1)?.id;
      if (!cursor) break;
    }
    throw new BillingError(503, 'We could not finish checking your subscription. Please contact support.');
  }
  function appUrl() {
    const url = new URL(required('APP_URL'));
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') throw new BillingError(503, 'Billing is not available yet.');
    return url.origin;
  }
  function ownsCustomer(customer, user) {
    return !customer.deleted && customer.metadata?.application === APP && customer.metadata?.user_id === user.id;
  }
  function grantsAccess(subscription, priceId) {
    return ['active', 'trialing'].includes(subscription.status)
      && !subscription.pause_collection
      && subscription.metadata?.application === APP
      && subscription.items?.data.some(item => item.price?.id === priceId);
  }

  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Vary', 'Authorization');
    try {
      const action = new URL(req.url, 'https://local.invalid').searchParams.get('action') || 'status';
      if (!['status', 'checkout', 'portal'].includes(action)) throw new BillingError(404, 'Unknown billing action.');
      if (req.method !== (action === 'status' ? 'GET' : 'POST')) {
        res.setHeader('Allow', action === 'status' ? 'GET' : 'POST');
        throw new BillingError(405, 'Method not allowed.');
      }
      if (req.method === 'POST' && req.headers.origin !== appUrl()) throw new BillingError(403, 'Please open billing from the app.');
      const token = req.headers.authorization;
      if (typeof token !== 'string' || !/^Bearer \S+$/.test(token)) throw new BillingError(401, 'Please sign in to continue.');
      const authUrl = required('SUPABASE_URL').replace(/\/$/, '');
      const user = await request(`${authUrl}/auth/v1/user`, {
        headers: { Authorization: token, apikey: required('SUPABASE_ANON_KEY') },
      });
      if (!user.id || !user.email || !user.email_confirmed_at) throw new BillingError(403, 'Please confirm your email address before upgrading.');
      const pilot = PILOT_EMAILS.includes(user.email.toLowerCase());
      if (action === 'status' && pilot) return res.status(200).json({ hasFullAccess: true, status: 'pilot', canManageBilling: false });
      if (action === 'checkout' && pilot) throw new BillingError(409, 'You already have pilot access.');
      const priceId = required('STRIPE_PRICE_ID');
      const mode = required('STRIPE_SECRET_KEY').includes('_test_') ? 'test' : 'live';
      const mappingKey = `cobie_stripe_customer_${mode}`;
      let customerId = user.app_metadata?.[mappingKey];
      if (customerId) {
        const customer = await stripe(`customers/${encodeURIComponent(customerId)}`);
        if (!ownsCustomer(customer, user)) throw new BillingError(403, 'Your billing account needs support. Please contact us.');
      }
      const subscriptions = customerId ? await list('subscriptions', { customer: customerId, status: 'all' }) : [];
      const relevant = subscriptions.filter(sub => sub.metadata?.application === APP);
      const active = relevant.find(sub => grantsAccess(sub, priceId));
      if (action === 'status') return res.status(200).json({
        hasFullAccess: Boolean(active), status: active?.status || relevant[0]?.status || 'free',
        canManageBilling: Boolean(customerId),
      });
      if (action === 'portal') {
        if (!customerId) throw new BillingError(404, 'There is no billing account to manage yet.');
        const portal = await stripe('billing_portal/sessions', { customer: customerId, return_url: `${appUrl()}/upgrade` }, 'POST');
        return res.status(200).json({ url: portal.url });
      }
      if (active || relevant.some(sub => ['past_due', 'unpaid', 'paused', 'incomplete'].includes(sub.status))) {
        throw new BillingError(409, 'You already have a subscription. Use Manage billing to update it.');
      }
      // Never create a checkout until the trusted customer mapping can be saved.
      const serviceKey = required('SUPABASE_SERVICE_ROLE_KEY');
      if (!customerId) {
        const customer = await stripe('customers', {
          email: user.email, 'metadata[application]': APP, 'metadata[user_id]': user.id,
        }, 'POST', `${APP}-customer-${mode}-${user.id}`);
        customerId = customer.id;
        await request(`${authUrl}/auth/v1/admin/users/${encodeURIComponent(user.id)}`, {
          method: 'PUT', headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ app_metadata: { [mappingKey]: customerId } }),
        });
      }
      // Reuse an open checkout, including when the teacher refreshes or double-clicks.
      const sessions = await list('checkout/sessions', { customer: customerId });
      const ownSessions = sessions.filter(session => session.metadata?.application === APP && session.metadata?.price_id === priceId);
      const existing = ownSessions.find(session => session.status === 'open');
      if (existing) return res.status(200).json({ url: existing.url });
      const last = relevant[0];
      const trialDays = relevant.length === 0 ? '14' : undefined;
      const key = createHash('sha256').update(`${customerId}:${priceId}:${last?.id || 'new'}:${ownSessions[0]?.id || 'first'}`).digest('hex');
      const session = await stripe('checkout/sessions', {
        mode: 'subscription', customer: customerId, client_reference_id: user.id,
        'line_items[0][price]': priceId, 'line_items[0][quantity]': '1',
        'metadata[application]': APP, 'metadata[price_id]': priceId,
        'subscription_data[metadata][application]': APP, 'subscription_data[metadata][user_id]': user.id,
        ...(trialDays ? { 'subscription_data[trial_period_days]': trialDays } : {}),
        payment_method_collection: 'always',
        success_url: `${appUrl()}/upgrade?checkout=success`, cancel_url: `${appUrl()}/upgrade?checkout=cancelled`,
      }, 'POST', `${APP}-checkout-${key}`);
      return res.status(200).json({ url: session.url });
    } catch (error) {
      // Do not expose provider responses, credentials, tokens or pupil/account data.
      return res.status(error instanceof BillingError ? error.status : 503).json({
        error: error instanceof BillingError ? error.message : 'Billing is temporarily unavailable. Please try again.',
      });
    }
  };
}

export default createBillingHandler();
