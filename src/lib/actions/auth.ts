'use server'

import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { getServerClient, getServiceClient, hasSupabaseServerSecret } from '@/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'

type AdminLoginResult = { ok: true; needsMfa: boolean } | { ok: false; error: string }
const GENERIC_LOGIN_ERROR = 'تعذّر تسجيل الدخول. راجعي البيانات وحاولي لاحقًا.'

function requestFingerprint(headersList: Headers) {
  const forwarded = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
  const agent = headersList.get('user-agent') ?? ''
  return createHash('sha256').update(`${forwarded}|${agent}`).digest('hex')
}

async function logAdminSecurity(event: 'login_succeeded' | 'login_failed' | 'mfa_enrolled' | 'mfa_verified', actorId?: string) {
  if (!hasSupabaseServerSecret()) return
  const fingerprint = requestFingerprint(await headers())
  await getServiceClient().from('admin_security_events').insert({ actor_id: actorId ?? null, event, request_fingerprint: fingerprint })
}

async function consumeAdminLoginThrottle(outcome: 'attempt' | 'failure' | 'success') {
  if (!hasSupabaseServerSecret()) return false
  const email = process.env.ADMIN_LOGIN_EMAIL?.trim().toLowerCase() ?? ''
  const fingerprint = requestFingerprint(await headers())
  const throttleKey = createHash('sha256').update(`admin-login|${email}|${fingerprint}`).digest('hex')
  const { data, error } = await getServiceClient().rpc('consume_admin_login_throttle', { p_key: throttleKey, p_outcome: outcome })
  if (error || !Array.isArray(data) || data.length !== 1) return false
  return data[0]?.allowed === true
}

export async function adminPasswordLogin(password: string): Promise<AdminLoginResult> {
  const email = process.env.ADMIN_LOGIN_EMAIL
  if (!password || !email || !hasSupabasePublicConfig() || !hasSupabaseServerSecret())
    return { ok: false, error: 'تعذّر تسجيل الدخول الآن.' }

  if (!await consumeAdminLoginThrottle('attempt')) return { ok: false, error: GENERIC_LOGIN_ERROR }

  const client = await getServerClient()
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error || !data.user) {
    await consumeAdminLoginThrottle('failure')
    await logAdminSecurity('login_failed')
    return { ok: false, error: GENERIC_LOGIN_ERROR }
  }

  // This identity-only check intentionally uses the server secret. The shared
  // RLS permission helpers require AAL2, while this is the narrow pre-MFA step
  // that decides whether a successfully authenticated account may enroll/challenge MFA.
  const { data: role, error: roleError } = await getServiceClient()
    .from('admin_roles')
    .select('user_id')
    .eq('user_id', data.user.id)
    .limit(1)
    .maybeSingle()
  if (roleError || !role) {
    await client.auth.signOut()
    await consumeAdminLoginThrottle('failure')
    await logAdminSecurity('login_failed', data.user.id)
    return { ok: false, error: GENERIC_LOGIN_ERROR }
  }

  const { data: assurance } = await client.auth.mfa.getAuthenticatorAssuranceLevel()
  await consumeAdminLoginThrottle('success')
  await logAdminSecurity('login_succeeded', data.user.id)
  return { ok: true, needsMfa: assurance?.currentLevel !== 'aal2' }
}

export async function recordAdminMfaEvent(event: 'mfa_enrolled' | 'mfa_verified') {
  const client = await getServerClient()
  const { data: { user } } = await client.auth.getUser()
  if (user) await logAdminSecurity(event, user.id)
}
