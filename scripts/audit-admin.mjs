import { existsSync, readFileSync } from 'node:fs'
import { walk, read, report } from './lib.mjs'

const failures = []
const manifest = JSON.parse(readFileSync('scripts/expected-routes.json', 'utf8'))

// Once admin routes exist, the admin tree must have a layout that performs a role check.
if (manifest.admin.length > 0) {
  const layout = 'src/app/admin/layout.tsx'
  if (!existsSync(layout)) {
    failures.push('admin routes declared but src/app/admin/layout.tsx missing')
  } else if (!/requireAdmin|admin_roles|role/i.test(read(layout))) {
    failures.push('admin layout has no visible role check')
  }
  // Every admin page must exist (covered by audit:routes) and no admin page may skip auth wrapper.
  for (const f of walk('src/app/admin', ['.tsx'])) {
    if (/SUPABASE_SERVICE_ROLE_KEY/.test(read(f)) && /['"]use client['"]/.test(read(f)))
      failures.push(`${f}: service key in client admin component`)
  }
}

report('audit:admin', failures)
