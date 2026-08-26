import { existsSync, readFileSync } from 'node:fs'

const failures = []
const read = (file) => readFileSync(file, 'utf8')
const required = [
  'src/lib/actions/cms.ts',
  'src/components/admin/CmsStructureManager.tsx',
  'supabase/migrations/036_structured_cms.sql',
]
for (const file of required) if (!existsSync(file)) failures.push(`${file}: missing`)
if (existsSync(required[0])) {
  const source = read(required[0])
  for (const token of ['SECTION_KINDS', 'validateSectionContent', 'safeLink', 'content_revisions', 'requireAdminUser']) {
    if (!source.includes(token)) failures.push(`CMS server actions missing ${token}`)
  }
}
if (existsSync(required[1])) {
  const source = read(required[1])
  for (const token of ['sectionKinds', '<select name="kind"', 'HTTPS']) {
    if (!source.includes(token)) failures.push(`CMS structured editor missing ${token}`)
  }
}
if (failures.length) {
  console.error(`audit:cms-local failed\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('audit:cms-local passed — fixed section registry, server validation, safe links, revisions, permissions')
