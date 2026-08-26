import { existsSync } from 'node:fs'
import { read, report } from './lib.mjs'

const failures = []
const migrations = ['022_atomic_payment_review.sql', '023_atomic_checkout.sql', '024_atomic_order_transitions.sql', '025_variant_checkout.sql']
for (const name of migrations) {
  const file = `supabase/migrations/${name}`
  if (!existsSync(file)) failures.push(`${file}: atomic commerce migration missing`)
  else {
    const sql = read(file)
    if (!/for (?:update|share)/.test(sql)) failures.push(`${file}: row locking missing`)
    if (!/security definer/.test(sql)) failures.push(`${file}: controlled transaction function missing`)
  }
}
const checkout = read('src/lib/actions/checkout.ts')
for (const rpc of ['create_product_order_v2', 'submit_payment_proof_atomic']) if (!checkout.includes(`rpc('${rpc}'`)) failures.push(`checkout action does not use ${rpc}`)
const review = read('src/lib/actions/admin.ts')
for (const rpc of ['approve_payment_atomic', 'reject_payment_atomic', 'transition_order_atomic']) if (!review.includes(`rpc('${rpc}'`)) failures.push(`admin commerce action does not use ${rpc}`)
if (!existsSync('scripts/verify-commerce.mjs')) failures.push('live commerce concurrency verifier missing')

report('audit:commerce', failures)
