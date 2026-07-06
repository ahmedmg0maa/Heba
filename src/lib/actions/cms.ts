'use server'

import { revalidatePath } from 'next/cache'
import { getServerClient, getServiceClient } from '@/lib/supabase/server'

type ActionResult = { ok: true } | { ok: false; error: string }

const NO_ENV = 'غير متاح في بيئة العرض التجريبية.'
const NOT_ADMIN = 'هذه العملية تتطلب صلاحية إدارية.'
const GENERIC = 'حدث خطأ — حاولي مرة أخرى.'

const hasEnv = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  )

async function requireAdminUser() {
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: role } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).limit(1).maybeSingle()
  return role ? { user, role: role.role } : null
}

async function audit(actorId: string, action: string, entityType: string, entityId: string, meta: object = {}) {
  await getServiceClient().from('audit_logs').insert({ actor_id: actorId, action, entity_type: entityType, entity_id: entityId, meta })
}

// One guarded toggle for boolean/status fields — whitelist only, never generic table access.
const FIELD_WHITELIST: Record<string, { fields: string[]; path: string }> = {
  products: { fields: ['is_published'], path: '/admin/products' },
  books: { fields: ['is_published'], path: '/admin/books' },
  courses: { fields: ['is_published'], path: '/admin/courses' },
  workshops: { fields: ['is_published'], path: '/admin/workshops' },
  articles: { fields: ['is_published'], path: '/admin/articles' },
  pages: { fields: ['is_published'], path: '/admin/pages' },
  reviews: { fields: ['is_approved', 'is_featured'], path: '/admin/reviews' },
}

export async function adminSetField(table: string, id: string, field: string, value: boolean): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser()
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const entry = FIELD_WHITELIST[table]
  if (!entry || !entry.fields.includes(field)) return { ok: false, error: 'عملية غير مسموح بها.' }

  const { error } = await getServiceClient().from(table).update({ [field]: value }).eq('id', id)
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.user.id, `${table}.${field}.${value}`, table, id)
  revalidatePath(entry.path)
  revalidatePath('/')
  return { ok: true }
}

export async function setBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show',
): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser()
  if (!admin) return { ok: false, error: NOT_ADMIN }

  const service = getServiceClient()
  const { data: booking } = await service.from('bookings').select('id, user_id, status').eq('id', bookingId).maybeSingle()
  if (!booking) return { ok: false, error: 'الحجز غير موجود.' }

  const { error } = await service.from('bookings').update({ status }).eq('id', bookingId)
  if (error) return { ok: false, error: GENERIC }

  await service.from('booking_events').insert({
    booking_id: bookingId,
    actor_id: admin.user.id,
    event: `status:${booking.status}→${status}`,
  })
  const labels: Record<typeof status, string> = {
    confirmed: 'تأكد موعد جلستك ✨',
    completed: 'اكتملت جلستك — شكرًا لحضورك',
    cancelled: 'أُلغي موعد جلستك',
    no_show: 'سُجّل تغيّب عن الجلسة',
  }
  await service.from('notifications').insert({
    user_id: booking.user_id,
    title: labels[status],
    body: '',
    kind: status === 'cancelled' || status === 'no_show' ? 'warning' : 'success',
    link: '/dashboard/bookings',
  })
  await audit(admin.user.id, `booking.${status}`, 'booking', bookingId, { previous: booking.status })
  revalidatePath('/admin/bookings')
  return { ok: true }
}

export async function deleteReview(reviewId: string): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser()
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const { error } = await getServiceClient().from('reviews').delete().eq('id', reviewId)
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.user.id, 'review.deleted', 'review', reviewId)
  revalidatePath('/admin/reviews')
  return { ok: true }
}

export async function createArticle(formData: FormData): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser()
  if (!admin) return { ok: false, error: NOT_ADMIN }

  const title = String(formData.get('title') ?? '').trim()
  const slug = String(formData.get('slug') ?? '').trim().toLowerCase()
  const excerpt = String(formData.get('excerpt') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  if (title.length < 3) return { ok: false, error: 'أدخلي عنوانًا.' }
  if (!/^[a-z0-9-]{3,60}$/.test(slug)) return { ok: false, error: 'الرابط: أحرف لاتينية صغيرة وأرقام وشرطات.' }

  const { data, error } = await getServiceClient()
    .from('articles')
    .insert({ title, slug, excerpt, content, author_id: admin.user.id, is_published: false })
    .select('id')
    .single()
  if (error) return { ok: false, error: error.code === '23505' ? 'هذا الرابط مستخدم.' : GENERIC }
  await audit(admin.user.id, 'article.created', 'article', data.id, { slug })
  revalidatePath('/admin/articles')
  return { ok: true }
}

export async function publishArticle(articleId: string, publish: boolean): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser()
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const { error } = await getServiceClient()
    .from('articles')
    .update({ is_published: publish, published_at: publish ? new Date().toISOString() : null })
    .eq('id', articleId)
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.user.id, publish ? 'article.published' : 'article.unpublished', 'article', articleId)
  revalidatePath('/admin/articles')
  revalidatePath('/articles')
  return { ok: true }
}

export async function updateSetting(key: string, jsonText: string): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser()
  if (!admin) return { ok: false, error: NOT_ADMIN }
  let value: unknown
  try {
    value = JSON.parse(jsonText)
  } catch {
    return { ok: false, error: 'صيغة JSON غير صحيحة.' }
  }
  const { error } = await getServiceClient()
    .from('site_settings')
    .upsert({ key, value, updated_by: admin.user.id }, { onConflict: 'key' })
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.user.id, 'setting.updated', 'site_setting', key)
  revalidatePath('/admin/settings')
  return { ok: true }
}

export async function toggleFlag(key: string, enabled: boolean): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser()
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const { error } = await getServiceClient()
    .from('feature_flags')
    .upsert({ key, is_enabled: enabled }, { onConflict: 'key' })
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.user.id, enabled ? 'flag.enabled' : 'flag.disabled', 'feature_flag', key)
  revalidatePath('/admin/settings')
  revalidatePath('/')
  return { ok: true }
}

export async function grantRole(formData: FormData): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser()
  if (!admin) return { ok: false, error: NOT_ADMIN }
  if (admin.role !== 'owner') return { ok: false, error: 'إدارة الأدوار متاحة للمالكة فقط.' }

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const role = String(formData.get('role') ?? '')
  if (!['owner', 'admin', 'support', 'editor'].includes(role)) return { ok: false, error: 'دور غير معروف.' }

  const service = getServiceClient()
  const { data: profile } = await service.from('profiles').select('id').eq('email', email).maybeSingle()
  if (!profile) return { ok: false, error: 'لا يوجد حساب بهذا البريد.' }

  const { error } = await service
    .from('admin_roles')
    .upsert({ user_id: profile.id, role, granted_by: admin.user.id }, { onConflict: 'user_id,role' })
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.user.id, 'role.granted', 'admin_role', profile.id, { email, role })
  revalidatePath('/admin/roles')
  return { ok: true }
}

export async function revokeRole(roleId: string): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser()
  if (!admin) return { ok: false, error: NOT_ADMIN }
  if (admin.role !== 'owner') return { ok: false, error: 'إدارة الأدوار متاحة للمالكة فقط.' }
  const { error } = await getServiceClient().from('admin_roles').delete().eq('id', roleId)
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.user.id, 'role.revoked', 'admin_role', roleId)
  revalidatePath('/admin/roles')
  return { ok: true }
}

export async function addModule(courseId: string, title: string): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser()
  if (!admin) return { ok: false, error: NOT_ADMIN }
  if (title.trim().length < 2) return { ok: false, error: 'أدخلي عنوان الوحدة.' }
  const service = getServiceClient()
  const { count } = await service.from('course_modules').select('id', { count: 'exact', head: true }).eq('course_id', courseId)
  const { error } = await service.from('course_modules').insert({ course_id: courseId, title: title.trim(), sort: (count ?? 0) + 1 })
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.user.id, 'module.created', 'course', courseId, { title })
  revalidatePath(`/admin/courses/${courseId}/curriculum`)
  return { ok: true }
}

export async function addLesson(moduleId: string, courseId: string, formData: FormData): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser()
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const title = String(formData.get('title') ?? '').trim()
  const minutes = Number(formData.get('minutes') ?? 0)
  const isPreview = formData.get('is_preview') === 'on'
  const videoPath = String(formData.get('video_path') ?? '').trim() || null
  if (title.length < 2) return { ok: false, error: 'أدخلي عنوان الدرس.' }

  const service = getServiceClient()
  const { count } = await service.from('course_lessons').select('id', { count: 'exact', head: true }).eq('module_id', moduleId)
  const { error } = await service.from('course_lessons').insert({
    module_id: moduleId,
    title,
    duration_seconds: Math.max(0, Math.round(minutes * 60)),
    is_preview: isPreview,
    video_path: videoPath,
    sort: (count ?? 0) + 1,
  })
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.user.id, 'lesson.created', 'course_module', moduleId, { title })
  revalidatePath(`/admin/courses/${courseId}/curriculum`)
  return { ok: true }
}

export async function updatePageSeo(pageId: string, formData: FormData): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser()
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const { error } = await getServiceClient()
    .from('pages')
    .update({
      seo_title: String(formData.get('seo_title') ?? '').trim() || null,
      seo_description: String(formData.get('seo_description') ?? '').trim() || null,
    })
    .eq('id', pageId)
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.user.id, 'page.seo_updated', 'page', pageId)
  revalidatePath('/admin/pages')
  return { ok: true }
}
