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

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return base64Url(new Uint8Array(digest));
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

  try {
    const body = await request.json();
    const schoolKey = String(body.school_key ?? '').trim().toLowerCase();
    const schoolName = String(body.school_name ?? '').trim();
    const contactEmail = String(body.contact_email ?? '').trim().toLowerCase();
    const successUrl = required('MANC50_SUCCESS_URL');
    const cancelUrl = required('MANC50_CANCEL_URL');
    const checkoutAttemptId = String(body.checkout_attempt_id ?? '').trim();

    if (!/^[a-z0-9][a-z0-9_-]{2,63}$/.test(schoolKey)) throw new Error('Invalid school_key');
    if (!schoolName || !contactEmail || !successUrl || !cancelUrl) throw new Error('Missing checkout details');
    if (checkoutAttemptId && !/^[a-zA-Z0-9_-]{8,80}$/.test(checkoutAttemptId)) throw new Error('Invalid checkout_attempt_id');

    const activationTokenBytes = crypto.getRandomValues(new Uint8Array(32));
    const activationToken = base64Url(activationTokenBytes);
    const activationTokenHash = await sha256(activationToken);
    const idempotencyKey = `manc50-checkout-${checkoutAttemptId || base64Url(crypto.getRandomValues(new Uint8Array(12)))}`;
    const session = await stripePost('checkout/sessions', {
      mode: 'payment',
      'line_items[0][price]': required('MANC50_STRIPE_PRICE_ID'),
      'line_items[0][quantity]': '1',
      'client_reference_id': schoolKey,
      'metadata[cohort]': 'MANC50',
      'metadata[school_key]': schoolKey,
      'metadata[school_name]': schoolName,
      'metadata[contact_email]': contactEmail,
      'metadata[activation_token_hash]': activationTokenHash,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }, idempotencyKey);

    return new Response(JSON.stringify({ checkout_url: session.url, activation_token: activationToken }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('MANC50 checkout failed', error);
    return new Response(JSON.stringify({ error: 'Checkout is temporarily unavailable.' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
