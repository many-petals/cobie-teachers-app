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

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  const token = bearerToken(request);
  if (!token) return json({ error: 'Sign in before recording pilot use.' }, 401);

  try {
    const serviceClient = createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'));
    const { data: { user }, error: userError } = await serviceClient.auth.getUser(token);
    if (userError || !user?.id) return json({ error: 'Please sign in again.' }, 401);

    const body = await request.json();
    const entitlementId = String(body.entitlement_id ?? '');
    const eventName = String(body.event_name ?? '');
    const idempotencyKey = String(body.idempotency_key ?? '');
    if (!entitlementId || idempotencyKey.length < 8 || idempotencyKey.length > 500 || !['first_value', 'qualifying_use'].includes(eventName)) {
      return json({ error: 'Invalid event.' }, 400);
    }

    const { error } = await serviceClient.rpc('record_manc50_event', {
      p_entitlement_id: entitlementId,
      p_user_id: user.id,
      p_event_name: eventName,
      p_event_date: new Date().toISOString().slice(0, 10),
      p_idempotency_key: `${user.id}:${idempotencyKey}`,
      p_metadata: {},
    });
    if (error) throw error;
    return json({ recorded: true });
  } catch (error) {
    console.error('MANC50 event failed', error);
    return json({ error: 'Event could not be recorded.' }, 400);
  }
});
