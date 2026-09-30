-- Read-only proof for the authoritative-school and physical-fulfilment release controls.
select
  'eligible_school_count' as check_name,
  case when count(*) = 140 then 'PASS' else 'FAIL' end as status,
  count(*)::text || ' of 140 approved schools' as detail
from public.manc50_eligible_schools
where eligible_for_manc50 is true

union all

select
  'eligible_school_unique_urns',
  case when count(*) = count(distinct dfe_urn) and count(*) = 140 then 'PASS' else 'FAIL' end,
  count(distinct dfe_urn)::text || ' unique DfE URNs'
from public.manc50_eligible_schools
where eligible_for_manc50 is true

union all

select
  'eligible_school_required_data',
  case when count(*) = 0 then 'PASS' else 'FAIL' end,
  count(*)::text || ' rows missing identity or delivery data'
from public.manc50_eligible_schools
where eligible_for_manc50 is true
  and (
    school_key is null
    or btrim(school_name) = ''
    or btrim(address_line_1) = ''
    or btrim(postcode) = ''
    or btrim(postcode_lookup) = ''
  )

union all

select
  'eligible_school_age_boundary',
  case when count(*) = 0 then 'PASS' else 'FAIL' end,
  count(*)::text || ' rows outside ages 3-7 overlap'
from public.manc50_eligible_schools
where eligible_for_manc50 is true
  and not (statutory_low_age <= 7 and statutory_high_age >= 3)

union all

select
  'send_priority_split',
  case when
    count(*) filter (where send_priority) = 27
    and count(*) filter (where not send_priority) = 113
    then 'PASS' else 'FAIL' end,
  'SEND=' || (count(*) filter (where send_priority))::text
    || ', core=' || (count(*) filter (where not send_priority))::text
from public.manc50_eligible_schools
where eligible_for_manc50 is true

union all

select
  'authoritative_reservation_rpc',
  case when to_regprocedure('public.reserve_manc50_checkout(uuid,text,integer,text)') is not null
    then 'PASS' else 'FAIL' end,
  coalesce(to_regprocedure('public.reserve_manc50_checkout(uuid,text,integer,text)')::text, 'missing')

union all

select
  'self_declared_reservation_rpc_removed',
  case when to_regprocedure('public.reserve_manc50_checkout(uuid,text,text,text,text,text,text,boolean)') is null
    then 'PASS' else 'FAIL' end,
  coalesce(to_regprocedure('public.reserve_manc50_checkout(uuid,text,text,text,text,text,text,boolean)')::text, 'removed')

union all

select
  'verified_payment_finalizer',
  case when to_regprocedure('public.finalize_manc50_checkout(uuid,text,text,integer,text,text)') is not null
    then 'PASS' else 'FAIL' end,
  coalesce(to_regprocedure('public.finalize_manc50_checkout(uuid,text,text,integer,text,text)')::text, 'missing')

union all

select
  'order_and_fulfilment_tables',
  case when
    to_regclass('public.manc50_orders') is not null
    and to_regclass('public.manc50_fulfilments') is not null
    then 'PASS' else 'FAIL' end,
  'orders=' || coalesce(to_regclass('public.manc50_orders')::text, 'missing')
    || ', fulfilments=' || coalesce(to_regclass('public.manc50_fulfilments')::text, 'missing')

union all

select
  'operational_tables_private',
  case when
    not has_table_privilege('anon', 'public.manc50_eligible_schools', 'SELECT')
    and not has_table_privilege('authenticated', 'public.manc50_eligible_schools', 'SELECT')
    and not has_table_privilege('anon', 'public.manc50_orders', 'SELECT')
    and not has_table_privilege('authenticated', 'public.manc50_orders', 'SELECT')
    and not has_table_privilege('anon', 'public.manc50_fulfilments', 'SELECT')
    and not has_table_privilege('authenticated', 'public.manc50_fulfilments', 'SELECT')
    then 'PASS' else 'FAIL' end,
  'browser roles denied; service-role access retained'

union all

select
  'fulfilment_rpc_private',
  case when
    not has_function_privilege('anon', 'public.update_manc50_fulfilment(uuid,text,text,text,text,text)', 'EXECUTE')
    and not has_function_privilege('authenticated', 'public.update_manc50_fulfilment(uuid,text,text,text,text,text)', 'EXECUTE')
    and has_function_privilege('service_role', 'public.update_manc50_fulfilment(uuid,text,text,text,text,text)', 'EXECUTE')
    then 'PASS' else 'FAIL' end,
  'anon/authenticated denied; service_role allowed'

union all

select
  'fulfilment_queue_rpc_private',
  case when
    to_regprocedure('public.get_manc50_fulfilment_queue()') is not null
    and not has_function_privilege('anon', 'public.get_manc50_fulfilment_queue()', 'EXECUTE')
    and not has_function_privilege('authenticated', 'public.get_manc50_fulfilment_queue()', 'EXECUTE')
    and has_function_privilege('service_role', 'public.get_manc50_fulfilment_queue()', 'EXECUTE')
    then 'PASS' else 'FAIL' end,
  'anon/authenticated denied; service_role allowed'

order by check_name;
