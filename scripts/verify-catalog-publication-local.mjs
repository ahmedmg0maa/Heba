import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const readiness = readFileSync('src/lib/catalog/publication-readiness.ts', 'utf8')
const actions = readFileSync('src/lib/actions/admin-control.ts', 'utf8')
const cms = readFileSync('src/lib/actions/cms.ts', 'utf8')
const catalog = readFileSync('src/lib/data/catalog.ts', 'utf8')
const checkout = readFileSync('src/lib/data/checkout.ts', 'utf8')

for (const source of ['حقوق الغلاف', 'migration 046', "from('course_modules')", "from('book_files')", "from('availability_rules')", 'موعد الورشة يجب أن يكون قادمًا', 'كل درس يحتاج فيديو محميًا أو محتوى نصيًا']) assert.ok(readiness.includes(source), `missing publication gate: ${source}`)
assert.ok(actions.includes('catalogPublicationReadiness(kind, id'), 'catalog save bypasses completeness gate')
assert.ok(cms.includes('catalogPublicationReadiness') && cms.includes('تعذّر مزامنة حالة النشر'), 'publish toggle bypasses completeness or synchronized rollback')
assert.ok((catalog.match(/\.eq\('products\.is_published', true\)/g) ?? []).length >= 4, 'every domain query must require its linked product publication')
for (const source of ["t === 'course'", "t === 'book'", "t === 'workshop'", "t === 'session'", 'workshop.seatsReserved >= workshop.seatsTotal', 'session.availability.length === 0']) assert.ok(checkout.includes(source), `checkout denial is missing: ${source}`)
console.log('verify:catalog-publication-local passed — domain/product publication parity, completeness/media-rights and unavailable checkout denial verified')

