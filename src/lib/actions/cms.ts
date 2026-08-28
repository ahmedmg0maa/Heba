'use server'

import { revalidatePath } from 'next/cache'
import { createHash } from 'node:crypto'
import { getServiceClient, hasSupabaseServerSecret } from '@/lib/supabase/server'
import { FRESH_ADMIN_ASSURANCE_ERROR, PERMISSIONS, requireFreshAdminAssurance, requirePermission, type Permission } from '@/lib/auth/permissions'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'
import { defaultHomeContent, HOME_SECTION_KINDS, isHomeSectionKind, normalizeHomeContent, type HomeSectionKind } from '@/lib/home/sections'
import { normalizeStartHereContent } from '@/lib/start-here/content'
import { catalogPublicationReadiness, type CatalogPublicationKind } from '@/lib/catalog/publication-readiness'
import { parseCairoLocalDateTime } from '@/lib/booking/cairo-time'

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
    if (['bundle','vip','free_resource'].includes(product.type)) return { ok: false, error: 'استخدمي فحص ونشر البرامج المخصص؛ النشر العام لا يتجاوز عقد التكوين والاستحقاق.' }
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
  if (title.length < 3 || title.length > 160) return { ok: false, error: 'أدخلي عنوانًا بين 3 و160 حرفًا.' }
  if (slug.length < 3 || slug.length > 80 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { ok: false, error: 'الرابط: أحرف لاتينية صغيرة وأرقام وشرطات.' }
  if (excerpt.length > 500 || content.length > 100000) return { ok: false, error: 'المقتطف أو المحتوى أطول من الحد المسموح.' }
  const { data, error } = await getServiceClient().rpc('manage_article', {
    p_actor_id: admin.user.id,p_action:'create',p_article_id:null,p_title:title,p_slug:slug,
    p_excerpt:excerpt,p_content:content,p_cover_url:null,p_cover_asset_id:null,
    p_seo_title:null,p_seo_description:null,p_status:null,p_publish_at:null,
  })
  if (error) return { ok: false, error: error.code === '23505' ? 'هذا الرابط مستخدم.' : GENERIC }
  if (!data?.id) return { ok: false, error: GENERIC }
  revalidatePath('/admin/articles')
  return { ok: true }
}

export async function publishArticle(articleId: string, publish: boolean): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser('content.publish')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const { data, error } = await getServiceClient().rpc('manage_article', {
    p_actor_id:admin.user.id,p_action:'lifecycle',p_article_id:articleId,p_title:null,p_slug:null,
    p_excerpt:null,p_content:null,p_cover_url:null,p_cover_asset_id:null,p_seo_title:null,
    p_seo_description:null,p_status:publish?'published':'draft',p_publish_at:null,
  })
  if (error || !data?.id) return { ok: false, error: error?.message.includes('article_publication_incomplete') ? 'أكملي المقتطف والمحتوى وحقوق صورة الغلاف قبل النشر.' : GENERIC }
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
  const serialized=JSON.stringify(value)
  if(serialized.length>32768||/(secret|token|password|api[_-]?key|service[_-]?role|private[_-]?key)/i.test(key)||/"[^"]*(secret|token|password|api[_-]?key|service[_-]?role|private[_-]?key)[^"]*"\s*:/i.test(serialized))return{ok:false,error:'لا تحفظي أسرارًا أو قيمة أكبر من 32 كيلوبايت داخل إعدادات المحتوى.'}
  const {data,error}=await getServiceClient().rpc('manage_advanced_setting',{p_actor_id:admin.user.id,p_key:key,p_value:value})
  if(error||!data?.updated)return{ok:false,error:error?.message.includes('advanced_setting_not_found')?'يمكن تعديل المفاتيح الموجودة فقط.':GENERIC}
  revalidatePath('/admin/settings')
  return { ok: true }
}

export async function toggleFlag(key: string, enabled: boolean): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser('feature_flags.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const {data,error}=await getServiceClient().rpc('manage_feature_flag',{p_actor_id:admin.user.id,p_key:key,p_enabled:enabled})
  if(error||data?.enabled!==enabled)return{ok:false,error:GENERIC}
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
  if (profile.id === admin.user.id) return { ok: false, error: 'لا يمكن تعديل أدوارك من جلستك الحالية. استخدمي مالكة أخرى مخولة.' }

  const { error } = await service.rpc('manage_admin_role', {
    p_actor_id: admin.user.id,
    p_action: 'grant',
    p_target_user_id: profile.id,
    p_role: role,
    p_role_id: null,
  })
  if (error) return { ok: false, error: GENERIC }
  revalidatePath('/admin/roles')
  return { ok: true }
}

export async function revokeRole(roleId: string): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const context = await requireFreshAdminAssurance('roles.manage')
  const admin = context?.userId ? { user: { id: context.userId }, role: context.role } : null
  if (!admin) return { ok: false, error: FRESH_ADMIN_ASSURANCE_ERROR }
  if (admin.role !== 'owner') return { ok: false, error: 'إدارة الأدوار متاحة للمالكة فقط.' }
  const { error } = await getServiceClient().rpc('manage_admin_role', {
    p_actor_id: admin.user.id,
    p_action: 'revoke',
    p_target_user_id: null,
    p_role: null,
    p_role_id: roleId,
  })
  if (error) return { ok: false, error: GENERIC }
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
  if (allowed.includes('roles.manage')) return { ok: false, error: 'صلاحية إدارة الأدوار حصرية للمالكة ولا تُمنح لدور آخر.' }
  const { error } = await getServiceClient().rpc('set_admin_role_permissions', {
    p_actor_id: admin.user.id,
    p_role: role,
    p_permissions: allowed,
  })
  if (error) return { ok: false, error: GENERIC }
  revalidatePath('/admin/roles')
  return { ok: true }
}

export async function addModule(courseId: string, title: string): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser('learning.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const normalizedTitle = title.trim()
  if (normalizedTitle.length < 2 || normalizedTitle.length > 160) return { ok: false, error: 'عنوان الوحدة يجب أن يكون بين حرفين و160 حرفًا.' }
  const { error } = await getServiceClient().rpc('manage_course_curriculum', {
    p_actor_id: admin.user.id, p_action: 'module_create', p_course_id: courseId,
    p_module_id: null, p_lesson_id: null, p_title: normalizedTitle,
    p_sort: null, p_duration_seconds: null, p_is_preview: false,
  })
  if (error) return { ok: false, error: GENERIC }
  revalidatePath(`/admin/courses/${courseId}/curriculum`)
  return { ok: true }
}

export async function updateCourseModule(moduleId:string,courseId:string,title:string,sort:number):Promise<ActionResult>{const admin=await requireAdminUser('learning.manage');if(!admin)return{ok:false,error:NOT_ADMIN};const normalized=title.trim(),order=Math.round(sort);if(normalized.length<2||normalized.length>160||!Number.isInteger(order)||order<1||order>10000)return{ok:false,error:'راجعي عنوان الوحدة وترتيبها.'};const{error}=await getServiceClient().rpc('manage_course_curriculum',{p_actor_id:admin.user.id,p_action:'module_update',p_course_id:courseId,p_module_id:moduleId,p_lesson_id:null,p_title:normalized,p_sort:order,p_duration_seconds:null,p_is_preview:false});if(error)return{ok:false,error:GENERIC};revalidatePath(`/admin/courses/${courseId}/curriculum`);return{ok:true}}
export async function deleteCourseModule(moduleId:string,courseId:string):Promise<ActionResult>{const admin=await requireAdminUser('learning.manage');if(!admin)return{ok:false,error:NOT_ADMIN};const{error}=await getServiceClient().rpc('manage_course_curriculum',{p_actor_id:admin.user.id,p_action:'module_delete',p_course_id:courseId,p_module_id:moduleId,p_lesson_id:null,p_title:null,p_sort:null,p_duration_seconds:null,p_is_preview:false});if(error)return{ok:false,error:error.message.includes('module_has_lessons')?'احذفي الدروس الخالية من الملفات والسجل أولًا.':GENERIC};revalidatePath(`/admin/courses/${courseId}/curriculum`);return{ok:true}}
export async function updateCourseLesson(lessonId:string,courseId:string,form:FormData):Promise<ActionResult>{const admin=await requireAdminUser('learning.manage');if(!admin)return{ok:false,error:NOT_ADMIN};const title=String(form.get('title')??'').trim(),minutes=Number(form.get('minutes')??0),sort=Math.round(Number(form.get('sort')??0)),seconds=Math.round(minutes*60);if(title.length<2||title.length>180||!Number.isFinite(minutes)||seconds<0||seconds>86400||!Number.isInteger(sort)||sort<1||sort>10000)return{ok:false,error:'راجعي بيانات الدرس.'};const{error}=await getServiceClient().rpc('manage_course_curriculum',{p_actor_id:admin.user.id,p_action:'lesson_update',p_course_id:courseId,p_module_id:null,p_lesson_id:lessonId,p_title:title,p_sort:sort,p_duration_seconds:seconds,p_is_preview:form.get('is_preview')==='on'});if(error)return{ok:false,error:GENERIC};revalidatePath(`/admin/courses/${courseId}/curriculum`);return{ok:true}}
export async function deleteCourseLesson(lessonId:string,courseId:string):Promise<ActionResult>{const admin=await requireAdminUser('learning.manage');if(!admin)return{ok:false,error:NOT_ADMIN};const{error}=await getServiceClient().rpc('manage_course_curriculum',{p_actor_id:admin.user.id,p_action:'lesson_delete',p_course_id:courseId,p_module_id:null,p_lesson_id:lessonId,p_title:null,p_sort:null,p_duration_seconds:null,p_is_preview:false});if(error)return{ok:false,error:error.message.includes('lesson_has_delivery_or_customer_history')?'لا يمكن حذف درس مرتبط بملفات محمية أو سجل عميلة. أزيلي ملفات التسليم أولًا، واحتفظي بالدروس ذات التقدم أو الملاحظات.':GENERIC};revalidatePath(`/admin/courses/${courseId}/curriculum`);return{ok:true}}

export async function addLesson(moduleId: string, courseId: string, formData: FormData): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireAdminUser('learning.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const title = String(formData.get('title') ?? '').trim()
  const minutes = Number(formData.get('minutes') ?? 0)
  const isPreview = formData.get('is_preview') === 'on'
  const seconds = Math.round(minutes * 60)
  if (title.length < 2 || title.length > 180 || !Number.isFinite(minutes) || seconds < 0 || seconds > 86400) return { ok: false, error: 'راجعي عنوان الدرس ومدته.' }

  const { error } = await getServiceClient().rpc('manage_course_curriculum', {
    p_actor_id: admin.user.id, p_action: 'lesson_create', p_course_id: courseId,
    p_module_id: moduleId, p_lesson_id: null, p_title: title,
    p_sort: null, p_duration_seconds: seconds, p_is_preview: isPreview,
  })
  if (error) return { ok: false, error: GENERIC }
  revalidatePath(`/admin/courses/${courseId}/curriculum`)
  return { ok: true }
}

export async function updatePageSeo(pageId: string, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdminUser('content.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const seoTitle = String(formData.get('seo_title') ?? '').trim()
  const seoDescription = String(formData.get('seo_description') ?? '').trim()
  if (seoTitle.length > 70 || seoDescription.length > 180 || /[\u0000-\u001f\u007f]/.test(`${seoTitle}${seoDescription}`)) {
    return { ok: false, error: 'عنوان SEO بحد أقصى 70 حرفًا والوصف 180 حرفًا.' }
  }
  const { data, error } = await getServiceClient().rpc('manage_cms_page', {
    p_actor_id: admin.user.id, p_action: 'seo_update', p_page_id: pageId,
    p_title: null, p_slug: null, p_seo_title: seoTitle || null,
    p_seo_description: seoDescription || null, p_canonical_url: null,
    p_og_image_url: null, p_status: null, p_publish_at: null,
    p_legal_review_status: null, p_legal_version: null, p_effective_at: null,
  })
  if (error || !data?.id) return { ok: false, error: GENERIC }
  revalidatePath('/admin/pages')
  if (typeof data.pageSlug === 'string') revalidatePath(`/${data.pageSlug}`)
  return { ok: true }
}

export async function createCmsPage(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdminUser('content.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const title = String(formData.get('title') ?? '').trim()
  const slug = String(formData.get('slug') ?? '').trim().toLowerCase()
  if (title.length < 3) return { ok: false, error: 'اكتبي عنوانًا واضحًا للصفحة.' }
  if (slug.length < 3 || slug.length > 80 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { ok: false, error: 'الرابط يتكوّن من أحرف لاتينية صغيرة وأرقام وشرطات.' }
  const { data, error } = await getServiceClient().rpc('manage_cms_page', {
    p_actor_id: admin.user.id, p_action: 'create', p_page_id: null,
    p_title: title, p_slug: slug, p_seo_title: null, p_seo_description: null,
    p_canonical_url: null, p_og_image_url: null, p_status: null, p_publish_at: null,
    p_legal_review_status: null, p_legal_version: null, p_effective_at: null,
  })
  if (error || !data) return { ok: false, error: error?.code === '23505' ? 'هذا الرابط مستخدم بالفعل.' : GENERIC }
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
  if (kind === 'newsletter') {
    const content = { eyebrow: required('eyebrow', 2, 80), heading: required('heading', 3, 120), body: required('body', 8, 320) }
    return Object.values(content).some((value) => !value) ? { ok: false, error: 'أكملي نصوص قسم النشرة.' } : { ok: true, content }
  }
  const content = { eyebrow: required('eyebrow', 2, 80), heading: required('heading', 3, 120), body: required('body', 8, 320), primaryLabel: required('primary_label', 2, 60), primaryHref: homeHref(formData, 'primary_href'), secondaryLabel: required('secondary_label', 2, 60), secondaryHref: homeHref(formData, 'secondary_href') }
  if (Object.values(content).some((value) => !value)) return { ok: false, error: 'أكملي محتوى القسم وروابطه الداخلية.' }
  return { ok: true, content }
}

export async function createHomeSection(pageId: string, kindValue: string): Promise<ActionResult> {
  const admin = await requireAdminUser('content.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  if (!isHomeSectionKind(kindValue)) return { ok: false, error: 'نوع قسم الصفحة الرئيسية غير معتمد.' }
  const option = HOME_SECTION_KINDS.indexOf(kindValue)
  const { error } = await getServiceClient().rpc('manage_cms_page_section', {
    p_actor_id: admin.user.id, p_action: 'home_create', p_page_id: pageId,
    p_section_id: null, p_name: kindValue, p_kind: kindValue,
    p_sort: Math.max(0, option * 10), p_is_visible: true,
    p_content: defaultHomeContent(kindValue),
  })
  if (error) return { ok: false, error: error.message.includes('home_section_kind_exists') ? 'هذا النوع موجود بالفعل؛ عدّليه بدل إنشاء نسخة مكررة.' : GENERIC }
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
  const { error } = await getServiceClient().rpc('manage_cms_page_section', {
    p_actor_id: admin.user.id, p_action: 'home_update', p_page_id: pageId,
    p_section_id: sectionId, p_name: name, p_kind: kindValue, p_sort: sort,
    p_is_visible: formData.get('is_visible') === 'on',
    p_content: normalizeHomeContent(kindValue, parsed.content),
  })
  if (error) return { ok: false, error: error.message.includes('published_home_required_section') ? 'لا يمكن إخفاء قسم أساسي والصفحة الرئيسية منشورة.' : GENERIC }
  revalidatePath('/admin/pages'); revalidatePath('/'); return { ok: true }
}

export async function saveCmsPage(pageId: string, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdminUser('content.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const status = String(formData.get('status') ?? 'draft')
  const publishAtInput = String(formData.get('publish_at') ?? '').trim()
  const publishAtDate = status === 'scheduled' ? parseCairoLocalDateTime(publishAtInput) : null
  const publishAt = publishAtDate?.toISOString() ?? null
  const legalReviewStatus = String(formData.get('legal_review_status') ?? 'not_applicable')
  const legalVersion = String(formData.get('legal_version') ?? '').trim() || null
  const effectiveAt = String(formData.get('effective_at') ?? '').trim() || null
  const title = String(formData.get('title') ?? '').trim()
  const seoTitle = String(formData.get('seo_title') ?? '').trim()
  const seoDescription = String(formData.get('seo_description') ?? '').trim()
  const canonicalUrl = String(formData.get('canonical_url') ?? '').trim()
  const ogImageUrl = String(formData.get('og_image_url') ?? '').trim()
  if (!['draft','scheduled','published','archived'].includes(status)
      || (status === 'scheduled' && (!publishAtDate || publishAtDate <= new Date()))) return { ok: false, error: 'حددي حالة نشر وموعدًا مستقبليًا صحيحًا بتوقيت القاهرة.' }
  if (title.length < 3 || title.length > 160 || /[\u0000-\u001f\u007f]/.test(title)
      || seoTitle.length > 70 || seoDescription.length > 180
      || canonicalUrl.length > 500 || (canonicalUrl && (!/^https:\/\/[^\s]+$/i.test(canonicalUrl)))
      || ogImageUrl.length > 500 || (ogImageUrl && (!/^https:\/\/[^\s]+$/i.test(ogImageUrl)))) {
    return { ok: false, error: 'راجعي العنوان وحقول SEO وروابط HTTPS.' }
  }
  if (!['not_applicable','draft','pending','approved'].includes(legalReviewStatus)) return { ok: false, error: 'حالة المراجعة القانونية غير صحيحة.' }
  if (legalVersion && (legalVersion.length > 40 || /[\u0000-\u001f\u007f]/.test(legalVersion))) return { ok: false, error: 'إصدار السياسة أطول من المسموح.' }
  const { data, error } = await getServiceClient().rpc('manage_cms_page', {
    p_actor_id: admin.user.id, p_action: 'update', p_page_id: pageId,
    p_title: title, p_slug: null, p_seo_title: seoTitle || null,
    p_seo_description: seoDescription || null, p_canonical_url: canonicalUrl || null,
    p_og_image_url: ogImageUrl || null, p_status: status, p_publish_at: publishAt,
    p_legal_review_status: legalReviewStatus, p_legal_version: legalVersion,
    p_effective_at: effectiveAt,
  })
  if (error || !data?.id) {
    if (error?.message.includes('content_publish_required')) return { ok: false, error: 'تعديل صفحة منشورة أو مجدولة يتطلب صلاحية النشر.' }
    if (error?.message.includes('legal_page_approval_required')) return { ok: false, error: 'لا يمكن نشر أو جدولة صفحة قانونية قبل اعتمادها وتحديد الإصدار وتاريخ السريان.' }
    if (error?.message.includes('home_page_required_sections')) return { ok: false, error: 'لا يمكن نشر أو جدولة الصفحة الرئيسية قبل وجود Hero والمسارات والدعوة الختامية كأقسام ظاهرة.' }
    return { ok: false, error: GENERIC }
  }
  revalidatePath('/admin/pages'); revalidatePath('/')
  if (typeof data.pageSlug === 'string') revalidatePath(`/${data.pageSlug}`)
  return { ok: true }
}
export async function savePageSection(pageId: string, sectionId: string | null, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdminUser('content.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  let content: unknown
  try { content = JSON.parse(String(formData.get('content') ?? '{}')) }
  catch { return { ok: false, error: 'محتوى القسم يجب أن يكون JSON صحيحًا.' } }
  const kind = String(formData.get('kind') ?? 'rich_text').trim()
  if (!SECTION_KINDS.includes(kind as typeof SECTION_KINDS[number])) return { ok: false, error: 'نوع القسم غير معتمد في نظام التصميم.' }
  const contentError = validateSectionContent(content)
  if (contentError) return { ok: false, error: contentError }
  const name = String(formData.get('name') ?? '').trim()
  const sort = Number(formData.get('sort') ?? 0)
  if (name.length < 2 || name.length > 100 || !Number.isInteger(sort) || sort < 0 || sort > 1000) return { ok: false, error: 'راجعي اسم القسم وترتيبه.' }
  const { data, error } = await getServiceClient().rpc('manage_cms_page_section', {
    p_actor_id: admin.user.id, p_action: sectionId ? 'section_update' : 'section_create',
    p_page_id: pageId, p_section_id: sectionId, p_name: name, p_kind: kind,
    p_sort: sort, p_is_visible: formData.get('is_visible') === 'on', p_content: content,
  })
  if (error || !data?.id) return { ok: false, error: GENERIC }
  revalidatePath('/admin/pages')
  if (typeof data.pageSlug === 'string') revalidatePath(`/${data.pageSlug}`)
  return { ok: true }
}

export async function deletePageSection(pageId: string, sectionId: string): Promise<ActionResult> {
  const admin = await requireAdminUser('content.delete')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const { data, error } = await getServiceClient().rpc('manage_cms_page_section', {
    p_actor_id: admin.user.id, p_action: 'section_delete', p_page_id: pageId,
    p_section_id: sectionId, p_name: null, p_kind: null, p_sort: null,
    p_is_visible: false, p_content: null,
  })
  if (error || !data?.id) return { ok: false, error: error?.message.includes('published_home_required_section') ? 'لا يمكن حذف قسم أساسي والصفحة الرئيسية منشورة.' : GENERIC }
  revalidatePath('/admin/pages')
  if (typeof data.pageSlug === 'string') revalidatePath(`/${data.pageSlug}`)
  return { ok: true }
}
export async function saveNavigationItem(id: string | null, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdminUser('settings.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const menu = String(formData.get('menu') ?? 'header')
  const label = String(formData.get('label') ?? '').trim()
  const href = String(formData.get('href') ?? '').trim()
  const sort = Number(formData.get('sort') ?? 0)
  if (!['header','footer_platform','footer_about','footer_legal'].includes(menu)
      || label.length < 2 || label.length > 80 || /[\u0000-\u001f\u007f]/.test(label)
      || href.length < 1 || href.length > 180 || !href.startsWith('/') || href.startsWith('//') || /[\s\\]/.test(href)
      || !Number.isInteger(sort) || sort < 0 || sort > 1000) {
    return { ok: false, error: 'راجعي القائمة والعنوان والرابط الداخلي والترتيب.' }
  }
  const { data, error } = await getServiceClient().rpc('manage_navigation_item', {
    p_actor_id: admin.user.id, p_action: id ? 'update' : 'create', p_item_id: id,
    p_menu: menu, p_label: label, p_href: href, p_sort: sort,
    p_is_visible: formData.get('is_visible') === 'on',
  })
  if (error || !data?.id) return { ok: false, error: error?.message.includes('navigation_parent_menu_mismatch') ? 'لا يمكن نقل عنصر فرعي إلى قائمة مختلفة عن العنصر الأب.' : GENERIC }
  revalidatePath('/admin/pages')
  revalidatePath('/')
  return { ok: true }
}

export async function deleteNavigationItem(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser('settings.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const { data, error } = await getServiceClient().rpc('manage_navigation_item', {
    p_actor_id: admin.user.id, p_action: 'delete', p_item_id: id,
    p_menu: null, p_label: null, p_href: null, p_sort: null, p_is_visible: false,
  })
  if (error || !data?.id) return { ok: false, error: error?.message.includes('navigation_item_has_children') ? 'احذفي العناصر الفرعية أولًا حتى لا تختفي روابط غير مقصودة.' : GENERIC }
  revalidatePath('/admin/pages')
  revalidatePath('/')
  return { ok: true }
}
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
export async function scheduleArticle(articleId:string,status:string,publishAtInput:string|null):Promise<ActionResult>{const admin=await requireAdminUser('content.publish');if(!admin)return{ok:false,error:NOT_ADMIN};const instant=status==='scheduled'&&publishAtInput?parseCairoLocalDateTime(publishAtInput):null;if(!['draft','scheduled','published','archived'].includes(status)||(status==='scheduled'&&(!instant||instant<=new Date())))return{ok:false,error:'حددي حالة وموعدًا مستقبليًا صحيحًا بتوقيت القاهرة.'};const{data,error}=await getServiceClient().rpc('manage_article',{p_actor_id:admin.user.id,p_action:'lifecycle',p_article_id:articleId,p_title:null,p_slug:null,p_excerpt:null,p_content:null,p_cover_url:null,p_cover_asset_id:null,p_seo_title:null,p_seo_description:null,p_status:status,p_publish_at:instant?.toISOString()??null});if(error||!data?.id)return{ok:false,error:error?.message.includes('article_publication_incomplete')?'أكملي المقتطف والمحتوى وحقوق صورة الغلاف قبل النشر أو الجدولة.':GENERIC};revalidatePath('/admin/articles');revalidatePath('/articles');return{ok:true}}
