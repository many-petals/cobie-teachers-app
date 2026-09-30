import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('MANC50_ALLOWED_ORIGIN') ?? 'null',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function required(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function bearerToken(request: Request): string | null {
  const authorization = request.headers.get('Authorization') ?? '';
  return authorization.match(/^Bearer\s+(\S+)$/i)?.[1] ?? null;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  return String(error);
}

async function stripePost(path: string, params: Record<string, string>, idempotencyKey: string) {
  const body = new URLSearchParams(params);
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${required('STRIPE_SECRET_KEY')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': idempotencyKey,
    },
    body,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message ?? 'Stripe request failed');
  return payload;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  const token = bearerToken(request);
  if (!token) return json({ error: 'Sign in before starting checkout.' }, 401);

  try {
    const serviceClient = createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'));
    const { data: { user }, error: userError } = await serviceClient.auth.getUser(token);
    if (userError || !user?.id || !user.email) return json({ error: 'Please sign in again.' }, 401);
    if (!user.email_confirmed_at) return json({ error: 'Confirm your email address before starting checkout.' }, 403);

    const body = await request.json();
    const schoolUrn = Number(body.school_urn);
    const contactEmail = user.email.trim().toLowerCase();
    const successUrl = required('MANC50_SUCCESS_URL');
    const cancelUrl = required('MANC50_CANCEL_URL');
    const checkoutAttemptId = String(body.checkout_attempt_id ?? '').trim();

    if (!Number.isInteger(schoolUrn) || schoolUrn < 100000 || schoolUrn > 999999) {
      return json({ error: 'Choose an eligible school from the postcode search.' }, 400);
    }
    if (!/^[a-zA-Z0-9_-]{8,80}$/.test(checkoutAttemptId)) throw new Error('Invalid checkout_attempt_id');

    const { data: reservation, error: reservationError } = await serviceClient.rpc('reserve_manc50_checkout', {
      p_user_id: user.id,
      p_checkout_attempt_id: checkoutAttemptId,
      p_dfe_urn: schoolUrn,
      p_contact_email: contactEmail,
    });
    if (reservationError || !reservation?.id) throw reservationError ?? new Error('Checkout reservation failed');
    if (reservation.checkout_url) return json({ checkout_url: reservation.checkout_url });

    const idempotencyKey = `manc50-checkout-${reservation.id}`;
    const session = await stripePost('checkout/sessions', {
      mode: 'payment',
      'line_items[0][price]': required('MANC50_STRIPE_PRICE_ID'),
      'line_items[0][quantity]': '1',
      customer_email: contactEmail,
      client_reference_id: reservation.school_key,
      'metadata[cohort]': 'MANC50',
      'metadata[reservation_id]': reservation.id,
      'metadata[user_id]': user.id,
      'metadata[dfe_urn]': String(reservation.dfe_urn),
      'metadata[school_key]': reservation.school_key,
      'metadata[school_name]': reservation.school_name,
      'metadata[contact_email]': contactEmail,
      'metadata[delivery_postcode]': reservation.delivery_postcode,
      expires_at: String(Math.floor(Date.now() / 1000) + 35 * 60),
      success_url: successUrl,
      cancel_url: cancelUrl,
    }, idempotencyKey);

    const { error: attachError } = await serviceClient.rpc('attach_manc50_checkout_session', {
      p_reservation_id: reservation.id,
      p_user_id: user.id,
      p_stripe_checkout_session_id: session.id,
      p_checkout_url: session.url,
    });
    if (attachError) throw attachError;

    return json({ checkout_url: session.url });
  } catch (error) {
    console.error('MANC50 checkout failed', error);
    const message = errorMessage(error);
    if (/not eligible|eligible school/i.test(message)) return json({ error: 'That school is not currently eligible for MANC50.' }, 400);
    if (/pilot cap reached/i.test(message)) return json({ error: 'The 50-school pilot is currently full.' }, 409);
    if (/already has a MANC50 place/i.test(message)) return json({ error: 'This account or school already has a MANC50 place.' }, 409);
    if (/checkout is already in progress/i.test(message)) return json({ error: 'A checkout is already in progress for this account or school.' }, 409);
    return json({ error: 'Checkout is temporarily unavailable.' }, 503);
  }
});
