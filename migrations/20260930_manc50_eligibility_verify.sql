-- Read-only proof that server-side eligibility collection is installed safely.
select
  'eligibility_columns' as check_name,
  case when count(*) = 8 then 'PASS' else 'FAIL' end as status,
  count(*)::text || ' of 8 required columns' as detail
from information_schema.columns
where table_schema = 'public'
  and table_name in ('manc50_checkout_reservations', 'manc50_schools')
  and column_name in ('postcode', 'setting_type', 'serves_ages_3_7', 'send_priority')

union all

select
  'eligibility_rpc_signature',
  case when to_regprocedure('public.reserve_manc50_checkout(uuid,text,text,text,text,text,text,boolean)') is not null
    then 'PASS' else 'FAIL' end,
  coalesce(to_regprocedure('public.reserve_manc50_checkout(uuid,text,text,text,text,text,text,boolean)')::text, 'missing')

union all

select
  'legacy_rpc_removed',
  case when to_regprocedure('public.reserve_manc50_checkout(uuid,text,text,text,text)') is null
    then 'PASS' else 'FAIL' end,
  coalesce(to_regprocedure('public.reserve_manc50_checkout(uuid,text,text,text,text)')::text, 'removed')

union all

select
  'eligibility_rpc_private',
  case when
    not has_function_privilege('anon', 'public.reserve_manc50_checkout(uuid,text,text,text,text,text,text,boolean)', 'EXECUTE')
    and not has_function_privilege('authenticated', 'public.reserve_manc50_checkout(uuid,text,text,text,text,text,text,boolean)', 'EXECUTE')
    and has_function_privilege('service_role', 'public.reserve_manc50_checkout(uuid,text,text,text,text,text,text,boolean)', 'EXECUTE')
    then 'PASS' else 'FAIL' end,
  'anon/authenticated denied; service_role allowed'

union all

select
  'eligibility_sync_trigger',
  case when exists (
    select 1 from pg_trigger
    where tgname = 'sync_manc50_school_eligibility_after_conversion'
      and tgrelid = 'public.manc50_checkout_reservations'::regclass
      and not tgisinternal
  ) then 'PASS' else 'FAIL' end,
  'reservation eligibility copies to the final school row after conversion'

order by check_name;
