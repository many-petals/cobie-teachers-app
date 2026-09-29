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

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return base64Url(new Uint8Array(digest));
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  const token = bearerToken(request);
  if (!token) return json({ error: 'Sign in before activating school access.' }, 401);

  try {
    const serviceClient = createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'));
    const { data: { user }, error: userError } = await serviceClient.auth.getUser(token);
    if (userError || !user?.id) return json({ error: 'Please sign in again.' }, 401);
    if (!user.email_confirmed_at) return json({ error: 'Confirm your email address before activating school access.' }, 403);

    const { activation_token: activationToken } = await request.json();
    if (typeof activationToken !== 'string' || activationToken.trim().length < 20) {
      return json({ error: 'Enter a valid activation token.' }, 400);
    }

    const { data, error } = await serviceClient.rpc('activate_manc50_entitlement', {
      p_activation_token_hash: await sha256(activationToken.trim()),
      p_user_id: user.id,
    });
    if (error) throw error;

    return json({ activated: true, entitlement_id: data.id, expires_at: data.expires_at });
  } catch (error) {
    console.error('MANC50 activation failed', error);
    return json({ error: 'That activation token is invalid, already used, or this account already has pilot access.' }, 400);
  }
});
