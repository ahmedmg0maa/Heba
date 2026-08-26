import { existsSync } from 'node:fs'
import { read, report } from './lib.mjs'

const failures = []
const actionFile = 'src/lib/actions/admin-control.ts'
const actionSource = read(actionFile)
for (const action of ['saveProductVariant', 'deleteProductVariant', 'saveBundleChildren', 'saveOperationalSettings']) if (!actionSource.includes(`function ${action}`)) failures.push(`${actionFile}: ${action} missing`)
const manager = read('src/components/admin/ProductManager.tsx')
if (!manager.includes('ProductComposition')) failures.push('product composition UI missing')
const settings = read('src/app/admin/settings/page.tsx')
if (!settings.includes('OperationalSettingsForm')) failures.push('typed operational settings UI missing')
const checkout = read('src/components/checkout/CheckoutClient.tsx')
if (!checkout.includes('variantId') || !checkout.includes('product.variants')) failures.push('checkout variant selector missing')
if (!existsSync('supabase/migrations/025_variant_checkout.sql') || !read('supabase/migrations/025_variant_checkout.sql').includes('variant_id')) failures.push('variant-authoritative checkout migration missing')

report('audit:catalog', failures)
