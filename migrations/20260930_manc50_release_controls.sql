begin;

-- Reserve one of the 50 pilot places before Stripe can take payment. A
-- reservation lasts longer than the Stripe Checkout session so a delayed
-- webhook cannot oversell the pilot.
create table if not exists public.manc50_checkout_reservations (
  id uuid primary key default gen_random_uuid(),
  checkout_attempt_id text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  school_key text not null,
  school_name text not null,
  contact_email text not null,
  status text not null default 'reserved'
    check (status in ('reserved', 'converted', 'released', 'expired')),
  stripe_checkout_session_id text unique,
  checkout_url text,
  reserved_until timestamptz not null default (now() + interval '2 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.manc50_checkout_reservations enable row level security;
revoke all on table public.manc50_checkout_reservations from public, anon, authenticated;
grant all on table public.manc50_checkout_reservations to service_role;

create unique index if not exists manc50_one_open_reservation_per_user
  on public.manc50_checkout_reservations (user_id)
  where status = 'reserved';

create unique index if not exists manc50_one_open_reservation_per_school
  on public.manc50_checkout_reservations (school_key)
  where status = 'reserved';

alter table public.manc50_entitlements
  add column if not exists purchased_by_user_id uuid references auth.users(id) on delete set null;

comment on column public.manc50_entitlements.purchased_by_user_id is
  'Verified teacher account that initiated and paid for this MANC50 place.';

-- Safely recover existing paid test purchases when the confirmed account uses
-- the same contact email. Ambiguous duplicate matches are deliberately skipped.
with unique_matches as (
  select
    entitlement.id as entitlement_id,
    min(account.id::text)::uuid as user_id,
    entitlement.status,
    entitlement.created_at
  from public.manc50_entitlements entitlement
  join public.manc50_schools school on school.id = entitlement.school_id
  join auth.users account on lower(account.email) = lower(school.contact_email)
  where account.email_confirmed_at is not null
    and entitlement.purchased_by_user_id is null
  group by entitlement.id, entitlement.status, entitlement.created_at
  having count(*) = 1
), ranked_matches as (
  select
    entitlement_id,
    user_id,
    row_number() over (
      partition by user_id
      order by (status = 'purchased') desc, created_at desc, entitlement_id
    ) as match_rank
  from unique_matches
)
update public.manc50_entitlements entitlement
set purchased_by_user_id = ranked_matches.user_id,
    updated_at = now()
from ranked_matches
where entitlement.id = ranked_matches.entitlement_id
  and ranked_matches.match_rank = 1
  and entitlement.purchased_by_user_id is null;

create unique index if not exists manc50_entitlements_one_purchase_per_teacher
  on public.manc50_entitlements (purchased_by_user_id)
  where purchased_by_user_id is not null;

create or replace function public.reserve_manc50_checkout(
  p_user_id uuid,
  p_checkout_attempt_id text,
  p_school_key text,
  p_school_name text,
  p_contact_email text
)
returns public.manc50_checkout_reservations
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_reservation public.manc50_checkout_reservations;
begin
  if p_user_id is null then
    raise exception 'A confirmed teacher account is required';
  end if;
  if p_checkout_attempt_id is null or btrim(p_checkout_attempt_id) = '' then
    raise exception 'checkout_attempt_id is required';
  end if;
  if p_school_key is null or btrim(p_school_key) = '' then
    raise exception 'school_key is required';
  end if;
  if p_school_name is null or btrim(p_school_name) = '' then
    raise exception 'school_name is required';
  end if;
  if p_contact_email is null or btrim(p_contact_email) = '' then
    raise exception 'contact_email is required';
  end if;

  perform pg_advisory_xact_lock(hashtext('manc50-entitlement-cap'));

  update public.manc50_checkout_reservations
  set status = 'expired', updated_at = now()
  where status = 'reserved' and reserved_until <= now();

  select * into v_reservation
  from public.manc50_checkout_reservations
  where checkout_attempt_id = p_checkout_attempt_id;

  if v_reservation.id is not null then
    if v_reservation.user_id <> p_user_id then
      raise exception 'Checkout attempt belongs to another account';
    end if;
    return v_reservation;
  end if;

  if exists (
    select 1 from public.manc50_entitlements
    where purchased_by_user_id = p_user_id or activated_by_user_id = p_user_id
  ) then
    raise exception 'This account already has a MANC50 place';
  end if;

  if exists (
    select 1
    from public.manc50_entitlements entitlement
    join public.manc50_schools school on school.id = entitlement.school_id
    where school.school_key = lower(btrim(p_school_key))
  ) then
    raise exception 'This school already has a MANC50 place';
  end if;

  select * into v_reservation
  from public.manc50_checkout_reservations
  where status = 'reserved'
    and (user_id = p_user_id or school_key = lower(btrim(p_school_key)))
  limit 1;

  if v_reservation.id is not null then
    if v_reservation.user_id = p_user_id
      and v_reservation.school_key = lower(btrim(p_school_key))
      and lower(v_reservation.contact_email) = lower(btrim(p_contact_email)) then
      return v_reservation;
    end if;
    raise exception 'A checkout is already in progress for this account or school';
  end if;

  if (
    (select count(*) from public.manc50_entitlements where cohort = 'MANC50')
    +
    (select count(*) from public.manc50_checkout_reservations
      where status = 'reserved' and reserved_until > now())
  ) >= 50 then
    raise exception 'MANC50 pilot cap reached';
  end if;

  insert into public.manc50_checkout_reservations (
    checkout_attempt_id,
    user_id,
    school_key,
    school_name,
    contact_email
  ) values (
    btrim(p_checkout_attempt_id),
    p_user_id,
    lower(btrim(p_school_key)),
    btrim(p_school_name),
    lower(btrim(p_contact_email))
  )
  returning * into v_reservation;

  return v_reservation;
end;
$function$;

create or replace function public.attach_manc50_checkout_session(
  p_reservation_id uuid,
  p_user_id uuid,
  p_stripe_checkout_session_id text,
  p_checkout_url text
)
returns public.manc50_checkout_reservations
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_reservation public.manc50_checkout_reservations;
begin
  update public.manc50_checkout_reservations
  set stripe_checkout_session_id = coalesce(stripe_checkout_session_id, p_stripe_checkout_session_id),
      checkout_url = coalesce(checkout_url, p_checkout_url),
      updated_at = now()
  where id = p_reservation_id
    and user_id = p_user_id
    and status = 'reserved'
    and reserved_until > now()
    and (stripe_checkout_session_id is null or stripe_checkout_session_id = p_stripe_checkout_session_id)
  returning * into v_reservation;

  if v_reservation.id is null then
    raise exception 'Checkout reservation is no longer available';
  end if;

  return v_reservation;
end;
$function$;

create or replace function public.finalize_manc50_checkout(
  p_reservation_id uuid,
  p_stripe_checkout_session_id text,
  p_stripe_payment_intent_id text,
  p_idempotency_key text
)
returns public.manc50_entitlements
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_reservation public.manc50_checkout_reservations;
  v_school public.manc50_schools;
  v_entitlement public.manc50_entitlements;
begin
  if p_idempotency_key is null or btrim(p_idempotency_key) = '' then
    raise exception 'idempotency_key is required';
  end if;

  perform pg_advisory_xact_lock(hashtext('manc50-entitlement-cap'));

  if exists (
    select 1 from public.manc50_idempotency_keys
    where idempotency_key = p_idempotency_key
  ) then
    select * into v_entitlement
    from public.manc50_entitlements
    where stripe_checkout_session_id = p_stripe_checkout_session_id
       or stripe_payment_intent_id = p_stripe_payment_intent_id
    limit 1;
    return v_entitlement;
  end if;

  -- Stripe can legitimately deliver the same completed session in more than
  -- one event. Fulfilment must remain idempotent by payment identity as well as
  -- by event id.
  select * into v_entitlement
  from public.manc50_entitlements
  where stripe_checkout_session_id = p_stripe_checkout_session_id
     or (
       p_stripe_payment_intent_id is not null
       and stripe_payment_intent_id = p_stripe_payment_intent_id
     )
  limit 1;

  if v_entitlement.id is not null then
    insert into public.manc50_idempotency_keys (idempotency_key, operation)
    values (p_idempotency_key, 'finalize_manc50_checkout')
    on conflict (idempotency_key) do nothing;
    return v_entitlement;
  end if;

  select * into v_reservation
  from public.manc50_checkout_reservations
  where id = p_reservation_id
  for update;

  if v_reservation.id is null or v_reservation.status <> 'reserved' then
    raise exception 'Checkout reservation is not available';
  end if;
  if v_reservation.stripe_checkout_session_id is distinct from p_stripe_checkout_session_id then
    raise exception 'Checkout session does not match its reservation';
  end if;
  if (select count(*) from public.manc50_entitlements where cohort = 'MANC50') >= 50 then
    raise exception 'MANC50 pilot cap reached';
  end if;

  insert into public.manc50_schools (school_key, school_name, contact_email)
  values (v_reservation.school_key, v_reservation.school_name, v_reservation.contact_email)
  on conflict (school_key) do update
    set school_name = excluded.school_name,
        contact_email = excluded.contact_email,
        updated_at = now()
  returning * into v_school;

  insert into public.manc50_entitlements (
    school_id,
    stripe_checkout_session_id,
    stripe_payment_intent_id,
    purchased_by_user_id,
    activation_token_hash
  ) values (
    v_school.id,
    p_stripe_checkout_session_id,
    p_stripe_payment_intent_id,
    v_reservation.user_id,
    null
  )
  returning * into v_entitlement;

  update public.manc50_checkout_reservations
  set status = 'converted', updated_at = now()
  where id = v_reservation.id;

  insert into public.manc50_idempotency_keys (idempotency_key, operation)
  values (p_idempotency_key, 'finalize_manc50_checkout');

  insert into public.manc50_events (
    entitlement_id,
    school_id,
    event_name,
    source,
    idempotency_key,
    metadata
  ) values (
    v_entitlement.id,
    v_school.id,
    'purchased',
    'stripe_webhook',
    p_idempotency_key || ':purchased',
    jsonb_build_object('reservation_id', v_reservation.id)
  );

  return v_entitlement;
end;
$function$;

create or replace function public.activate_manc50_entitlement_for_user(
  p_user_id uuid
)
returns public.manc50_entitlements
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_entitlement public.manc50_entitlements;
begin
  if p_user_id is null then
    raise exception 'A confirmed teacher account is required';
  end if;

  select * into v_entitlement
  from public.manc50_entitlements
  where activated_by_user_id = p_user_id
    and status = 'activated'
    and expires_at > now()
  order by expires_at desc
  limit 1;

  if v_entitlement.id is not null then
    return v_entitlement;
  end if;

  -- Recover an older token-era purchase that was activated before account
  -- binding existed, provided the purchaser was safely matched by email.
  update public.manc50_entitlements
  set activated_by_user_id = p_user_id,
      updated_at = now()
  where purchased_by_user_id = p_user_id
    and activated_by_user_id is null
    and status = 'activated'
    and expires_at > now()
  returning * into v_entitlement;

  if v_entitlement.id is not null then
    return v_entitlement;
  end if;

  update public.manc50_entitlements
  set status = 'activated',
      activated_by_user_id = p_user_id,
      activated_at = now(),
      expires_at = now() + interval '3 months',
      updated_at = now()
  where purchased_by_user_id = p_user_id
    and status = 'purchased'
  returning * into v_entitlement;

  if v_entitlement.id is null then
    raise exception 'No paid MANC50 place is available for this account';
  end if;

  insert into public.manc50_events (
    entitlement_id,
    school_id,
    event_name,
    source,
    idempotency_key
  ) values (
    v_entitlement.id,
    v_entitlement.school_id,
    'activated',
    'activation',
    'activation:' || v_entitlement.id::text
  ) on conflict (idempotency_key) do nothing;

  return v_entitlement;
end;
$function$;

-- Preserve legacy token activation while binding the original purchaser too.
create or replace function public.activate_manc50_entitlement(
  p_activation_token_hash text,
  p_user_id uuid
)
returns public.manc50_entitlements
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_entitlement public.manc50_entitlements;
begin
  if p_user_id is null then
    raise exception 'A confirmed teacher account is required';
  end if;

  update public.manc50_entitlements
  set status = 'activated',
      purchased_by_user_id = coalesce(purchased_by_user_id, p_user_id),
      activated_by_user_id = p_user_id,
      activated_at = now(),
      expires_at = now() + interval '3 months',
      updated_at = now()
  where activation_token_hash = p_activation_token_hash
    and status = 'purchased'
    and (purchased_by_user_id is null or purchased_by_user_id = p_user_id)
  returning * into v_entitlement;

  if v_entitlement.id is null then
    raise exception 'Activation token is invalid, already used, or belongs to another account';
  end if;

  insert into public.manc50_events (
    entitlement_id,
    school_id,
    event_name,
    source,
    idempotency_key
  ) values (
    v_entitlement.id,
    v_entitlement.school_id,
    'activated',
    'activation',
    'activation:' || v_entitlement.id::text
  ) on conflict (idempotency_key) do nothing;

  return v_entitlement;
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
  union all select 'schools_active_7d', count(distinct school_id) from public.manc50_events where event_name in ('first_value', 'qualifying_use') and event_date >= current_date - 6;
$function$;

revoke all on function public.reserve_manc50_checkout(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.reserve_manc50_checkout(uuid, text, text, text, text) to service_role;
revoke all on function public.attach_manc50_checkout_session(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.attach_manc50_checkout_session(uuid, uuid, text, text) to service_role;
revoke all on function public.finalize_manc50_checkout(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.finalize_manc50_checkout(uuid, text, text, text) to service_role;
revoke all on function public.activate_manc50_entitlement_for_user(uuid) from public, anon, authenticated;
grant execute on function public.activate_manc50_entitlement_for_user(uuid) to service_role;
revoke all on function public.activate_manc50_entitlement(text, uuid) from public, anon, authenticated;
grant execute on function public.activate_manc50_entitlement(text, uuid) to service_role;
revoke all on function public.get_manc50_pilot_metrics() from public, anon, authenticated;
grant execute on function public.get_manc50_pilot_metrics() to service_role;

commit;
