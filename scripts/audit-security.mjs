import { existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { walk, read, report } from './lib.mjs'

const failures = []

// 1. Service role key must never appear in client code or be NEXT_PUBLIC.
for (const f of walk('src', ['.tsx', '.ts'])) {
  const src = read(f)
  if (/NEXT_PUBLIC_SUPABASE_SERVICE_ROLE/.test(src)) failures.push(`${f}: service role key exposed as NEXT_PUBLIC`)
  if (/SUPABASE_SERVICE_ROLE_KEY/.test(src) && /['"]use client['"]/.test(src))
    failures.push(`${f}: service role key referenced in a client component`)
  if (/eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{20,}/.test(src))
    failures.push(`${f}: hardcoded JWT-like secret`)
}

// 2. No .env files tracked by git.
try {
  const tracked = execSync('git ls-files', { encoding: 'utf8' }).split('\n')
  for (const t of tracked) {
    if (/^\.env(\..+)?$/.test(t) && t !== '.env.example') failures.push(`git tracks secret file: ${t}`)
    if (t === 'package-lock.json') failures.push('package-lock.json is tracked — pnpm only')
  }
} catch {
  failures.push('git ls-files failed — run inside the repo')
}

// 3. .env.example must exist.
if (!existsSync('.env.example')) failures.push('.env.example missing')

report('audit:security', failures)
