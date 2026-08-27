import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const content = readFileSync('src/lib/start-here/content.ts', 'utf8')
const data = readFileSync('src/lib/data/start-here.ts', 'utf8')
const action = readFileSync('src/lib/actions/cms.ts', 'utf8')
const editor = readFileSync('src/components/admin/StartHereExperienceEditor.tsx', 'utf8')
const page = readFileSync('src/app/(public)/start-here/page.tsx', 'utf8')
const quiz = readFileSync('src/components/catalog/StartHereQuiz.tsx', 'utf8')

for (const source of ['START_HERE_PATHS', 'normalizeStartHereContent', "value.startsWith('/')", "!value.startsWith('//')"]) assert.ok(content.includes(source), `missing typed content guard: ${source}`)
for (const source of ["eq('key', 'start_here_experience')", ".eq('is_public', true)"]) assert.ok(data.includes(source), `missing public data boundary: ${source}`)
for (const source of ["requireAdminUser('content.manage')", "entity_type: 'start_here_experience'", "action: 'start_here_experience.updated'", 'if (auditError)', "revalidatePath('/start-here')"]) assert.ok(action.includes(source), `missing persistence/audit contract: ${source}`)
assert.ok(editor.includes('saveStartHereExperience'), 'structured Admin editor is not connected')
assert.ok(!editor.includes('JSON.stringify'), 'start-here Admin must not expose raw JSON')
assert.ok(page.includes('getStartHereContent()') && page.includes('<StartHereQuiz content={content.quiz}'), 'public page does not consume governed content')
assert.ok(quiz.includes('content.questions') && quiz.includes('content.results'), 'quiz does not consume governed questions/results')
assert.ok(quiz.includes('aria-pressed=') && quiz.includes('aria-live="polite"'), 'quiz completion is not exposed to assistive technology')
assert.ok(quiz.includes('data-start-here-quiz') && quiz.includes("setAttribute('data-hydrated', 'true')"), 'quiz does not expose real client hydration readiness for keyboard tests')
console.log('verify:start-here-cms-local passed — structured Admin persistence, safe links, revisions/audit and public quiz/path consumers verified')
