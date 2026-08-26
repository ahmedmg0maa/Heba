'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth/permissions'
import { getServiceClient } from '@/lib/supabase/server'

type SessionResult = { ok: true; idleExpiresAt?: string; absoluteExpiresAt?: string } | { ok: false; error: string }

export async function touchAdminSession(): Promise<SessionResult> {
  const admin = await requirePermission('admin.access')
  if (!admin?.session) return { ok: false, error: 'انتهت جلسة الإدارة. أعيدي تسجيل الدخول.' }
  return { ok: true, idleExpiresAt: admin.session.idleExpiresAt, absoluteExpiresAt: admin.session.absoluteExpiresAt }
}

export async function revokeAdminSession(sessionId: string): Promise<SessionResult> {
  const admin = await requirePermission('admin.access')
  if (!admin?.userId || !/^[0-9a-f-]{36}$/i.test(sessionId)) return { ok: false, error: 'تعذّر إلغاء الجلسة.' }
  const service = getServiceClient()
  const { error } = await service.from('admin_sessions').update({ revoked_at: new Date().toISOString() })
    .eq('id', sessionId).eq('user_id', admin.userId).is('revoked_at', null)
  if (error) return { ok: false, error: 'تعذّر إلغاء الجلسة.' }
  await service.from('audit_logs').insert({ actor_id: admin.userId, action: 'admin_session.revoked', entity_type: 'admin_session', entity_id: sessionId, meta: {} })
  revalidatePath('/admin/security')
  return { ok: true }
}

export async function revokeOtherAdminSessions(): Promise<SessionResult> {
  const admin = await requirePermission('admin.access')
  if (!admin?.userId || !admin.session) return { ok: false, error: 'تعذّر إلغاء الجلسات.' }
  const service = getServiceClient()
  const { error } = await service.from('admin_sessions').update({ revoked_at: new Date().toISOString() })
    .eq('user_id', admin.userId).neq('id', admin.session.id).is('revoked_at', null)
  if (error) return { ok: false, error: 'تعذّر إلغاء الجلسات.' }
  await service.from('audit_logs').insert({ actor_id: admin.userId, action: 'admin_session.others_revoked', entity_type: 'admin_session', entity_id: admin.session.id, meta: {} })
  revalidatePath('/admin/security')
  return { ok: true }
}

export async function revokeAllAdminSessions(): Promise<SessionResult> {
  const admin = await requirePermission('admin.access')
  if (!admin?.userId) return { ok: false, error: 'تعذّر إلغاء الجلسات.' }
  const service = getServiceClient()
  const { error } = await service.from('admin_sessions').update({ revoked_at: new Date().toISOString() })
    .eq('user_id', admin.userId).is('revoked_at', null)
  if (error) return { ok: false, error: 'تعذّر إلغاء الجلسات.' }
  await service.from('audit_logs').insert({ actor_id: admin.userId, action: 'admin_session.all_revoked', entity_type: 'admin_session', entity_id: admin.userId, meta: {} })
  revalidatePath('/admin/security')
  return { ok: true }
}

export async function getAdminSessionInventory() {
  const admin = await requirePermission('admin.access')
  if (!admin?.userId) return []
  const { data } = await getServiceClient().from('admin_sessions')
    .select('id,device_label,created_at,last_seen_at,idle_expires_at,absolute_expires_at,revoked_at')
    .eq('user_id', admin.userId).is('revoked_at', null).order('last_seen_at', { ascending: false }).limit(20)
  return (data ?? []).map((session) => ({ ...session, current: session.id === admin.session?.id }))
}
