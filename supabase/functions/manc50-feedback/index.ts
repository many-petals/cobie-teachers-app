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

function integer(value: unknown): number | null {
  return Number.isInteger(value) ? Number(value) : null;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const token = bearerToken(request);
  if (!token) return json({ error: 'Sign in before sending pilot feedback.' }, 401);

  try {
    const serviceClient = createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'));
    const { data: { user }, error: userError } = await serviceClient.auth.getUser(token);
    if (userError || !user?.id) return json({ error: 'Please sign in again.' }, 401);

    const body = await request.json();
    const entitlementId = String(body.entitlement_id ?? '');
    const stage = String(body.stage ?? '');
    const easeOfUse = integer(body.ease_of_use_rating);
    const lessonClarity = integer(body.lesson_clarity_rating);
    const pupilEngagement = integer(body.pupil_engagement_rating);
    const sendSuitability = integer(body.send_suitability_rating);
    const recommend = integer(body.recommend_rating);
    const workedWell = String(body.worked_well ?? '').trim();
    const improve = String(body.improve ?? '').trim();
    const followUpOk = body.follow_up_ok === true;

    if (!entitlementId
      || !['onboarding', 'week_2', 'end'].includes(stage)
      || [easeOfUse, lessonClarity, pupilEngagement, sendSuitability].some((rating) => rating === null || rating < 1 || rating > 5)
      || recommend === null || recommend < 0 || recommend > 10
      || workedWell.length > 2000 || improve.length > 2000) {
      return json({ error: 'Complete each rating before sending feedback.' }, 400);
    }

    const { data, error } = await serviceClient.rpc('submit_manc50_feedback', {
      p_entitlement_id: entitlementId,
      p_user_id: user.id,
      p_stage: stage,
      p_ease_of_use_rating: easeOfUse,
      p_lesson_clarity_rating: lessonClarity,
      p_pupil_engagement_rating: pupilEngagement,
      p_send_suitability_rating: sendSuitability,
      p_recommend_rating: recommend,
      p_worked_well: workedWell,
      p_improve: improve,
      p_follow_up_ok: followUpOk,
    });
    if (error || !data?.id) throw error ?? new Error('Feedback was not saved');

    return json({ saved: true, feedback_id: data.id });
  } catch (error) {
    console.error('MANC50 feedback failed', error);
    return json({ error: 'We could not save your feedback. Please try again.' }, 400);
  }
});
