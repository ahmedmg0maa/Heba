'use server'

import { revalidatePath } from 'next/cache'
import { createHash } from 'node:crypto'
import { getServiceClient, hasSupabaseServerSecret } from '@/lib/supabase/server'
import { FRESH_ADMIN_ASSURANCE_ERROR, PERMISSIONS, requireFreshAdminAssurance, requirePermission, type Permission } from '@/lib/auth/permissions'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'
import { defaultHomeContent, HOME_SECTION_KINDS, isHomeSectionKind, normalizeHomeContent, type HomeSectionKind } from '@/lib/home/sections'
import { normalizeStartHereContent } from '@/lib/start-here/content'
import { catalogPublicationReadiness, type CatalogPublicationKind } from '@/lib/catalog/publication-readiness'

type ActionResult = { ok: true } | { ok: false; error: string }

const NO_ENV = 'غير متاح في بيئة العرض التجريبية.'
const NOT_ADMIN = 'هذه العملية تتطلب صلاحية إدارية.'
const GENERIC = 'حدث خطأ — حاولي مرة أخرى.'

const hasEnv = () => hasSupabasePublicConfig() && hasSupabaseServerSecret()
const SECTION_KINDS = ['hero','intro','trust','pathways','guided_start','editorial_feature','featured_services','books','courses','workshops','availability_preview','offer','testimonials','press','articles','resources','newsletter','cta','rich_text'] as const
const safeLink = (value: string) => value.startsWith('/') || /^https:\/\/[^\s]+$/i.test(value)
function validateSectionContent(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'محتوى القسم يجب أن يكون كائن JSON منظمًا.'
  const pending: unknown[] = [value]
  while (pending.length) {
    const item = pending.pop()
    if (Array.isArray(item)) { pending.push(...item); continue }
    if (!item || typeof item !== 'object') continue
    for (const [key, child] of Object.entries(item)) {
      if (typeof child === 'string' && /(href|url|link|cta)/i.test(key) && child && !safeLink(child)) return `الرابط في الحقل ${key} يجب أن يكون داخليًا أو HTTPS.`
      if (typeof child === 'object' && child) pending.push(child)
    }
  }
  return null
}

async function requireAdminUser(permission: Permission) {
  const context = await requirePermission(permission)
  return context?.userId ? { user: { id: context.userId }, role: context.role } : null
}

async function audit(actorId: string, action: string, entityType: string, entityId: string, meta: object = {}) {
  await getServiceClient().from('audit_logs').insert({ actor_id: actorId, action, entity_type: entityType, entity_id: entityId, meta })
}

// One guarded toggle for boolean/status fields — whitelist only, never generic table access.
const FIELD_WHITELIST: Record<string, { fields: string[]; path: string; permission: Permission }> = {
  products: { fields: ['is_published'], path: '/admin/products', permission: 'catalog.publish' },
  books: { fields: ['is_published'], path: '/admin/books', permission: 'catalog.publish' },
  courses: { fields: ['is_published'], path: '/admin/courses', permission: 'catalog.publish' },
  workshops: { fields: ['is_published'], path: '/admin/workshops', permission: 'catalog.publish' },
  articles: { fields: ['is_published'], path: '/admin/articles', permission: 'content.publish' },
  pages: { fields: ['is_published'], path: '/admin/pages', permission: 'content.publish' },
}

export async function adminSetField(table: string, id: string, field: string, value: boolean): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const entry = FIELD_WHITELIST[table]
  if (!entry || !entry.fields.includes(field)) return { ok: false, error: 'عملية غير مسموح بها.' }
  const admin = await requireAdminUser(entry.permission)
  if (!admin) return { ok: false, error: NOT_ADMIN }

  const service = getServiceClient()
  const catalogKinds: Partial<Record<string, CatalogPublicationKind>> = { courses: 'course', books: 'book', workshops: 'workshop' }
  let linked: { table: string; id: string; field: 'is_published' | 'is_active' } | null = null
  if (field === 'is_published' && catalogKinds[table]) {
    if (value) {
      const readiness = await catalogPublicationReadiness(catalogKinds[table]!, id)
      if (!readiness.ready) return { ok: false, error: `لا يمكن النشر: ${readiness.issues.join(' ')}` }
    }
    const { data: domain } = await service.from(table).select('product_id,is_published').eq('id', id).maybeSingle()
    if (!domain) return { ok: false, error: 'العنصر غير موجود.' }
    linked = { table: 'products', id: domain.product_id, field: 'is_published' }
  } else if (table === 'products' && field === 'is_published') {
    const { data: product } = await service.from('products').select('id,type,is_published').eq('id', id).maybeSingle()
    if (!product) return { ok: false, error: 'المنتج غير موجود.' }
    const productKind: Partial<Record<string, CatalogPublicationKind>> = { course: 'course', book: 'book', workshop: 'workshop', session: 'service' }
    const kind = productKind[product.type]
    if (kind) {
      const domainTable = kind === 'course' ? 'courses' : kind === 'book' ? 'books' : kind === 'workshop' ? 'workshops' : 'services'
      const domainField = kind === 'service' ? 'is_active' : 'is_published'
      const { data: domain } = await service.from(domainTable).select(`id,${domainField}`).eq('product_id', id).maybeSingle()
      if (!domain) return { ok: false, error: 'تفاصيل المنتج المتخصصة غير موجودة.' }
      if (value) {
        const readiness = await catalogPublicationReadiness(kind, domain.id)
        if (!readiness.ready) return { ok: false, error: `لا يمكن النشر: ${readiness.issues.join(' ')}` }
      }
      linked = { table: domainTable, id: domain.id, field: domainField }
    }
  }

  const { data: previous } = await service.from(table).select(field).eq('id', id).maybeSingle()
  const { error } = await service.from(table).update({ [field]: value }).eq('id', id)
  if (error) return { ok: false, error: GENERIC }
  if (linked) {
    const { error: linkedError } = await service.from(linked.table).update({ [linked.field]: value }).eq('id', linked.id)
    if (linkedError) {
      await service.from(table).update({ [field]: Boolean((previous as Record<string, unknown> | null)?.[field]) }).eq('id', id)
      return { ok: false, error: 'تعذّر مزامنة حالة النشر؛ أُعيدت الحالة السابقة.' }
    }
  }
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
  const admin = await requireAdminUser('bookings.manage')
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
  const admin = await requireAdminUser('reviews.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const { error } = await getServiceClient().from('reviews').delete().eq('id', reviewId)
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.user.id, 'review.deleted', 'review', reviewId)
  revalidatePath('/admin/reviews')
  return { ok: true }
}

export async function createArticle(formData: FormData): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser('content.manage')
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
  const admin = await requireAdminUser('content.publish')
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
  const admin = await requireAdminUser('settings.manage')
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
  const admin = await requireAdminUser('feature_flags.manage')
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
  const context = await requireFreshAdminAssurance('roles.manage')
  const admin = context?.userId ? { user: { id: context.userId }, role: context.role } : null
  if (!admin) return { ok: false, error: FRESH_ADMIN_ASSURANCE_ERROR }
  if (admin.role !== 'owner') return { ok: false, error: 'إدارة الأدوار متاحة للمالكة فقط.' }

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const role = String(formData.get('role') ?? '')
  if (!['owner', 'admin', 'operations', 'finance', 'content', 'marketing', 'support', 'editor'].includes(role)) return { ok: false, error: 'دور غير معروف.' }

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
  const context = await requireFreshAdminAssurance('roles.manage')
  const admin = context?.userId ? { user: { id: context.userId }, role: context.role } : null
  if (!admin) return { ok: false, error: FRESH_ADMIN_ASSURANCE_ERROR }
  if (admin.role !== 'owner') return { ok: false, error: 'إدارة الأدوار متاحة للمالكة فقط.' }
  const service = getServiceClient()
  const { data: target } = await service.from('admin_roles').select('role').eq('id', roleId).maybeSingle()
  if (!target) return { ok: false, error: 'الدور غير موجود.' }
  if (target.role === 'owner') {
    const { count } = await service.from('admin_roles').select('id', { count: 'exact', head: true }).eq('role', 'owner')
    if ((count ?? 0) <= 1) return { ok: false, error: 'لا يمكن سحب آخر دور مالكة؛ يجب أن يبقى مسار استرداد واحد على الأقل.' }
  }
  const { error } = await service.from('admin_roles').delete().eq('id', roleId)
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.user.id, 'role.revoked', 'admin_role', roleId)
  revalidatePath('/admin/roles')
  return { ok: true }
}

export async function setRolePermissions(role: string, permissions: string[]): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const context = await requireFreshAdminAssurance('roles.manage')
  const admin = context?.userId ? { user: { id: context.userId }, role: context.role } : null
  if (!admin) return { ok: false, error: FRESH_ADMIN_ASSURANCE_ERROR }
  if (admin.role !== 'owner') return { ok: false, error: 'تعديل مصفوفة الصلاحيات متاح للمالكة فقط.' }
  if (!['admin','operations','finance','content','marketing','support','editor'].includes(role)) return { ok: false, error: 'لا يمكن تعديل هذا الدور.' }
  const allowed = [...new Set(permissions)].filter((permission): permission is Permission => PERMISSIONS.includes(permission as Permission))
  if (!allowed.includes('admin.access')) return { ok: false, error: 'يجب أن يحتفظ كل دور إداري بصلاحية admin.access.' }
  const service = getServiceClient()
  const { error: deleteError } = await service.from('admin_permissions').delete().eq('role', role)
  if (deleteError) return { ok: false, error: GENERIC }
  const { error } = await service.from('admin_permissions').insert(allowed.map((permission) => ({ role, permission })))
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.user.id, 'permissions.updated', 'admin_role', role, { permissions: allowed })
  revalidatePath('/admin/roles')
  return { ok: true }
}

export async function addModule(courseId: string, title: string): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser('learning.manage')
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

export async function updateCourseModule(moduleId:string,courseId:string,title:string,sort:number):Promise<ActionResult>{const admin=await requireAdminUser('learning.manage');if(!admin)return{ok:false,error:NOT_ADMIN};if(title.trim().length<2||sort<1)return{ok:false,error:'راجعي عنوان الوحدة وترتيبها.'};const{error}=await getServiceClient().from('course_modules').update({title:title.trim(),sort:Math.round(sort)}).eq('id',moduleId).eq('course_id',courseId);if(error)return{ok:false,error:GENERIC};await audit(admin.user.id,'module.updated','course_module',moduleId,{title,sort});revalidatePath(`/admin/courses/${courseId}/curriculum`);return{ok:true}}
export async function deleteCourseModule(moduleId:string,courseId:string):Promise<ActionResult>{const admin=await requireAdminUser('learning.manage');if(!admin)return{ok:false,error:NOT_ADMIN};const service=getServiceClient(),{count}=await service.from('course_lessons').select('id',{count:'exact',head:true}).eq('module_id',moduleId);if((count??0)>0)return{ok:false,error:'انقلي أو احذفي دروس الوحدة قبل حذفها.'};const{error}=await service.from('course_modules').delete().eq('id',moduleId).eq('course_id',courseId);if(error)return{ok:false,error:GENERIC};await audit(admin.user.id,'module.deleted','course_module',moduleId);revalidatePath(`/admin/courses/${courseId}/curriculum`);return{ok:true}}
export async function updateCourseLesson(lessonId:string,courseId:string,form:FormData):Promise<ActionResult>{const admin=await requireAdminUser('learning.manage');if(!admin)return{ok:false,error:NOT_ADMIN};const title=String(form.get('title')??'').trim(),minutes=Number(form.get('minutes')??0),sort=Number(form.get('sort')??0);if(title.length<2||minutes<0||sort<1)return{ok:false,error:'راجعي بيانات الدرس.'};const{error}=await getServiceClient().from('course_lessons').update({title,duration_seconds:Math.round(minutes*60),sort:Math.round(sort),is_preview:form.get('is_preview')==='on'}).eq('id',lessonId);if(error)return{ok:false,error:GENERIC};await audit(admin.user.id,'lesson.updated','course_lesson',lessonId,{title,minutes,sort});revalidatePath(`/admin/courses/${courseId}/curriculum`);return{ok:true}}
export async function deleteCourseLesson(lessonId:string,courseId:string):Promise<ActionResult>{const admin=await requireAdminUser('learning.manage');if(!admin)return{ok:false,error:NOT_ADMIN};const{error}=await getServiceClient().from('course_lessons').delete().eq('id',lessonId);if(error)return{ok:false,error:GENERIC};await audit(admin.user.id,'lesson.deleted','course_lesson',lessonId);revalidatePath(`/admin/courses/${courseId}/curriculum`);return{ok:true}}

export async function addLesson(moduleId: string, courseId: string, formData: FormData): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser('learning.manage')
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
  const admin = await requireAdminUser('content.manage')
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

export async function createCmsPage(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdminUser('content.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const title = String(formData.get('title') ?? '').trim()
  const slug = String(formData.get('slug') ?? '').trim().toLowerCase()
  if (title.length < 3) return { ok: false, error: 'اكتبي عنوانًا واضحًا للصفحة.' }
  if (!/^[a-z0-9-]{2,80}$/.test(slug)) return { ok: false, error: 'الرابط يتكوّن من أحرف لاتينية صغيرة وأرقام وشرطات.' }
  const service = getServiceClient()
  const { data, error } = await service.from('pages').insert({ title, slug, status: 'draft', is_published: false }).select('id').single()
  if (error || !data) return { ok: false, error: error?.code === '23505' ? 'هذا الرابط مستخدم بالفعل.' : GENERIC }
  await audit(admin.user.id, 'page.created', 'page', data.id, { slug })
  revalidatePath('/admin/pages')
  return { ok: true }
}

type HomeSectionContentResult = { ok: true; content: unknown } | { ok: false; error: string }

const homeText = (formData: FormData, name: string, min = 2, max = 320) => {
  const value = String(formData.get(name) ?? '').trim()
  return value.length >= min && value.length <= max ? value : null
}

const homeHref = (formData: FormData, name: string) => {
  const value = String(formData.get(name) ?? '').trim()
  return value.startsWith('/') && !value.startsWith('//') && value.length <= 180 ? value : null
}

function homeSectionContentFromForm(kind: HomeSectionKind, formData: FormData): HomeSectionContentResult {
  const required = (name: string, min = 2, max = 320) => homeText(formData, name, min, max)
  if (kind === 'hero') return { ok: true, content: {} }
  if (kind === 'trust') {
    const items = [0, 1, 2, 3].map((index) => ({ title: required(`item_title_${index}`, 2, 70), text: required(`item_text_${index}`, 4, 150) }))
    if (items.some((item) => !item.title || !item.text)) return { ok: false, error: 'أكملي عناوين شريط الثقة وتوضيحاتها.' }
    return { ok: true, content: { items } }
  }
  if (kind === 'pathways') {
    const items = [0, 1, 2, 3].map((index) => ({ title: required(`item_title_${index}`, 2, 70), text: required(`item_text_${index}`, 8, 180), href: homeHref(formData, `item_href_${index}`), cta: required(`item_cta_${index}`, 2, 60) }))
    if (items.some((item) => Object.values(item).some((value) => !value))) return { ok: false, error: 'أكملي المسارات الأربعة بروابط داخلية صحيحة.' }
    const content = { eyebrow: required('eyebrow', 2, 80), heading: required('heading', 3, 120), lead: required('lead', 8, 240), items }
    if (!content.eyebrow || !content.heading || !content.lead) return { ok: false, error: 'أكملي عنوان قسم المسارات ووصفه.' }
    return { ok: true, content }
  }
  if (kind === 'guided_start') {
    const steps = [0, 1, 2].map((index) => ({ title: required(`step_title_${index}`, 2, 80), text: required(`step_text_${index}`, 8, 200), href: homeHref(formData, `step_href_${index}`), cta: required(`step_cta_${index}`, 2, 60) }))
    if (steps.some((item) => Object.values(item).some((value) => !value))) return { ok: false, error: 'أكملي خطوات البداية الثلاث بروابط داخلية صحيحة.' }
    const content = { eyebrow: required('eyebrow', 2, 80), heading: required('heading', 3, 120), lead: required('lead', 8, 240), steps, comparisonEyebrow: required('comparison_eyebrow', 2, 80), comparisonHeading: required('comparison_heading', 3, 120), comparisonLead: required('comparison_lead', 8, 240) }
    if (Object.values(content).some((value) => !value)) return { ok: false, error: 'أكملي عنوان رحلة البداية والمقارنة ووصفهما.' }
    return { ok: true, content }
  }
  if (kind === 'offer') {
    const ctaLabel = required('cta_label', 2, 70)
    return ctaLabel ? { ok: true, content: { ctaLabel } } : { ok: false, error: 'أدخلي نص زر العرض.' }
  }
  if (kind === 'articles' || kind === 'resources') {
    const content = { eyebrow: required('eyebrow', 2, 80), heading: required('heading', 3, 120), lead: required('lead', 8, 240), ctaLabel: required('cta_label', 2, 70) }
    return Object.values(content).some((value) => !value) ? { ok: false, error: kind === 'resources' ? 'أكملي نصوص قسم الموارد.' : 'أكملي نصوص قسم المقالات.' } : { ok: true, content }
  }
  if (kind === 'testimonials') {
    const content = { eyebrow: required('eyebrow', 2, 80), heading: required('heading', 3, 120) }
    return Object.values(content).some((value) => !value) ? { ok: false, error: 'أكملي عنوان قسم الآراء.' } : { ok: true, content }
  }
  if (kind === 'press') {
    const content = { eyebrow: required('eyebrow', 2, 80), heading: required('heading', 3, 120), lead: required('lead', 8, 240), ctaLabel: required('cta_label', 2, 70) }
    return Object.values(content).some((value) => !value) ? { ok: false, error: 'أكملي نصوص قسم الظهور الإعلامي.' } : { ok: true, content }
  }
  const content = { eyebrow: required('eyebrow', 2, 80), heading: required('heading', 3, 120), body: required('body', 8, 320), primaryLabel: required('primary_label', 2, 60), primaryHref: homeHref(formData, 'primary_href'), secondaryLabel: required('secondary_label', 2, 60), secondaryHref: homeHref(formData, 'secondary_href') }
  if (Object.values(content).some((value) => !value)) return { ok: false, error: 'أكملي محتوى القسم وروابطه الداخلية.' }
  return { ok: true, content }
}

export async function createHomeSection(pageId: string, kindValue: string): Promise<ActionResult> {
  const admin = await requireAdminUser('content.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  if (!isHomeSectionKind(kindValue)) return { ok: false, error: 'نوع قسم الصفحة الرئيسية غير معتمد.' }
  const service = getServiceClient()
  const { data: page } = await service.from('pages').select('id,slug').eq('id', pageId).maybeSingle()
  if (page?.slug !== 'home') return { ok: false, error: 'هذه الأقسام مخصصة للصفحة الرئيسية فقط.' }
  const { data: existing } = await service.from('page_sections').select('id').eq('page_id', pageId).eq('kind', kindValue).limit(1).maybeSingle()
  if (existing) return { ok: false, error: 'هذا النوع موجود بالفعل؛ عدّليه بدل إنشاء نسخة مكررة.' }
  const { count } = await service.from('page_sections').select('id', { count: 'exact', head: true }).eq('page_id', pageId)
  const option = HOME_SECTION_KINDS.indexOf(kindValue)
  const { data, error } = await service.from('page_sections').insert({ page_id: pageId, name: kindValue, kind: kindValue, sort: Math.max((count ?? 0) * 10, option * 10), is_visible: true, content: defaultHomeContent(kindValue) }).select('id').single()
  if (error || !data) return { ok: false, error: GENERIC }
  await audit(admin.user.id, 'home_section.created', 'page_section', data.id, { pageId, kind: kindValue })
  revalidatePath('/admin/pages'); revalidatePath('/'); return { ok: true }
}

export async function saveHomeSection(pageId: string, sectionId: string, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdminUser('content.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const kindValue = String(formData.get('kind') ?? '')
  if (!isHomeSectionKind(kindValue)) return { ok: false, error: 'نوع قسم الصفحة الرئيسية غير معتمد.' }
  const parsed = homeSectionContentFromForm(kindValue, formData)
  if (!parsed.ok) return parsed
  const name = homeText(formData, 'name', 2, 100)
  const sort = Number(formData.get('sort') ?? 0)
  if (!name || !Number.isInteger(sort) || sort < 0 || sort > 1000) return { ok: false, error: 'راجعي اسم القسم وترتيبه.' }
  const service = getServiceClient()
  const { data: page } = await service.from('pages').select('slug').eq('id', pageId).maybeSingle()
  const { data: previous } = await service.from('page_sections').select('*').eq('id', sectionId).eq('page_id', pageId).maybeSingle()
  if (page?.slug !== 'home' || !previous || previous.kind !== kindValue) return { ok: false, error: 'القسم غير موجود أو لا يطابق الصفحة.' }
  await service.from('content_revisions').insert({ entity_type: 'page_section', entity_id: sectionId, snapshot: previous, created_by: admin.user.id })
  const { error } = await service.from('page_sections').update({ name, sort, is_visible: formData.get('is_visible') === 'on', content: normalizeHomeContent(kindValue, parsed.content), revision: Number(previous.revision ?? 1) + 1 }).eq('id', sectionId).eq('page_id', pageId)
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.user.id, 'home_section.updated', 'page_section', sectionId, { pageId, kind: kindValue, sort, visible: formData.get('is_visible') === 'on' })
  revalidatePath('/admin/pages'); revalidatePath('/'); return { ok: true }
}

export async function saveCmsPage(pageId: string, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdminUser('content.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const status = String(formData.get('status') ?? 'draft')
  const publishAt = String(formData.get('publish_at') ?? '') || null
  const legalReviewStatus = String(formData.get('legal_review_status') ?? 'not_applicable')
  const legalVersion = String(formData.get('legal_version') ?? '').trim() || null
  const effectiveAt = String(formData.get('effective_at') ?? '').trim() || null
  if (!['draft','scheduled','published','archived'].includes(status) || (status === 'scheduled' && !publishAt)) return { ok: false, error: 'حددي حالة نشر وموعدًا صحيحًا.' }
  if (!['not_applicable','draft','pending','approved'].includes(legalReviewStatus)) return { ok: false, error: 'حالة المراجعة القانونية غير صحيحة.' }
  const service = getServiceClient()
  const { data: previous } = await service.from('pages').select('*').eq('id', pageId).maybeSingle()
  if (!previous) return { ok: false, error: 'الصفحة غير موجودة.' }
  if (['privacy','terms','refund','disclaimer','session-policy'].includes(previous.slug) && status === 'published' && (legalReviewStatus !== 'approved' || !legalVersion || !effectiveAt)) return { ok: false, error: 'لا يمكن نشر صفحة قانونية قبل الاعتماد وتحديد الإصدار وتاريخ السريان.' }
  if (previous.slug === 'home' && status === 'published') {
    const { data: sections, error: sectionsError } = await service.from('page_sections').select('kind').eq('page_id', pageId).eq('is_visible', true)
    const kinds = new Set((sections ?? []).map((section) => section.kind))
    if (sectionsError || !['hero','pathways','cta'].every((kind) => kinds.has(kind))) return { ok: false, error: 'لا يمكن نشر الصفحة الرئيسية قبل وجود Hero والمسارات والدعوة الختامية كأقسام ظاهرة.' }
  }
  await service.from('content_revisions').insert({ entity_type: 'page', entity_id: pageId, snapshot: previous, created_by: admin.user.id })
  const { error } = await service.from('pages').update({ title: String(formData.get('title') ?? '').trim(), seo_title: String(formData.get('seo_title') ?? '').trim() || null, seo_description: String(formData.get('seo_description') ?? '').trim() || null, canonical_url: String(formData.get('canonical_url') ?? '').trim() || null, og_image_url: String(formData.get('og_image_url') ?? '').trim() || null, status, publish_at: publishAt, is_published: status === 'published', legal_review_status: legalReviewStatus, legal_version: legalVersion, effective_at: effectiveAt, revision: Number(previous.revision ?? 1) + 1 }).eq('id', pageId)
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.user.id, 'page.saved', 'page', pageId, { status, publishAt, legalReviewStatus, legalVersion, effectiveAt })
  revalidatePath('/admin/pages'); revalidatePath('/'); revalidatePath(`/${previous.slug}`); return { ok: true }
}
export async function savePageSection(pageId:string,sectionId:string|null,formData:FormData):Promise<ActionResult>{const admin=await requireAdminUser('content.manage');if(!admin)return{ok:false,error:NOT_ADMIN};let content;try{content=JSON.parse(String(formData.get('content')??'{}'))}catch{return{ok:false,error:'محتوى القسم يجب أن يكون JSON صحيحًا.'}}const kind=String(formData.get('kind')??'rich_text').trim();if(!SECTION_KINDS.includes(kind as typeof SECTION_KINDS[number]))return{ok:false,error:'نوع القسم غير معتمد في نظام التصميم.'};const contentError=validateSectionContent(content);if(contentError)return{ok:false,error:contentError};const name=String(formData.get('name')??'').trim();if(name.length<2)return{ok:false,error:'اكتبي اسمًا واضحًا للقسم.'};const payload={page_id:pageId,name,kind,sort:Math.max(0,Number(formData.get('sort')??0)),is_visible:formData.get('is_visible')==='on',content};const service=getServiceClient();if(sectionId){const{data:previous}=await service.from('page_sections').select('*').eq('id',sectionId).maybeSingle();if(previous)await service.from('content_revisions').insert({entity_type:'page_section',entity_id:sectionId,snapshot:previous,created_by:admin.user.id})}const result=sectionId?await service.from('page_sections').update({...payload,revision:(await service.from('page_sections').select('revision').eq('id',sectionId).single()).data?.revision+1||2}).eq('id',sectionId):await service.from('page_sections').insert(payload);if(result.error)return{ok:false,error:GENERIC};await audit(admin.user.id,sectionId?'page_section.updated':'page_section.created','page',pageId,{sectionId,kind:payload.kind});revalidatePath('/admin/pages');return{ok:true}}
export async function deletePageSection(sectionId:string):Promise<ActionResult>{const admin=await requireAdminUser('content.delete');if(!admin)return{ok:false,error:NOT_ADMIN};const service=getServiceClient(),{data:row}=await service.from('page_sections').select('*').eq('id',sectionId).maybeSingle();if(!row)return{ok:false,error:'القسم غير موجود.'};await service.from('content_revisions').insert({entity_type:'page_section',entity_id:sectionId,snapshot:row,created_by:admin.user.id});const{error}=await service.from('page_sections').delete().eq('id',sectionId);if(error)return{ok:false,error:GENERIC};await audit(admin.user.id,'page_section.deleted','page_section',sectionId);revalidatePath('/admin/pages');return{ok:true}}
export async function saveNavigationItem(id:string|null,formData:FormData):Promise<ActionResult>{const admin=await requireAdminUser('settings.manage');if(!admin)return{ok:false,error:NOT_ADMIN};const menu=String(formData.get('menu')??'header'),label=String(formData.get('label')??'').trim(),href=String(formData.get('href')??'').trim();if(!['header','footer_platform','footer_about','footer_legal'].includes(menu)||label.length<2||!href.startsWith('/'))return{ok:false,error:'راجعي القائمة والعنوان والرابط الداخلي.'};const payload={menu,label,href,sort:Math.max(0,Number(formData.get('sort')??0)),is_visible:formData.get('is_visible')==='on'};const service=getServiceClient(),result=id?await service.from('navigation_items').update(payload).eq('id',id):await service.from('navigation_items').insert(payload);if(result.error)return{ok:false,error:GENERIC};await audit(admin.user.id,id?'navigation.updated':'navigation.created','navigation_item',id??href,payload);revalidatePath('/admin/pages');revalidatePath('/');return{ok:true}}
export async function deleteNavigationItem(id:string):Promise<ActionResult>{const admin=await requireAdminUser('settings.manage');if(!admin)return{ok:false,error:NOT_ADMIN};const{error}=await getServiceClient().from('navigation_items').delete().eq('id',id);if(error)return{ok:false,error:GENERIC};await audit(admin.user.id,'navigation.deleted','navigation_item',id);revalidatePath('/admin/pages');revalidatePath('/');return{ok:true}}
export async function saveOwnerProfile(formData:FormData):Promise<ActionResult>{const admin=await requireAdminUser('content.manage');if(!admin)return{ok:false,error:NOT_ADMIN};const values=[0,1,2].map(index=>({title:String(formData.get(`value_title_${index}`)??'').trim(),text:String(formData.get(`value_text_${index}`)??'').trim()})).filter(value=>value.title&&value.text);const value={eyebrow:String(formData.get('eyebrow')??'').trim(),title:String(formData.get('title')??'').trim(),lead:String(formData.get('lead')??'').trim(),method:String(formData.get('method')??'').trim(),values};if(value.title.length<3||value.lead.length<10)return{ok:false,error:'اكتبي تعريفًا واضحًا قبل الحفظ.'};const service=getServiceClient(),{data:previous}=await service.from('site_settings').select('value').eq('key','owner_profile').maybeSingle();if(previous)await service.from('content_revisions').insert({entity_type:'owner_profile',entity_id:'00000000-0000-0000-0000-000000000001',snapshot:previous.value,created_by:admin.user.id});const{error}=await service.from('site_settings').upsert({key:'owner_profile',value,is_public:true,updated_by:admin.user.id},{onConflict:'key'});if(error)return{ok:false,error:GENERIC};await audit(admin.user.id,'owner_profile.updated','site_settings','owner_profile');revalidatePath('/about');revalidatePath('/admin/settings');return{ok:true}}

export async function saveStartHereExperience(formData: FormData): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser('content.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }

  let invalid = false
  const required = (name: string, min: number, max: number) => {
    const value = String(formData.get(name) ?? '').trim()
    if (value.length < min || value.length > max) invalid = true
    return value
  }
  const internalHref = (name: string) => {
    const value = String(formData.get(name) ?? '').trim()
    if (!value.startsWith('/') || value.startsWith('//') || value.length > 180) invalid = true
    return value
  }

  const raw = {
    hero: { eyebrow: required('hero_eyebrow', 2, 80), title: required('hero_title', 3, 120), lead: required('hero_lead', 12, 300) },
    paths: [0, 1, 2, 3].map((index) => ({ title: required(`path_${index}_title`, 4, 140), text: required(`path_${index}_text`, 12, 300), href: internalHref(`path_${index}_href`), cta: required(`path_${index}_cta`, 2, 70) })),
    closing: { title: required('closing_title', 3, 120), lead: required('closing_lead', 12, 260), ctaLabel: required('closing_cta_label', 2, 70), ctaHref: internalHref('closing_cta_href') },
  }
  if (invalid) return { ok: false, error: 'راجعي جميع نصوص رحلة البداية وروابطها الداخلية.' }

  const value = normalizeStartHereContent(raw)
  const service = getServiceClient()
  const { data: previous, error: readError } = await service.from('site_settings').select('key,value,is_public,updated_by').eq('key', 'start_here_experience').maybeSingle()
  if (readError) return { ok: false, error: GENERIC }
  if (previous) {
    const { error } = await service.from('content_revisions').insert({ entity_type: 'start_here_experience', entity_id: '00000000-0000-0000-0000-000000000002', snapshot: previous.value, created_by: admin.user.id })
    if (error) return { ok: false, error: 'تعذّر حفظ نسخة المراجعة؛ لم تتغير الصفحة.' }
  }
  const { error } = await service.from('site_settings').upsert({ key: 'start_here_experience', value, is_public: true, updated_by: admin.user.id }, { onConflict: 'key' })
  if (error) return { ok: false, error: GENERIC }
  const { error: auditError } = await service.from('audit_logs').insert({ actor_id: admin.user.id, action: 'start_here_experience.updated', entity_type: 'site_settings', entity_id: 'start_here_experience', meta: { paths: 4, assessmentManagedSeparately: true } })
  if (auditError) {
    if (previous) await service.from('site_settings').upsert(previous, { onConflict: 'key' })
    else await service.from('site_settings').delete().eq('key', 'start_here_experience')
    return { ok: false, error: 'تعذّر تسجيل التدقيق؛ أُعيدت الصفحة إلى حالتها السابقة.' }
  }
  revalidatePath('/start-here')
  revalidatePath('/admin/settings')
  return { ok: true }
}
export async function createContentPreview(entityType:'page'|'article',entityId:string):Promise<{ok:true;url:string}|{ok:false;error:string}>{const admin=await requireAdminUser('content.manage');if(!admin)return{ok:false,error:NOT_ADMIN};const token=`${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll('-',''),tokenHash=createHash('sha256').update(token).digest('hex'),expiresAt=new Date(Date.now()+30*60_000).toISOString();const{error}=await getServiceClient().from('content_preview_tokens').insert({entity_type:entityType,entity_id:entityId,token_hash:tokenHash,expires_at:expiresAt,created_by:admin.user.id});if(error)return{ok:false,error:GENERIC};return{ok:true,url:`/preview/${entityType}/${entityId}?token=${token}`}}
export async function scheduleArticle(articleId:string,status:string,publishAt:string|null):Promise<ActionResult>{const admin=await requireAdminUser('content.publish');if(!admin)return{ok:false,error:NOT_ADMIN};if(!['draft','scheduled','published','archived'].includes(status)||status==='scheduled'&&!publishAt)return{ok:false,error:'حددي حالة وموعد نشر صحيحًا.'};const service=getServiceClient(),{data:previous}=await service.from('articles').select('*').eq('id',articleId).maybeSingle();if(!previous)return{ok:false,error:'المقال غير موجود.'};await service.from('content_revisions').insert({entity_type:'article',entity_id:articleId,snapshot:previous,created_by:admin.user.id});const{error}=await service.from('articles').update({status,publish_at:publishAt,is_published:status==='published',published_at:status==='published'?new Date().toISOString():previous.published_at}).eq('id',articleId);if(error)return{ok:false,error:GENERIC};await audit(admin.user.id,'article.scheduled','article',articleId,{status,publishAt});revalidatePath('/admin/articles');revalidatePath('/articles');return{ok:true}}
