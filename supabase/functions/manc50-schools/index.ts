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
  if (!token) return json({ error: 'Sign in before looking up a school.' }, 401);

  try {
    const serviceClient = createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'));
    const { data: { user }, error: userError } = await serviceClient.auth.getUser(token);
    if (userError || !user?.id) return json({ error: 'Please sign in again.' }, 401);
    if (!user.email_confirmed_at) return json({ error: 'Confirm your email address before looking up a school.' }, 403);

    const body = await request.json();
    const postcode = String(body.postcode ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!/^(GIR0AA|[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2})$/.test(postcode)) {
      return json({ error: 'Enter a valid UK school postcode.' }, 400);
    }

    const { data: schools, error } = await serviceClient
      .from('manc50_eligible_schools')
      .select('dfe_urn,school_name,postcode,address_line_1,locality,town,setting_type,send_priority')
      .eq('postcode_lookup', postcode)
      .eq('eligible_for_manc50', true)
      .order('school_name')
      .limit(20);
    if (error) throw error;
    if (!schools?.length) return json({ error: 'No eligible MANC50 school was found at that postcode.' }, 404);

    return json({ schools });
  } catch (error) {
    console.error('MANC50 school lookup failed', error);
    return json({ error: 'School lookup is temporarily unavailable.' }, 503);
  }
});
