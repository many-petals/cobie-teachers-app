with checks as (
  select
    'reservations_table'::text as check_name,
    case when to_regclass('public.manc50_checkout_reservations') is not null then 'PASS' else 'FAIL' end as status,
    coalesce(to_regclass('public.manc50_checkout_reservations')::text, 'missing') as detail

  union all

  select
    'reservations_rls',
    case when c.relrowsecurity then 'PASS' else 'FAIL' end,
    'row_security=' || c.relrowsecurity::text
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'manc50_checkout_reservations'

  union all

  select
    'reservations_not_browser_accessible',
    case when
      not has_table_privilege('anon', 'public.manc50_checkout_reservations', 'SELECT')
      and not has_table_privilege('authenticated', 'public.manc50_checkout_reservations', 'SELECT')
      then 'PASS' else 'FAIL' end,
    'anon_select=' || has_table_privilege('anon', 'public.manc50_checkout_reservations', 'SELECT')::text
      || ', authenticated_select=' || has_table_privilege('authenticated', 'public.manc50_checkout_reservations', 'SELECT')::text

  union all

  select
    'purchaser_binding_column',
    case when exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'manc50_entitlements'
        and column_name = 'purchased_by_user_id'
        and data_type = 'uuid'
    ) then 'PASS' else 'FAIL' end,
    'purchased_by_user_id uuid'

  union all

  select
    'account_purchase_unique',
    case when count(*) = 0 then 'PASS' else 'FAIL' end,
    'duplicate_accounts=' || count(*)::text
  from (
    select purchased_by_user_id
    from public.manc50_entitlements
    where purchased_by_user_id is not null
    group by purchased_by_user_id
    having count(*) > 1
  ) duplicates

  union all

  select
    'paid_places_not_over_cap',
    case when count(*) <= 50 then 'PASS' else 'FAIL' end,
    'paid_places=' || count(*)::text
  from public.manc50_entitlements
  where cohort = 'MANC50'

  union all

  select
    'reserved_plus_paid_not_over_cap',
    case when paid + reserved <= 50 then 'PASS' else 'FAIL' end,
    'paid=' || paid::text || ', reserved=' || reserved::text
  from (
    select
      (select count(*) from public.manc50_entitlements where cohort = 'MANC50') as paid,
      (select count(*) from public.manc50_checkout_reservations where status = 'reserved' and reserved_until > now()) as reserved
  ) totals

  union all

  select
    'release_control_functions',
    case when count(*) = 5 then 'PASS' else 'FAIL' end,
    'functions_present=' || count(*)::text || '/5'
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in (
      'reserve_manc50_checkout',
      'attach_manc50_checkout_session',
      'finalize_manc50_checkout',
      'activate_manc50_entitlement_for_user',
      'get_manc50_pilot_metrics'
    )

  union all

  select
    'service_role_only_functions',
    case when bool_and(
      has_function_privilege('service_role', p.oid, 'EXECUTE')
      and not has_function_privilege('anon', p.oid, 'EXECUTE')
      and not has_function_privilege('authenticated', p.oid, 'EXECUTE')
    ) then 'PASS' else 'FAIL' end,
    'checked=' || count(*)::text
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in (
      'reserve_manc50_checkout',
      'attach_manc50_checkout_session',
      'finalize_manc50_checkout',
      'activate_manc50_entitlement_for_user',
      'get_manc50_pilot_metrics'
    )
)
select check_name, status, detail
from checks
order by status desc, check_name;
