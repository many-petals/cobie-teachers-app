begin;

create table if not exists public.manc50_feedback (
  id uuid primary key default gen_random_uuid(),
  entitlement_id uuid not null references public.manc50_entitlements(id) on delete restrict,
  user_id uuid references auth.users(id) on delete set null,
  stage text not null check (stage in ('onboarding', 'week_2', 'end')),
  ease_of_use_rating smallint not null check (ease_of_use_rating between 1 and 5),
  lesson_clarity_rating smallint not null check (lesson_clarity_rating between 1 and 5),
  pupil_engagement_rating smallint not null check (pupil_engagement_rating between 1 and 5),
  send_suitability_rating smallint not null check (send_suitability_rating between 1 and 5),
  recommend_rating smallint not null check (recommend_rating between 0 and 10),
  worked_well text not null default '' check (char_length(worked_well) <= 2000),
  improve text not null default '' check (char_length(improve) <= 2000),
  follow_up_ok boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entitlement_id, user_id, stage)
);

alter table public.manc50_feedback enable row level security;
revoke all on table public.manc50_feedback from public, anon, authenticated;
grant all on table public.manc50_feedback to service_role;

create or replace function public.submit_manc50_feedback(
  p_entitlement_id uuid,
  p_user_id uuid,
  p_stage text,
  p_ease_of_use_rating smallint,
  p_lesson_clarity_rating smallint,
  p_pupil_engagement_rating smallint,
  p_send_suitability_rating smallint,
  p_recommend_rating smallint,
  p_worked_well text,
  p_improve text,
  p_follow_up_ok boolean
)
returns public.manc50_feedback
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_feedback public.manc50_feedback;
begin
  if not exists (
    select 1
    from public.manc50_entitlements
    where id = p_entitlement_id
      and activated_by_user_id = p_user_id
      and status in ('activated', 'expired')
      and expires_at > now() - interval '30 days'
  ) then
    raise exception 'Active or recently completed MANC50 access is required';
  end if;

  if p_stage not in ('onboarding', 'week_2', 'end')
    or p_ease_of_use_rating not between 1 and 5
    or p_lesson_clarity_rating not between 1 and 5
    or p_pupil_engagement_rating not between 1 and 5
    or p_send_suitability_rating not between 1 and 5
    or p_recommend_rating not between 0 and 10
    or char_length(coalesce(p_worked_well, '')) > 2000
    or char_length(coalesce(p_improve, '')) > 2000 then
    raise exception 'Invalid pilot feedback';
  end if;

  insert into public.manc50_feedback (
    entitlement_id,
    user_id,
    stage,
    ease_of_use_rating,
    lesson_clarity_rating,
    pupil_engagement_rating,
    send_suitability_rating,
    recommend_rating,
    worked_well,
    improve,
    follow_up_ok
  ) values (
    p_entitlement_id,
    p_user_id,
    p_stage,
    p_ease_of_use_rating,
    p_lesson_clarity_rating,
    p_pupil_engagement_rating,
    p_send_suitability_rating,
    p_recommend_rating,
    left(coalesce(p_worked_well, ''), 2000),
    left(coalesce(p_improve, ''), 2000),
    coalesce(p_follow_up_ok, false)
  )
  on conflict (entitlement_id, user_id, stage) do update
    set ease_of_use_rating = excluded.ease_of_use_rating,
        lesson_clarity_rating = excluded.lesson_clarity_rating,
        pupil_engagement_rating = excluded.pupil_engagement_rating,
        send_suitability_rating = excluded.send_suitability_rating,
        recommend_rating = excluded.recommend_rating,
        worked_well = excluded.worked_well,
        improve = excluded.improve,
        follow_up_ok = excluded.follow_up_ok,
        updated_at = now()
  returning * into v_feedback;

  return v_feedback;
end;
$function$;

create or replace function public.get_manc50_pilot_metrics()
returns table (metric text, value bigint)
language sql
security definer
set search_path = public, pg_temp
as $function$
  select 'capacity_total', 50::bigint
  union all select 'places_paid', count(*) from public.manc50_entitlements where cohort = 'MANC50'
  union all select 'places_reserved', count(*) from public.manc50_checkout_reservations where status = 'reserved' and reserved_until > now()
  union all select 'places_remaining', greatest(50 - (
    (select count(*) from public.manc50_entitlements where cohort = 'MANC50')
    +
    (select count(*) from public.manc50_checkout_reservations where status = 'reserved' and reserved_until > now())
  ), 0)::bigint
  union all select 'schools_activated', count(*) from public.manc50_entitlements where status = 'activated'
  union all select 'schools_active_now', count(*) from public.manc50_entitlements where status = 'activated' and expires_at > now()
  union all select 'schools_first_value', count(distinct school_id) from public.manc50_events where event_name = 'first_value'
  union all select 'schools_qualifying_use', count(distinct school_id) from public.manc50_events where event_name = 'qualifying_use'
  union all select 'schools_active_7d', count(distinct school_id) from public.manc50_events where event_name in ('first_value', 'qualifying_use') and event_date >= current_date - 6
  union all select 'feedback_responses', count(*) from public.manc50_feedback;
$function$;

revoke all on function public.submit_manc50_feedback(uuid, uuid, text, smallint, smallint, smallint, smallint, smallint, text, text, boolean) from public, anon, authenticated;
grant execute on function public.submit_manc50_feedback(uuid, uuid, text, smallint, smallint, smallint, smallint, smallint, text, text, boolean) to service_role;
revoke all on function public.get_manc50_pilot_metrics() from public, anon, authenticated;
grant execute on function public.get_manc50_pilot_metrics() to service_role;

commit;
