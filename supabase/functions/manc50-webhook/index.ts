import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const encoder = new TextEncoder();

function required(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) result |= a[index] ^ b[index];
  return result === 0;
}

function hexToBytes(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  return bytes;
}

async function verifyStripeSignature(payload: string, signature: string): Promise<boolean> {
  const timestamp = signature.split(',').find((part) => part.startsWith('t='))?.slice(2);
  const provided = signature.split(',').filter((part) => part.startsWith('v1=')).map((part) => part.slice(3));
  if (!timestamp || !provided.length || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(required('STRIPE_WEBHOOK_SECRET')), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${payload}`)));
  return provided.some((candidate) => timingSafeEqual(digest, hexToBytes(candidate)));
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';

  try {
    if (!(await verifyStripeSignature(payload, signature))) return new Response('Invalid signature', { status: 400 });
    const event = JSON.parse(payload);
    if (event.type !== 'checkout.session.completed') return new Response(JSON.stringify({ received: true }));

    const session = event.data.object;
    if (session.payment_status !== 'paid' || session.metadata?.cohort !== 'MANC50') return new Response(JSON.stringify({ received: true }));
    if (session.amount_total !== 500 || String(session.currency ?? '').toLowerCase() !== 'gbp') {
      return new Response('Invalid MANC50 amount or currency', { status: 400 });
    }

    const supabase = createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'));
    const reservationId = session.metadata?.reservation_id;
    const { error } = reservationId
      ? await supabase.rpc('finalize_manc50_checkout', {
          p_reservation_id: reservationId,
          p_stripe_checkout_session_id: session.id,
          p_stripe_payment_intent_id: session.payment_intent,
          p_amount_total: session.amount_total,
          p_currency: session.currency,
          p_idempotency_key: `stripe:${event.id}`,
        })
      : await supabase.rpc('create_manc50_entitlement', {
          p_school_key: session.metadata.school_key,
          p_school_name: session.metadata.school_name,
          p_contact_email: session.metadata.contact_email,
          p_stripe_checkout_session_id: session.id,
          p_stripe_payment_intent_id: session.payment_intent,
          p_activation_token_hash: session.metadata.activation_token_hash,
          p_idempotency_key: `stripe:${event.id}`,
        });
    if (error) throw error;

    return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('MANC50 webhook failed', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
});
