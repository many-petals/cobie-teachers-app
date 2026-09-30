begin;

-- Keep eligibility evidence with the reserved place and the final school record.
-- Existing pilot rows remain valid with null eligibility fields; every new
-- checkout must pass the server-side checks in reserve_manc50_checkout.
alter table public.manc50_checkout_reservations
  add column if not exists postcode text,
  add column if not exists setting_type text,
  add column if not exists serves_ages_3_7 boolean,
  add column if not exists send_priority boolean not null default false;

alter table public.manc50_schools
  add column if not exists postcode text,
  add column if not exists setting_type text,
  add column if not exists serves_ages_3_7 boolean,
  add column if not exists send_priority boolean not null default false;

do $constraints$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'manc50_checkout_reservations_setting_type_check'
      and conrelid = 'public.manc50_checkout_reservations'::regclass
  ) then
    alter table public.manc50_checkout_reservations
      add constraint manc50_checkout_reservations_setting_type_check
      check (
        setting_type is null or setting_type in (
          'Special school',
          'SEND provision',
          'Mainstream primary',
          'Nursery / early years',
          'Other eligible setting'
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'manc50_schools_setting_type_check'
      and conrelid = 'public.manc50_schools'::regclass
  ) then
    alter table public.manc50_schools
      add constraint manc50_schools_setting_type_check
      check (
        setting_type is null or setting_type in (
          'Special school',
          'SEND provision',
          'Mainstream primary',
          'Nursery / early years',
          'Other eligible setting'
        )
      );
  end if;
end;
$constraints$;

drop function if exists public.reserve_manc50_checkout(uuid, text, text, text, text);

create or replace function public.reserve_manc50_checkout(
  p_user_id uuid,
  p_checkout_attempt_id text,
  p_school_key text,
  p_school_name text,
  p_contact_email text,
  p_postcode text,
  p_setting_type text,
  p_serves_ages_3_7 boolean
)
returns public.manc50_checkout_reservations
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_reservation public.manc50_checkout_reservations;
  v_postcode text;
  v_send_priority boolean;
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

  v_postcode := upper(regexp_replace(btrim(coalesce(p_postcode, '')), '[[:space:]]+', ' ', 'g'));
  if regexp_replace(v_postcode, '[^A-Z0-9]', '', 'g') !~ '^(GIR0AA|[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2})$' then
    raise exception 'A valid UK school or setting postcode is required';
  end if;
  if p_setting_type is null or p_setting_type not in (
    'Special school',
    'SEND provision',
    'Mainstream primary',
    'Nursery / early years',
    'Other eligible setting'
  ) then
    raise exception 'An eligible setting type is required';
  end if;
  if p_serves_ages_3_7 is distinct from true then
    raise exception 'The setting must serve children aged 3-7';
  end if;

  v_send_priority := p_setting_type in ('Special school', 'SEND provision');
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
    if v_reservation.serves_ages_3_7 is distinct from true then
      raise exception 'Checkout attempt does not contain eligibility confirmation';
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
      and lower(v_reservation.contact_email) = lower(btrim(p_contact_email))
      and v_reservation.serves_ages_3_7 is true then
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
    contact_email,
    postcode,
    setting_type,
    serves_ages_3_7,
    send_priority
  ) values (
    btrim(p_checkout_attempt_id),
    p_user_id,
    lower(btrim(p_school_key)),
    btrim(p_school_name),
    lower(btrim(p_contact_email)),
    v_postcode,
    p_setting_type,
    true,
    v_send_priority
  )
  returning * into v_reservation;

  return v_reservation;
end;
$function$;

revoke all on function public.reserve_manc50_checkout(uuid, text, text, text, text, text, text, boolean)
  from public, anon, authenticated;
grant execute on function public.reserve_manc50_checkout(uuid, text, text, text, text, text, text, boolean)
  to service_role;

create or replace function public.sync_manc50_school_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
begin
  if new.status = 'converted' and old.status is distinct from new.status then
    update public.manc50_schools
    set postcode = new.postcode,
        setting_type = new.setting_type,
        serves_ages_3_7 = new.serves_ages_3_7,
        send_priority = new.send_priority,
        updated_at = now()
    where school_key = new.school_key;
  end if;
  return new;
end;
$function$;

revoke all on function public.sync_manc50_school_eligibility() from public, anon, authenticated;

drop trigger if exists sync_manc50_school_eligibility_after_conversion
  on public.manc50_checkout_reservations;
create trigger sync_manc50_school_eligibility_after_conversion
after update of status on public.manc50_checkout_reservations
for each row execute function public.sync_manc50_school_eligibility();

comment on column public.manc50_schools.send_priority is
  'True for self-declared special-school or SEND-provision settings, used to prioritise support and evaluation rather than to grant access.';

commit;
