'use server'

import { revalidatePath } from 'next/cache'
import { getServerClient, getServiceClient } from '@/lib/supabase/server'

type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string }

const NO_ENV = 'غير متاح في بيئة العرض التجريبية.'
const NOT_ADMIN = 'هذه العملية تتطلب صلاحية إدارية.'
const GENERIC = 'حدث خطأ — حاولي مرة أخرى.'

const hasEnv = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  )

// Every admin action re-verifies the role server-side; never trust the client.
async function requireAdminUser() {
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: role } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  return role ? { user, role: role.role } : null
}

async function audit(actorId: string, action: string, entityType: string, entityId: string, meta: object) {
  await getServiceClient().from('audit_logs').insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    meta,
  })
}

async function notify(userId: string, title: string, body: string, kind: string, link: string) {
  await getServiceClient().from('notifications').insert({ user_id: userId, title, body, kind, link })
}

export async function getProofUrl(paymentId: string): Promise<ActionResult<{ url: string }>> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser()
  if (!admin) return { ok: false, error: NOT_ADMIN }

  const service = getServiceClient()
  const { data: proof } = await service
    .from('payment_proofs')
    .select('storage_path')
    .eq('payment_id', paymentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!proof) return { ok: false, error: 'لا يوجد إيصال مرفق.' }

  const { data, error } = await service.storage.from('payment-proofs').createSignedUrl(proof.storage_path, 10 * 60)
  if (error || !data) return { ok: false, error: GENERIC }
  return { ok: true, data: { url: data.signedUrl } }
}

export async function approvePayment(paymentId: string): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser()
  if (!admin) return { ok: false, error: NOT_ADMIN }

  const service = getServiceClient()
  const { data: payment } = await service
    .from('payments')
    .select('id, order_id, user_id, status, amount')
    .eq('id', paymentId)
    .maybeSingle()
  if (!payment) return { ok: false, error: 'الدفعة غير موجودة.' }
  if (payment.status !== 'pending') return { ok: false, error: 'هذه الدفعة رُوجعت بالفعل.' }

  const { data: items } = await service
    .from('order_items')
    .select('product_id, order_id, products!inner(id, type)')
    .eq('order_id', payment.order_id)

  const nowIso = new Date().toISOString()

  const { error: payErr } = await service
    .from('payments')
    .update({ status: 'approved', reviewed_by: admin.user.id, reviewed_at: nowIso })
    .eq('id', paymentId)
    .eq('status', 'pending')
  if (payErr) return { ok: false, error: GENERIC }

  const { error: orderErr } = await service
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', payment.order_id)
  if (orderErr) return { ok: false, error: GENERIC }

  // Grant access per item, including domain-specific access rows.
  for (const item of items ?? []) {
    const product = Array.isArray(item.products) ? item.products[0] : item.products
    if (!product) continue

    await service.from('content_access').upsert(
      {
        user_id: payment.user_id,
        product_id: product.id,
        source: 'purchase',
        order_id: payment.order_id,
        granted_by: admin.user.id,
      },
      { onConflict: 'user_id,product_id' },
    )

    if (product.type === 'course') {
      const { data: course } = await service.from('courses').select('id').eq('product_id', product.id).maybeSingle()
      if (course)
        await service.from('course_enrollments').upsert(
          { user_id: payment.user_id, course_id: course.id, source: 'purchase' },
          { onConflict: 'user_id,course_id' },
        )
    } else if (product.type === 'book') {
      const { data: book } = await service.from('books').select('id').eq('product_id', product.id).maybeSingle()
      if (book)
        await service.from('book_access').upsert(
          { user_id: payment.user_id, book_id: book.id, order_id: payment.order_id },
          { onConflict: 'user_id,book_id' },
        )
    } else if (product.type === 'workshop') {
      const { data: workshop } = await service.from('workshops').select('id').eq('product_id', product.id).maybeSingle()
      if (workshop)
        await service.from('workshop_registrations').upsert(
          { workshop_id: workshop.id, user_id: payment.user_id, order_id: payment.order_id, status: 'registered' },
          { onConflict: 'workshop_id,user_id' },
        )
    }
  }

  await notify(
    payment.user_id,
    'تم اعتماد دفعتك 🎉',
    'فُعّل وصولك لمشترياتك — استمتعي برحلتك.',
    'success',
    '/dashboard',
  )
  await audit(admin.user.id, 'payment.approved', 'payment', paymentId, {
    order_id: payment.order_id,
    amount: payment.amount,
  })

  revalidatePath('/admin/payments')
  revalidatePath('/admin/overview')
  return { ok: true, data: null }
}

export async function rejectPayment(paymentId: string, reason: string): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser()
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const trimmed = reason.trim()
  if (trimmed.length < 3) return { ok: false, error: 'سبب الرفض مطلوب ليظهر للعميلة.' }

  const service = getServiceClient()
  const { data: payment } = await service
    .from('payments')
    .select('id, order_id, user_id, status')
    .eq('id', paymentId)
    .maybeSingle()
  if (!payment) return { ok: false, error: 'الدفعة غير موجودة.' }
  if (payment.status !== 'pending') return { ok: false, error: 'هذه الدفعة رُوجعت بالفعل.' }

  const nowIso = new Date().toISOString()
  const { error: payErr } = await service
    .from('payments')
    .update({ status: 'rejected', reviewed_by: admin.user.id, reviewed_at: nowIso, reject_reason: trimmed })
    .eq('id', paymentId)
    .eq('status', 'pending')
  if (payErr) return { ok: false, error: GENERIC }

  // Order returns to pending_payment so the customer can re-upload a proof.
  const { error: orderErr } = await service
    .from('orders')
    .update({ status: 'pending_payment' })
    .eq('id', payment.order_id)
  if (orderErr) return { ok: false, error: GENERIC }

  await notify(
    payment.user_id,
    'لم نتمكن من اعتماد إيصالك',
    `السبب: ${trimmed}. يمكنك رفع إيصال جديد من صفحة مدفوعاتك.`,
    'warning',
    '/dashboard/payments',
  )
  await audit(admin.user.id, 'payment.rejected', 'payment', paymentId, {
    order_id: payment.order_id,
    reason: trimmed,
  })

  revalidatePath('/admin/payments')
  revalidatePath('/admin/overview')
  return { ok: true, data: null }
}
