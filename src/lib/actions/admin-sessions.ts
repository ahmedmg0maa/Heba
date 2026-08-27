'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth/permissions'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'
import { getServiceClient, hasSupabaseServerSecret } from '@/lib/supabase/server'

type SessionResult = { ok: true; idleExpiresAt?: string; absoluteExpiresAt?: string } | { ok: false; error: string }

export async function touchAdminSession(): Promise<SessionResult> {
  const admin = await requirePermission('admin.access')
  if (!admin?.session) return { ok: false, error: 'انتهت جلسة الإدارة. أعيدي تسجيل الدخول.' }
  return { ok: true, idleExpiresAt: admin.session.idleExpiresAt, absoluteExpiresAt: admin.session.absoluteExpiresAt }
}

export async function revokeAdminSession(sessionId: string): Promise<SessionResult> {
  const admin = await requirePermission('admin.access')
  if (!admin?.userId || !admin.session || !/^[0-9a-f-]{36}$/i.test(sessionId)) return { ok: false, error: 'تعذّر إلغاء الجلسة.' }
  return manageSessions(admin.userId, admin.session.id, 'one', sessionId)
}

export async function revokeOtherAdminSessions(): Promise<SessionResult> {
  const admin = await requirePermission('admin.access')
  if (!admin?.userId || !admin.session) return { ok: false, error: 'تعذّر إلغاء الجلسات.' }
  return manageSessions(admin.userId, admin.session.id, 'others')
}

export async function revokeAllAdminSessions(): Promise<SessionResult> {
  const admin = await requirePermission('admin.access')
  if (!admin?.userId || !admin.session) return { ok: false, error: 'تعذّر إلغاء الجلسات.' }
  return manageSessions(admin.userId, admin.session.id, 'all')
}

async function manageSessions(actorId: string, currentSessionId: string, scope: 'one' | 'others' | 'all', sessionId?: string): Promise<SessionResult> {
  const { error } = await getServiceClient().rpc('manage_admin_sessions', {
    p_actor_id: actorId,
    p_current_session_id: currentSessionId,
    p_scope: scope,
    p_session_id: sessionId ?? null,
  })
  if (error) return { ok: false, error: error.code === 'PGRST202' ? 'يلزم تطبيق تحديث مركز الأمان على بيئة Staging أولًا.' : 'تعذّر إلغاء الجلسات.' }
  revalidatePath('/admin/security')
  return { ok: true }
}

export async function getAdminSessionInventory() {
  if (!hasSupabasePublicConfig() || !hasSupabaseServerSecret()) return { state: 'unconfigured' as const, sessions: [] }
  const admin = await requirePermission('admin.access')
  if (!admin?.userId) return { state: 'unavailable' as const, sessions: [] }
  const { data, error } = await getServiceClient().from('admin_sessions')
    .select('id,device_label,created_at,last_seen_at,idle_expires_at,absolute_expires_at,revoked_at')
    .eq('user_id', admin.userId).is('revoked_at', null).order('last_seen_at', { ascending: false }).limit(20)
  if (error) return { state: 'unavailable' as const, sessions: [] }
  return { state: 'ready' as const, sessions: (data ?? []).map((session) => ({ ...session, current: session.id === admin.session?.id })) }
}
