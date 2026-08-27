import fs from 'node:fs'

const runner = fs.readFileSync('scripts/run-launch-recovery-drill.ps1', 'utf8')
const interactive = fs.readFileSync('scripts/run-launch-recovery-drill-interactive.ps1', 'utf8')

const assertions = [
  [runner.includes("$sourceUri.Host -notlike '*.pooler.supabase.com'"), 'runner requires a Supabase pooler host'],
  [runner.includes('$sourceUri.Port -ne 5432'), 'runner requires Session pooler port 5432'],
  [runner.includes('$sourceUser -ne "postgres.$productionRef"'), 'runner requires the tenant-qualified Production user'],
  [runner.includes('postgres.$($target.ref)') && runner.includes('$($sourceUri.Host):5432'), 'restore target reuses the approved Session pooler host with its own tenant'],
  [interactive.includes("[YOUR-PASSWORD]") && interactive.includes('Read-Host') && interactive.includes('-AsSecureString'), 'interactive runner collects the password without terminal echo'],
  [interactive.includes('[Uri]::EscapeDataString($plainPassword)'), 'interactive runner URL-encodes the password'],
  [interactive.includes('Remove-Item Env:HEBA_LAUNCH_PRODUCTION_DATABASE_URL'), 'interactive runner clears the connection variable'],
  [interactive.includes('ZeroFreeBSTR($pointer)'), 'interactive runner clears unmanaged password memory'],
  [!interactive.includes('Write-Host $plainPassword') && !interactive.includes('Write-Output $plainPassword'), 'interactive runner never prints the password'],
]

const failures = assertions.filter(([ok]) => !ok).map(([, message]) => message)
if (failures.length) {
  console.error(`verify:recovery-runner-local failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log('verify:recovery-runner-local passed — Session pooler enforcement, isolated-target routing and hidden secret cleanup verified')
