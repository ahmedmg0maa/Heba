'use server'

import { createHash, randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth/permissions'
import { getServiceClient } from '@/lib/supabase/server'

type Result = { ok: true } | { ok: false; error: string }

export async function addCustomerNote(userId: string, note: string): Promise<Result> {
  const admin = await requirePermission('users.manage')
  if (!admin?.userId) return { ok: false, error: 'لا تملكين صلاحية إدارة العملاء.' }
  if (note.trim().length < 2) return { ok: false, error: 'اكتبي ملاحظة واضحة.' }
  const service = getServiceClient()
  const { error } = await service.from('user_notes').insert({ user_id: userId, author_id: admin.userId, note: note.trim() })
  if (error) return { ok: false, error: 'تعذّر حفظ الملاحظة.' }
  await service.from('audit_logs').insert({ actor_id: admin.userId, action: 'customer.note_added', entity_type: 'user', entity_id: userId, meta: { length: note.trim().length } })
  revalidatePath(`/admin/users/${userId}`)
  return { ok: true }
}

export async function addCustomerTag(userId: string, tag: string): Promise<Result> {
  const admin = await requirePermission('users.manage')
  if (!admin?.userId) return { ok: false, error: 'لا تملكين صلاحية إدارة العملاء.' }
  const clean = tag.trim().slice(0, 40)
  if (clean.length < 2) return { ok: false, error: 'اكتبي وسمًا واضحًا.' }
  const service = getServiceClient()
  const { error } = await service.from('user_tags').upsert({ user_id: userId, tag: clean }, { onConflict: 'user_id,tag' })
  if (error) return { ok: false, error: 'تعذّر حفظ الوسم.' }
  await service.from('audit_logs').insert({ actor_id: admin.userId, action: 'customer.tag_added', entity_type: 'user', entity_id: userId, meta: { tag: clean } })
  revalidatePath(`/admin/users/${userId}`)
  return { ok: true }
}

export async function manageInboxMessage(
  messageId: string,
  input: { status: string; priority: string; assignedTo?: string; note?: string; spam: boolean; reply?: string },
): Promise<Result> {
  const admin = await requirePermission('inbox.manage')
  if (!admin?.userId) return { ok: false, error: 'لا تملكين صلاحية إدارة الرسائل.' }
  if (!['new', 'read', 'replied', 'archived'].includes(input.status)
    || !['low', 'normal', 'high', 'urgent'].includes(input.priority)) {
    return { ok: false, error: 'حالة الرسالة غير صحيحة.' }
  }
  const note = input.note?.trim() ?? ''
  const reply = input.reply?.trim() ?? ''
  if (note.length > 2000 || reply.length > 10000) return { ok: false, error: 'النص أطول من الحد المسموح.' }

  const { error } = await getServiceClient().rpc('manage_contact_message', {
    p_message_id: messageId,
    p_actor_id: admin.userId,
    p_status: input.status,
    p_priority: input.priority,
    p_assigned_to: input.assignedTo || null,
    p_note: note || null,
    p_spam: input.spam,
    p_reply: reply || null,
  })
  if (error) return { ok: false, error: 'تعذّر حفظ متابعة الرسالة.' }
  revalidatePath('/admin/inbox')
  return { ok: true }
}

export async function createUnsubscribeLink(subscriberId: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const admin = await requirePermission('newsletter.manage')
  if (!admin?.userId) return { ok: false, error: 'لا تملكين صلاحية إدارة القائمة.' }
  const token = `${randomUUID()}${randomUUID()}`.replaceAll('-', '')
  const hash = createHash('sha256').update(token).digest('hex')
  const { error } = await getServiceClient().from('newsletter_subscribers').update({
    unsubscribe_token_hash: hash,
    token_created_at: new Date().toISOString(),
  }).eq('id', subscriberId)
  if (error) return { ok: false, error: 'تعذّر إنشاء الرابط.' }
  return { ok: true, url: `/unsubscribe/${token}` }
}
