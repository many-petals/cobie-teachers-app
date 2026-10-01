param(
  [Parameter(Mandatory = $true)]
  [string] $PriorityJsonPath,

  [Parameter(Mandatory = $true)]
  [string] $EdubaseCsvPath,

  [Parameter(Mandatory = $true)]
  [string] $MigrationPath,

  [Parameter(Mandatory = $true)]
  [string] $VerifyPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function ConvertTo-SqlText {
  param([AllowNull()][object] $Value)

  if ($null -eq $Value -or [string]::IsNullOrWhiteSpace([string] $Value)) {
    return 'null'
  }

  return "'" + ([string] $Value).Replace("'", "''") + "'"
}

function Get-Md5Hex {
  param([Parameter(Mandatory = $true)][string] $Value)

  $md5 = [System.Security.Cryptography.MD5]::Create()
  try {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
    return -join ($md5.ComputeHash($bytes) | ForEach-Object { $_.ToString('x2') })
  }
  finally {
    $md5.Dispose()
  }
}

$payload = Get-Content -Raw -LiteralPath $PriorityJsonPath | ConvertFrom-Json
$priorityRows = @($payload.rows | Where-Object { $_.priority140 -eq $true })

if ($priorityRows.Count -ne 140) {
  throw "Expected 140 priority schools but found $($priorityRows.Count)."
}

$priorityUrns = @($priorityRows | ForEach-Object { [string] $_.urn })
if (($priorityUrns | Sort-Object -Unique).Count -ne 140) {
  throw 'The priority cohort contains duplicate URNs.'
}

$edubaseByUrn = @{}
Import-Csv -LiteralPath $EdubaseCsvPath | ForEach-Object {
  $edubaseByUrn[[string] $_.URN] = $_
}

$valueRows = [System.Collections.Generic.List[string]]::new()
foreach ($priority in $priorityRows) {
  $urn = [string] $priority.urn
  if (-not $edubaseByUrn.ContainsKey($urn)) {
    throw "Priority URN $urn is missing from the Edubase source."
  }

  $source = $edubaseByUrn[$urn]
  if ($source.'EstablishmentStatus (name)' -ne 'Open') {
    throw "Priority URN $urn is not open in the Edubase source."
  }
  if ([int] $source.StatutoryLowAge -gt 7 -or [int] $source.StatutoryHighAge -lt 3) {
    throw "Priority URN $urn does not serve the MANC50 age range."
  }
  if ([string]::IsNullOrWhiteSpace($source.Street)) {
    throw "Priority URN $urn is missing its delivery address."
  }

  $postcode = ([string] $source.Postcode).Trim().ToUpperInvariant()
  if ([string]::IsNullOrWhiteSpace($postcode)) {
    $addressText = @(
      [string] $source.Street,
      [string] $source.Locality,
      [string] $source.Address3,
      [string] $source.Town,
      [string] $source.'County (name)',
      [string] $priority.address
    ) -join ' '
    $postcodeMatch = [regex]::Match($addressText.ToUpperInvariant(), '\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b')
    if (-not $postcodeMatch.Success) {
      throw "Priority URN $urn is missing its delivery postcode."
    }
    $compactPostcode = $postcodeMatch.Value -replace '\s', ''
    $postcode = $compactPostcode.Insert($compactPostcode.Length - 3, ' ')
  }

  $town = ([string] $source.Town).Trim()
  if (-not [string]::IsNullOrWhiteSpace($town)) {
    $town = ($town -replace [regex]::Escape($postcode), '').Trim(' ', ',')
  }

  $settingType = if ([int] $priority.tier -eq 1) {
    'Special school'
  }
  elseif ([int] $priority.tier -eq 2) {
    'SEND provision'
  }
  elseif ($source.'PhaseOfEducation (name)' -eq 'Nursery') {
    'Nursery / early years'
  }
  else {
    'Mainstream primary'
  }

  $postcodeLookup = $postcode -replace '[^A-Z0-9]', ''
  $sendPriority = if ([int] $priority.tier -le 2) { 'true' } else { 'false' }

  $values = @(
    [string] ([int] $urn),
    (ConvertTo-SqlText "dfe-urn-$urn"),
    (ConvertTo-SqlText $source.EstablishmentName),
    (ConvertTo-SqlText $source.'LA (name)'),
    (ConvertTo-SqlText $source.'TypeOfEstablishment (name)'),
    (ConvertTo-SqlText $source.'PhaseOfEducation (name)'),
    [string] ([int] $source.StatutoryLowAge),
    [string] ([int] $source.StatutoryHighAge),
    (ConvertTo-SqlText $source.Street),
    (ConvertTo-SqlText $source.Locality),
    (ConvertTo-SqlText $town),
    (ConvertTo-SqlText $postcode),
    (ConvertTo-SqlText $postcodeLookup),
    (ConvertTo-SqlText $priority.website),
    (ConvertTo-SqlText $source.TelephoneNum),
    (ConvertTo-SqlText $priority.tierLabel),
    (ConvertTo-SqlText $priority.priorityReason),
    (ConvertTo-SqlText $settingType),
    $sendPriority,
    "date '2026-09-16'",
    'true'
  )

  $valueRows.Add('  (' + ($values -join ', ') + ')')
}

$cohortKey = (($priorityUrns | ForEach-Object { [int] $_ } | Sort-Object) -join ',')
$cohortHash = Get-Md5Hex $cohortKey
$valuesSql = $valueRows -join ",`r`n"

$migration = @"
begin;

-- Correct the live eligibility cohort to the approved Greater Manchester Priority 140.
-- Source: DfE Edubase 2026-09-16 and the signed-off MANC50 outreach priority model.
-- Historical rows remain available for referential integrity but are no longer eligible.
update public.manc50_eligible_schools
set eligible_for_manc50 = false,
    updated_at = now()
where eligible_for_manc50 is true;

insert into public.manc50_eligible_schools (
  dfe_urn,
  school_key,
  school_name,
  la_name,
  establishment_type,
  phase,
  statutory_low_age,
  statutory_high_age,
  address_line_1,
  locality,
  town,
  postcode,
  postcode_lookup,
  website,
  telephone,
  priority_tier,
  priority_reason,
  setting_type,
  send_priority,
  source_snapshot,
  eligible_for_manc50
) values
$valuesSql
on conflict (dfe_urn) do update
set school_key = excluded.school_key,
    school_name = excluded.school_name,
    la_name = excluded.la_name,
    establishment_type = excluded.establishment_type,
    phase = excluded.phase,
    statutory_low_age = excluded.statutory_low_age,
    statutory_high_age = excluded.statutory_high_age,
    address_line_1 = excluded.address_line_1,
    locality = excluded.locality,
    town = excluded.town,
    postcode = excluded.postcode,
    postcode_lookup = excluded.postcode_lookup,
    website = excluded.website,
    telephone = excluded.telephone,
    priority_tier = excluded.priority_tier,
    priority_reason = excluded.priority_reason,
    setting_type = excluded.setting_type,
    send_priority = excluded.send_priority,
    source_snapshot = excluded.source_snapshot,
    eligible_for_manc50 = excluded.eligible_for_manc50,
    updated_at = now();

do `$cohort_checks`$
declare
  v_count integer;
  v_hash text;
begin
  select count(*), md5(string_agg(dfe_urn::text, ',' order by dfe_urn))
  into v_count, v_hash
  from public.manc50_eligible_schools
  where eligible_for_manc50 is true;

  if v_count <> 140 then
    raise exception 'MANC50 Priority 140 correction produced % eligible schools', v_count;
  end if;

  if v_hash <> '$cohortHash' then
    raise exception 'MANC50 Priority 140 URN set does not match the approved cohort';
  end if;

  if not exists (
    select 1
    from public.manc50_eligible_schools
    where dfe_urn = 106322
      and postcode_lookup = 'M160GR'
      and eligible_for_manc50 is true
  ) then
    raise exception 'Kings Road Primary School is missing from the corrected cohort';
  end if;
end
`$cohort_checks`$;

commit;
"@

$verify = @"
select
  'priority_140_count' as check_name,
  case when count(*) = 140 then 'PASS' else 'FAIL' end as status,
  count(*)::text || ' of 140 approved schools' as detail
from public.manc50_eligible_schools
where eligible_for_manc50 is true

union all

select
  'priority_140_exact_urn_set',
  case when md5(string_agg(dfe_urn::text, ',' order by dfe_urn)) = '$cohortHash' then 'PASS' else 'FAIL' end,
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
"@

$migrationDirectory = Split-Path -Parent $MigrationPath
$verifyDirectory = Split-Path -Parent $VerifyPath
New-Item -ItemType Directory -Path $migrationDirectory -Force | Out-Null
New-Item -ItemType Directory -Path $verifyDirectory -Force | Out-Null
[System.IO.File]::WriteAllText($MigrationPath, $migration, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($VerifyPath, $verify, [System.Text.UTF8Encoding]::new($false))

[PSCustomObject]@{
  PriorityCount = $priorityRows.Count
  CohortHash = $cohortHash
  MigrationPath = $MigrationPath
  VerifyPath = $VerifyPath
}
