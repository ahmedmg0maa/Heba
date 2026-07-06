import { existsSync } from 'node:fs'
import { report } from './lib.mjs'

const required = [
  'package.json',
  'pnpm-lock.yaml',
  '.npmrc',
  '.nvmrc',
  'vercel.json',
  '.env.example',
  'docs/MASTER_PLAN.md',
  'docs/PROJECT_STATE.md',
  'docs/DECISIONS.md',
  'docs/KNOWN_ISSUES.md',
]

const failures = required.filter((f) => !existsSync(f)).map((f) => `missing required file: ${f}`)

if (existsSync('package-lock.json')) failures.push('package-lock.json exists — pnpm only')

report('audit:launch', failures)
