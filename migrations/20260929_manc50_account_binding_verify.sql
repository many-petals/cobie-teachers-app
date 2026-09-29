select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'manc50_entitlements'
  and column_name = 'activated_by_user_id';

select
  entitlement.id,
  entitlement.status,
  entitlement.activated_by_user_id,
  entitlement.expires_at,
  school.school_name,
  school.contact_email
from public.manc50_entitlements entitlement
join public.manc50_schools school on school.id = entitlement.school_id
order by entitlement.created_at desc;

select
  routine_name,
  specific_name,
  security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('create_manc50_entitlement', 'activate_manc50_entitlement', 'record_manc50_event')
order by routine_name;

select
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments,
  coalesce(array_agg(r.rolname order by r.rolname) filter (where has_function_privilege(r.oid, p.oid, 'EXECUTE')), '{}') as execute_roles
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
cross join pg_roles r
where n.nspname = 'public'
  and p.proname in ('create_manc50_entitlement', 'activate_manc50_entitlement', 'record_manc50_event')
  and r.rolname in ('anon', 'authenticated', 'service_role')
group by p.oid, p.proname
order by p.proname;
