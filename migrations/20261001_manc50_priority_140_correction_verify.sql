select
  'priority_140_count' as check_name,
  case when count(*) = 140 then 'PASS' else 'FAIL' end as status,
  count(*)::text || ' of 140 approved schools' as detail
from public.manc50_eligible_schools
where eligible_for_manc50 is true

union all

select
  'priority_140_exact_urn_set',
  case when md5(string_agg(dfe_urn::text, ',' order by dfe_urn)) = '44371b5d6c049229cbc888696b39ce03' then 'PASS' else 'FAIL' end,
  coalesce(md5(string_agg(dfe_urn::text, ',' order by dfe_urn)), 'missing')
from public.manc50_eligible_schools
where eligible_for_manc50 is true

union all

select
  'priority_tier_counts',
  case when
    count(*) filter (where priority_tier = 'Tier 1: specialist setting') = 44
    and count(*) filter (where priority_tier = 'Tier 2: SEND provision') = 95
    and count(*) filter (where priority_tier = 'Tier 3: age-fit setting') = 1
  then 'PASS' else 'FAIL' end,
  format(
    'specialist=%s, SEND=%s, age-fit=%s',
    count(*) filter (where priority_tier = 'Tier 1: specialist setting'),
    count(*) filter (where priority_tier = 'Tier 2: SEND provision'),
    count(*) filter (where priority_tier = 'Tier 3: age-fit setting')
  )
from public.manc50_eligible_schools
where eligible_for_manc50 is true

union all

select
  'kings_road_primary_lookup',
  case when count(*) = 1 then 'PASS' else 'FAIL' end,
  count(*)::text || ' matching eligible record'
from public.manc50_eligible_schools
where dfe_urn = 106322
  and school_name = 'Kings Road Primary School'
  and postcode_lookup = 'M160GR'
  and eligible_for_manc50 is true

order by check_name;