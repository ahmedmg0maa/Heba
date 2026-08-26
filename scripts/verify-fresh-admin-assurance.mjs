import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (file) => readFileSync(file, 'utf8')
const permissions = read('src/lib/auth/permissions.ts')
const paymentActions = read('src/lib/actions/admin.ts')
const cmsActions = read('src/lib/actions/cms.ts')
const controlActions = read('src/lib/actions/admin-control.ts')
const mfaPage = read('src/app/(public)/auth/admin/mfa/page.tsx')

assert.match(permissions, /FRESH_ADMIN_ASSURANCE_MAX_AGE_MS\s*=\s*10\s*\*\s*60\s*\*\s*1000/, 'freshness window must be ten minutes')
assert.match(permissions, /function hasFreshMfaAssurance\(amr: unknown/, 'AMR freshness checker missing')
assert.match(permissions, /entry\?\.method !== 'totp' && entry\?\.method !== 'webauthn'/, 'freshness must accept only MFA AMR methods')
assert.match(permissions, /requirePermission\(permission\)[\s\S]*hasFreshMfaAssurance\(sessionAmr\(session\.access_token\)\)/, 'fresh gate must follow permission/AAL2 verification')

for (const [source, action] of [
  [paymentActions, 'approvePayment'],
  [paymentActions, 'rejectPayment'],
  [cmsActions, 'grantRole'],
  [cmsActions, 'revokeRole'],
  [cmsActions, 'setRolePermissions'],
  [controlActions, 'saveOperationalSettings'],
]) {
  const start = source.indexOf(`export async function ${action}`)
  assert.notEqual(start, -1, `${action} missing`)
  const next = source.indexOf('\nexport async function ', start + 1)
  const body = source.slice(start, next === -1 ? source.length : next)
  assert.match(body, /requireFreshAdminAssurance\(/, `${action} must require a fresh AAL2 confirmation`)
}

const refundStart = paymentActions.indexOf('export async function updateOrderStatus')
const refundBody = paymentActions.slice(refundStart)
assert.match(refundBody, /status === 'refunded'[\s\S]*requireFreshAdminAssurance\('orders\.refund'\)/, 'refunds must require fresh assurance')

assert.match(mfaPage, /const requiresFreshCode = params\.get\('reauth'\) === '1'/, 'MFA route must recognize reauth mode')
assert.match(mfaPage, /aal2' && !requiresFreshCode/, 'existing AAL2 must not skip a requested fresh challenge')
assert.match(mfaPage, /if \(requiresFreshCode\)[\s\S]*establishAdminSession\(\)/, 'fresh TOTP success must establish the admin session before redirect')

console.log('verify:fresh-admin-assurance passed — fresh TOTP AMR is enforced for payment, refund, role, and payment-setting mutations; reauth cannot auto-skip an existing AAL2 session')
