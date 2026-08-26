[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$productionConnection = $env:HEBA_LAUNCH_PRODUCTION_DATABASE_URL
if ([string]::IsNullOrWhiteSpace($productionConnection)) {
  throw 'HEBA_LAUNCH_PRODUCTION_DATABASE_URL must be supplied only through the secure execution environment. Do not place it in chat or a repository file.'
}

$organizationId = 'lhsiyqahemsfvfrddjlo'
$region = 'eu-west-1'
$prefix = 'hebaelsherif-restore-'
$before = @(supabase projects list --output json | ConvertFrom-Json)
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$restorePassword = [Convert]::ToHexString($bytes).ToLowerInvariant()
$name = "$prefix$((Get-Date).ToUniversalTime().ToString('yyyyMMddHHmmss'))"
$target = $null
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$passed = $false

try {
  # The project has no Production data until the controlled restore below. The
  # password exists only in this process and is never emitted or persisted.
  & supabase projects create $name --org-id $organizationId --db-password $restorePassword --region $region --size nano --yes *> $null
  if ($LASTEXITCODE -ne 0) { throw 'The isolated restore target could not be created. No backup or Production change was made.' }

  $after = @(supabase projects list --output json | ConvertFrom-Json)
  $created = @($after | Where-Object { $_.ref -notin $before.ref -and $_.name -eq $name })
  if ($created.Count -ne 1 -or $created[0].status -ne 'ACTIVE_HEALTHY') { throw 'The isolated restore target was not uniquely identified as healthy.' }
  $target = $created[0]
  $escapedPassword = [uri]::EscapeDataString($restorePassword)
  $env:HEBA_LAUNCH_RESTORE_DATABASE_URL = "postgresql://postgres:$escapedPassword@db.$($target.ref).supabase.co:5432/postgres?sslmode=require"

  & node scripts/launch-backup-restore.mjs
  if ($LASTEXITCODE -ne 0) { throw 'The logical backup or isolated restore contract did not pass.' }
  $passed = $true
} finally {
  Remove-Item Env:HEBA_LAUNCH_RESTORE_DATABASE_URL -ErrorAction SilentlyContinue
  if ($target) {
    & supabase projects delete $target.ref --yes *> $null
    if ($LASTEXITCODE -ne 0) { Write-Error 'The isolated restore target must be deleted manually; it contains restored Production data and must not be used as staging.' }
  }
}

if ($passed) {
  $stopwatch.Stop()
  [PSCustomObject]@{
    Result = 'RECOVERY_DRILL_PASSED'
    RestoreTargetRef = $target.ref
    RestoreTargetDeleted = $true
    ElapsedSeconds = [math]::Round($stopwatch.Elapsed.TotalSeconds, 1)
    RPO = 'point-in-time at logical backup completion'
  } | ConvertTo-Json -Compress
}
