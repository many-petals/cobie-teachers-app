begin;

alter table public.manc50_entitlements
  add column if not exists activated_by_user_id uuid references auth.users(id) on delete set null;

comment on column public.manc50_entitlements.activated_by_user_id is
  'Confirmed teacher account that redeemed this single-use MANC50 entitlement.';

-- Preserve one existing active pilot per matching confirmed account. Old test
-- rows that cannot be matched safely remain unbound and grant no application access.
with matches as (
  select
    entitlement.id as entitlement_id,
    account.id as user_id,
    row_number() over (
      partition by account.id
      order by entitlement.activated_at desc nulls last, entitlement.created_at desc
    ) as match_rank
  from public.manc50_entitlements entitlement
  join public.manc50_schools school on school.id = entitlement.school_id
  join auth.users account on lower(account.email) = lower(school.contact_email)
  where entitlement.status = 'activated'
    and account.email_confirmed_at is not null
)
update public.manc50_entitlements entitlement
set activated_by_user_id = matches.user_id,
    updated_at = now()
from matches
where entitlement.id = matches.entitlement_id
  and matches.match_rank = 1
  and entitlement.activated_by_user_id is null;

create unique index if not exists manc50_entitlements_one_per_teacher
  on public.manc50_entitlements (activated_by_user_id)
  where activated_by_user_id is not null;

drop function if exists public.activate_manc50_entitlement(text);

create function public.activate_manc50_entitlement(
  p_activation_token_hash text,
  p_user_id uuid
)
returns public.manc50_entitlements
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_entitlement public.manc50_entitlements;
begin
  if p_user_id is null then
    raise exception 'A confirmed teacher account is required';
  end if;

  update public.manc50_entitlements
  set status = 'activated',
      activated_by_user_id = p_user_id,
      activated_at = now(),
      expires_at = now() + interval '3 months',
      updated_at = now()
  where activation_token_hash = p_activation_token_hash
    and status = 'purchased'
  returning * into v_entitlement;

  if v_entitlement.id is null then
    raise exception 'Activation token is invalid or already used';
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
  );

  return v_entitlement;
end;
$function$;

drop function if exists public.record_manc50_event(uuid, text, date, text, jsonb);

create function public.record_manc50_event(
  p_entitlement_id uuid,
  p_user_id uuid,
  p_event_name text,
  p_event_date date,
  p_idempotency_key text,
  p_metadata jsonb default '{}'::jsonb
)
returns public.manc50_events
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_event public.manc50_events;
  v_entitlement public.manc50_entitlements;
begin
  select * into v_entitlement
  from public.manc50_entitlements
  where id = p_entitlement_id
    and activated_by_user_id = p_user_id;

  if v_entitlement.id is null then
    raise exception 'Entitlement is not bound to this account';
  end if;

  if v_entitlement.status <> 'activated' or v_entitlement.expires_at <= now() then
    raise exception 'Entitlement is not active';
  end if;

  insert into public.manc50_events (
    entitlement_id,
    school_id,
    event_name,
    event_date,
    idempotency_key,
    metadata
  ) values (
    v_entitlement.id,
    v_entitlement.school_id,
    p_event_name,
    coalesce(p_event_date, current_date),
    p_idempotency_key,
    coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (idempotency_key) do update
    set idempotency_key = excluded.idempotency_key
  returning * into v_event;

  return v_event;
end;
$function$;

revoke all on function public.create_manc50_entitlement(text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.create_manc50_entitlement(text, text, text, text, text, text, text) to service_role;

revoke all on function public.activate_manc50_entitlement(text, uuid) from public, anon, authenticated;
grant execute on function public.activate_manc50_entitlement(text, uuid) to service_role;

revoke all on function public.record_manc50_event(uuid, uuid, text, date, text, jsonb) from public, anon, authenticated;
grant execute on function public.record_manc50_event(uuid, uuid, text, date, text, jsonb) to service_role;

commit;
