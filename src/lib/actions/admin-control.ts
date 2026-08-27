'use server'

import { revalidatePath } from 'next/cache'
import { getServiceClient, hasSupabaseServerSecret } from '@/lib/supabase/server'
import { FRESH_ADMIN_ASSURANCE_ERROR, requireFreshAdminAssurance, requirePermission, type Permission } from '@/lib/auth/permissions'
import { catalogPublicationReadiness } from '@/lib/catalog/publication-readiness'

export type AdminActionResult = { ok: true; id?: string } | { ok: false; error: string }
type CatalogKind = 'course' | 'book' | 'workshop' | 'service'

const paths: Record<CatalogKind, string> = {
  course: '/admin/courses',
  book: '/admin/books',
  workshop: '/admin/workshops',
  service: '/admin/bookings',
}

async function requireAdminUser(permission: Permission) {
  if (!hasSupabaseServerSecret()) return null
  const context = await requirePermission(permission)
  return context?.userId ? { id: context.userId, role: context.role } : null
}

function message(error: { code?: string; message?: string } | null) {
  if (error?.code === '23505') return 'هذا الرابط أو السجل مستخدم بالفعل.'
  if (error?.code === '23503') return 'لا يمكن الحذف لأن السجل مرتبط بطلبات أو بيانات مستخدمات.'
  if (error?.code === '23P01') return 'الموعد يتعارض مع حجز قائم.'
  return error?.message ? `تعذّر الحفظ: ${error.message}` : 'تعذّر إتمام العملية الآن.'
}

async function audit(actorId: string, action: string, entityType: string, entityId: string, meta: object = {}) {
  await getServiceClient().from('audit_logs').insert({ actor_id: actorId, action, entity_type: entityType, entity_id: entityId, meta })
}

async function revision(actorId: string, entityType: string, entityId: string, snapshot: unknown) {
  if (!snapshot) return
  await getServiceClient().from('content_revisions').insert({
    entity_type: entityType,
    entity_id: entityId,
    snapshot,
    created_by: actorId,
  })
}

async function syncMediaUsage(actorId: string, assetId: string, entityType: string, entityId: string, field: string) {
  const service = getServiceClient()
  await service.from('media_usages').delete().eq('entity_type', entityType).eq('entity_id', entityId).eq('field', field)
  if (!assetId) return
  const { data: asset } = await service.from('media_assets').select('id, bucket, visibility, archived_at').eq('id', assetId).maybeSingle()
  if (!asset || asset.archived_at || asset.bucket !== 'public-media' || asset.visibility !== 'public') return
  await service.from('media_usages').insert({ asset_id: asset.id, entity_type: entityType, entity_id: entityId, field, created_by: actorId })
}

const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim()
const number = (form: FormData, key: string, fallback = 0) => {
  const value = Number(form.get(key))
  return Number.isFinite(value) ? value : fallback
}
const optionalNumber = (form: FormData, key: string) => {
  const raw = text(form, key)
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}
const optionalDate = (form: FormData, key: string) => {
  const raw = text(form, key)
  if (!raw) return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export async function saveCatalogItem(kind: CatalogKind, id: string | null, form: FormData): Promise<AdminActionResult> {
  const admin = await requireAdminUser('catalog.manage')
  if (!admin) return { ok: false, error: 'هذه العملية تتطلب صلاحية إدارية.' }

  const title = text(form, 'title')
  const slug = text(form, 'slug').toLowerCase()
  const description = text(form, 'description')
  const price = number(form, 'price')
  const isPublished = form.get('is_published') === 'on'
  if (title.length < 2) return { ok: false, error: 'اكتبي عنوانًا واضحًا.' }
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) return { ok: false, error: 'الرابط يجب أن يكون أحرفًا لاتينية صغيرة وأرقامًا وشرطات.' }
  if (price < 0) return { ok: false, error: 'السعر لا يمكن أن يكون سالبًا.' }

  const service = getServiceClient()
  const domainTable = kind === 'course' ? 'courses' : kind === 'book' ? 'books' : kind === 'workshop' ? 'workshops' : 'services'
  let productId: string | null = null
  let previousDomain: Record<string, unknown> | null = null
  let previousProduct: Record<string, unknown> | null = null

  if (id) {
    const { data: domain } = await service.from(domainTable).select('*').eq('id', id).maybeSingle()
    if (!domain) return { ok: false, error: 'السجل المطلوب غير موجود.' }
    previousDomain = domain
    productId = String(domain.product_id)
    const { data: product } = await service.from('products').select('*').eq('id', productId).maybeSingle()
    previousProduct = product
    await revision(admin.id, kind, id, { domain, product })
  }

  if (isPublished) {
    const readiness = await catalogPublicationReadiness(kind, id, {
      title,
      slug,
      subtitle: text(form, 'subtitle'),
      description,
      price,
      currency: text(form, 'currency') || 'EGP',
      coverAssetId: text(form, 'cover_asset_id'),
      durationMinutes: number(form, 'duration_minutes'),
      pagesCount: optionalNumber(form, 'pages_count'),
      startsAt: optionalDate(form, 'starts_at'),
      endsAt: optionalDate(form, 'ends_at'),
      seatsTotal: number(form, 'seats_total'),
      locationKind: text(form, 'location_kind'),
      locationText: text(form, 'location_text'),
      bookingPaymentMode: text(form, 'booking_payment_mode'),
    })
    if (!readiness.ready) return { ok: false, error: `لا يمكن النشر: ${readiness.issues.join(' ')}` }
  }

  const productPayload = {
    type: kind === 'service' ? 'session' : kind,
    title,
    slug,
    subtitle: text(form, 'subtitle') || null,
    description,
    price,
    compare_at_price: optionalNumber(form, 'compare_at_price'),
    currency: (text(form, 'currency') || 'EGP').toUpperCase(),
    cover_url: text(form, 'cover_url') || null,
    is_published: isPublished,
    sort: number(form, 'sort'),
  }

  if (productId) {
    const { error } = await service.from('products').update(productPayload).eq('id', productId)
    if (error) return { ok: false, error: message(error) }
  } else {
    const { data, error } = await service.from('products').insert(productPayload).select('id').single()
    if (error || !data) return { ok: false, error: message(error) }
    productId = data.id
  }

  let domainPayload: Record<string, unknown>
  if (kind === 'course') {
    domainPayload = {
      product_id: productId, slug, title, description,
      level: text(form, 'level') || 'all',
      duration_minutes: number(form, 'duration_minutes'),
      cover_url: text(form, 'cover_url') || null,
      is_published: isPublished,
    }
  } else if (kind === 'book') {
    domainPayload = {
      product_id: productId, slug, title, description,
      author: text(form, 'author') || 'هبة الشريف',
      pages_count: optionalNumber(form, 'pages_count'),
      cover_url: text(form, 'cover_url') || null,
      is_published: isPublished,
    }
  } else if (kind === 'workshop') {
    const startsAt = optionalDate(form, 'starts_at')
    const endsAt = optionalDate(form, 'ends_at')
    if (!startsAt || !endsAt || endsAt <= startsAt) {
      if (!id && productId) await service.from('products').delete().eq('id', productId)
      return { ok: false, error: 'حددي بداية ونهاية صحيحتين للورشة.' }
    }
    domainPayload = {
      product_id: productId, slug, title, description,
      starts_at: startsAt, ends_at: endsAt,
      seats_total: number(form, 'seats_total'),
      location_kind: text(form, 'location_kind') || 'online',
      location_text: text(form, 'location_text') || null,
      meeting_url: text(form, 'meeting_url') || null,
      cover_url: text(form, 'cover_url') || null,
      is_published: isPublished,
    }
  } else {
    const bookingPaymentMode = text(form, 'booking_payment_mode') || 'payment_required'
    const holdMinutes = number(form, 'hold_minutes', 10)
    const maxReschedules = number(form, 'max_reschedules', 2)
    if (!['payment_required', 'free'].includes(bookingPaymentMode)) return { ok: false, error: 'اختاري نمط دفع صحيحًا للحجز.' }
    if (holdMinutes < 2 || holdMinutes > 30 || maxReschedules < 0 || maxReschedules > 12)
      return { ok: false, error: 'راجعي مدة التثبيت وحدّ تغييرات الموعد.' }
    domainPayload = {
      product_id: productId, slug, title, description,
      duration_minutes: Math.max(15, number(form, 'duration_minutes', 60)),
      price,
      is_active: isPublished,
      booking_payment_mode: bookingPaymentMode,
      buffer_before_minutes: optionalNumber(form, 'buffer_before_minutes'),
      buffer_after_minutes: optionalNumber(form, 'buffer_after_minutes'),
      minimum_notice_minutes: optionalNumber(form, 'minimum_notice_minutes'),
      booking_window_days: optionalNumber(form, 'booking_window_days'),
      hold_minutes: holdMinutes,
      cancellation_notice_hours: optionalNumber(form, 'cancellation_notice_hours'),
      reschedule_notice_hours: optionalNumber(form, 'reschedule_notice_hours'),
      max_reschedules: maxReschedules,
      booking_policy_note: text(form, 'booking_policy_note'),
    }
  }

  const mutation = id
    ? service.from(domainTable).update(domainPayload).eq('id', id).select('id').single()
    : service.from(domainTable).insert(domainPayload).select('id').single()
  const { data: domain, error: domainError } = await mutation
  if (domainError || !domain) {
    if (!id && productId) await service.from('products').delete().eq('id', productId)
    else if (id && previousProduct && previousDomain) {
      await service.from('products').update(previousProduct).eq('id', productId)
      await service.from(domainTable).update(previousDomain).eq('id', id)
    }
    return { ok: false, error: message(domainError) }
  }

  const coverAssetId = text(form, 'cover_asset_id')
  await syncMediaUsage(admin.id, coverAssetId, 'product', productId!, 'cover_url')
  await syncMediaUsage(admin.id, coverAssetId, kind, domain.id, 'cover_url')
  await audit(admin.id, id ? `${kind}.updated` : `${kind}.created`, kind, domain.id, { title, slug, price, isPublished })
  revalidatePath(paths[kind])
  revalidatePath(`/${kind === 'course' ? 'courses' : kind === 'book' ? 'books' : kind === 'workshop' ? 'workshops' : 'services'}`)
  revalidatePath('/')
  return { ok: true, id: domain.id }
}

export async function saveProductRecord(productId: string | null, form: FormData): Promise<AdminActionResult> {
  const admin = await requireAdminUser('catalog.manage')
  if (!admin) return { ok: false, error: 'هذه العملية تتطلب صلاحية إدارية.' }
  const service = getServiceClient()
  const type = text(form, 'type')
  const title = text(form, 'title')
  const slug = text(form, 'slug').toLowerCase()
  if (!['bundle','vip','free_resource'].includes(type)) return { ok: false, error: 'عدّلي الدورات والكتب والورش والجلسات من أقسامها المتخصصة.' }
  if (title.length < 2 || !/^[a-z0-9-]{3,80}$/.test(slug)) return { ok: false, error: 'راجعي العنوان والرابط.' }
  const payload = {
    type, title, slug,
    subtitle: text(form, 'subtitle') || null,
    description: text(form, 'description'),
    price: Math.max(0, number(form, 'price')),
    compare_at_price: optionalNumber(form, 'compare_at_price'),
    currency: (text(form, 'currency') || 'EGP').toUpperCase(),
    cover_url: text(form, 'cover_url') || null,
    is_published: false,
    sort: number(form, 'sort'),
  }
  if (productId) {
    const { data: previous } = await service.from('products').select('*').eq('id', productId).maybeSingle()
    if (!previous) return { ok: false, error: 'المنتج غير موجود.' }
    if (!['bundle','vip','free_resource'].includes(previous.type) || previous.type !== type) return { ok: false, error: 'نوع المنتج ثابت؛ استخدمي شاشة المجال المتخصصة أو أنشئي برنامجًا جديدًا.' }
    await revision(admin.id, 'product', productId, previous)
    const { error } = await service.from('products').update(payload).eq('id', productId)
    if (error) return { ok: false, error: message(error) }
    const domainMap: Record<string, string> = { course: 'courses', book: 'books', workshop: 'workshops', session: 'services' }
    if (domainMap[type]) {
      const domainUpdate: Record<string, unknown> = { title, slug, description: payload.description }
      if (type !== 'session') domainUpdate.is_published = payload.is_published
      else { domainUpdate.is_active = payload.is_published; domainUpdate.price = payload.price }
      await service.from(domainMap[type]).update(domainUpdate).eq('product_id', productId)
    }
    await syncMediaUsage(admin.id, text(form, 'cover_asset_id'), 'product', productId, 'cover_url')
    await audit(admin.id, 'product.updated', 'product', productId, { title, slug, type, publicationReset: true })
    revalidatePath('/admin/products'); revalidatePath('/programs'); revalidatePath('/search'); revalidatePath('/'); return { ok: true, id: productId }
  }
  const { data, error } = await service.from('products').insert(payload).select('id').single()
  if (error || !data) return { ok: false, error: message(error) }
  await syncMediaUsage(admin.id, text(form, 'cover_asset_id'), 'product', data.id, 'cover_url')
  await audit(admin.id, 'product.created', 'product', data.id, { title, slug, type })
  revalidatePath('/admin/products'); revalidatePath('/programs'); return { ok: true, id: data.id }
}

export async function setProgramProductPublication(productId: string, publish: boolean): Promise<AdminActionResult> {
  const admin = await requireAdminUser('catalog.publish')
  if (!admin) return { ok: false, error: 'لا تملكين صلاحية نشر البرامج والباقات.' }
  const { error } = await getServiceClient().rpc('set_program_product_publication', { p_product_id: productId, p_publish: publish, p_actor_id: admin.id })
  if (error) return { ok: false, error: error.message.includes('program_product_not_ready') ? 'لا يمكن النشر: أكملي الوصف والسعر/العملة وحقوق الغلاف، ثم تكوين الحزمة المنشور أو باقة VIP المرتبطة والمتطابقة أو المورد المجاني المنشور.' : message(error) }
  revalidatePath('/admin/products'); revalidatePath('/programs'); revalidatePath('/search'); revalidatePath('/sitemap.xml'); revalidatePath('/')
  return { ok: true, id: productId }
}

export async function deleteProductRecord(productId: string): Promise<AdminActionResult> {
  const admin = await requireAdminUser('catalog.delete')
  if (!admin) return { ok: false, error: 'هذه العملية تتطلب صلاحية إدارية.' }
  const service = getServiceClient()
  const { data: previous } = await service.from('products').select('*').eq('id', productId).maybeSingle()
  if (!previous) return { ok: false, error: 'المنتج غير موجود.' }
  await revision(admin.id, 'product', productId, previous)
  await service.from('media_usages').delete().eq('entity_type', 'product').eq('entity_id', productId)
  const { error } = await service.from('products').delete().eq('id', productId)
  if (error) return { ok: false, error: message(error) }
  await audit(admin.id, 'product.deleted', 'product', productId, { title: previous.title })
  revalidatePath('/admin/products'); revalidatePath('/'); return { ok: true }
}

export async function saveProductVariant(productId: string, variantId: string | null, form: FormData): Promise<AdminActionResult> {
  const admin = await requireAdminUser('catalog.manage')
  if (!admin) return { ok: false, error: 'لا تملكين صلاحية إدارة الكتالوج.' }
  const name = text(form, 'name')
  const price = number(form, 'price', -1)
  if (name.length < 2 || price < 0) return { ok: false, error: 'راجعي اسم المتغير وسعره.' }
  const service = getServiceClient()
  const payload = { product_id: productId, name, price, is_active: form.get('is_active') === 'on' }
  const mutation = variantId ? service.from('product_variants').update(payload).eq('id', variantId).eq('product_id', productId).select('id').single() : service.from('product_variants').insert(payload).select('id').single()
  const { data, error } = await mutation
  if (error || !data) return { ok: false, error: message(error) }
  await audit(admin.id, variantId ? 'product_variant.updated' : 'product_variant.created', 'product_variant', data.id, { productId, name, price })
  revalidatePath('/admin/products'); return { ok: true, id: data.id }
}

export async function deleteProductVariant(productId: string, variantId: string): Promise<AdminActionResult> {
  const admin = await requireAdminUser('catalog.manage')
  if (!admin) return { ok: false, error: 'لا تملكين صلاحية إدارة الكتالوج.' }
  const service = getServiceClient()
  const { count } = await service.from('order_items').select('id', { count: 'exact', head: true }).eq('variant_id', variantId)
  if ((count ?? 0) > 0) return { ok: false, error: 'هذا المتغير مستخدم في طلبات سابقة؛ عطّليه بدل حذفه.' }
  const { error } = await service.from('product_variants').delete().eq('id', variantId).eq('product_id', productId)
  if (error) return { ok: false, error: message(error) }
  await audit(admin.id, 'product_variant.deleted', 'product_variant', variantId, { productId })
  revalidatePath('/admin/products'); return { ok: true }
}

export async function saveBundleChildren(bundleProductId: string, form: FormData): Promise<AdminActionResult> {
  const admin = await requireAdminUser('catalog.manage')
  if (!admin) return { ok: false, error: 'لا تملكين صلاحية إدارة الكتالوج.' }
  const children = [...new Set(form.getAll('children').map(String).filter((id) => id && id !== bundleProductId))].slice(0, 50)
  if (children.length === 0) return { ok: false, error: 'اختاري منتجًا واحدًا على الأقل داخل الحزمة.' }
  const { error } = await getServiceClient().rpc('set_program_bundle_children', { p_bundle_product_id: bundleProductId, p_child_ids: children, p_actor_id: admin.id })
  if (error) return { ok: false, error: error.message.includes('published_bundle_not_ready') ? 'تعذّر التعديل: الحزمة المنشورة لا تقبل عنصرًا غير منشور أو غير جاهز.' : error.message.includes('invalid_bundle_child') ? 'الحزمة تقبل دورة أو كتابًا أو ورشة أو جلسة فقط، ولا تقبل حزمة متداخلة أو برنامج VIP.' : message(error) }
  revalidatePath('/admin/products'); revalidatePath('/programs'); revalidatePath('/search'); return { ok: true, id: bundleProductId }
}

export async function saveOperationalSettings(form: FormData): Promise<AdminActionResult> {
  const context = await requireFreshAdminAssurance('settings.manage')
  const admin = context?.userId ? { id: context.userId, role: context.role } : null
  if (!admin) return { ok: false, error: FRESH_ADMIN_ASSURANCE_ERROR }
  const expiryHours = Math.round(number(form, 'expiry_hours', 72))
  if (expiryHours < 1 || expiryHours > 168) return { ok: false, error: 'مهلة الطلب يجب أن تكون بين ساعة و168 ساعة.' }
  const bookingPolicy = {
    timezone: 'Africa/Cairo',
    slot_interval_minutes: Math.round(number(form, 'slot_interval', 30)),
    buffer_before_minutes: Math.round(number(form, 'buffer_before', 0)),
    buffer_after_minutes: Math.round(number(form, 'buffer_after', 0)),
    minimum_notice_minutes: Math.round(number(form, 'minimum_notice', 30)),
    booking_horizon_days: Math.round(number(form, 'horizon_days', 30)),
    max_bookings_per_day: Math.round(number(form, 'max_per_day', 20)),
    customer_cancel_notice_hours: Math.round(number(form, 'cancel_notice_hours', 24)),
  }
  if (bookingPolicy.slot_interval_minutes < 5 || bookingPolicy.slot_interval_minutes > 120 || bookingPolicy.buffer_before_minutes < 0 || bookingPolicy.buffer_before_minutes > 180 || bookingPolicy.buffer_after_minutes < 0 || bookingPolicy.buffer_after_minutes > 180 || bookingPolicy.minimum_notice_minutes < 0 || bookingPolicy.minimum_notice_minutes > 10080 || bookingPolicy.booking_horizon_days < 1 || bookingPolicy.booking_horizon_days > 30 || bookingPolicy.max_bookings_per_day < 1 || bookingPolicy.max_bookings_per_day > 100 || bookingPolicy.customer_cancel_notice_hours < 0 || bookingPolicy.customer_cancel_notice_hours > 720) return { ok: false, error: 'راجعي حدود سياسة المواعيد.' }
  const instapayHandle = text(form, 'instapay_handle')
  const instapayName = text(form, 'instapay_name')
  const walletNumber = text(form, 'wallet_number')
  const walletProvider = text(form, 'wallet_provider')
  const bankName = text(form, 'bank_name')
  const bankIban = text(form, 'bank_iban').replace(/\s+/g, '').toUpperCase()
  const bankOwner = text(form, 'bank_owner')
  const emailEnabled = form.get('email_enabled') === 'on'
  if (instapayHandle && (instapayHandle.length < 3 || !instapayName)) return { ok: false, error: 'أكملي عنوان InstaPay واسم صاحبة الحساب.' }
  if (walletNumber && (!/^\+?[0-9]{8,18}$/.test(walletNumber.replace(/[\s-]/g, '')) || !walletProvider)) return { ok: false, error: 'راجعي رقم المحفظة واسم مقدم الخدمة.' }
  if (bankIban && (!/^[A-Z]{2}[A-Z0-9]{13,32}$/.test(bankIban) || !bankName || !bankOwner)) return { ok: false, error: 'راجعي اسم البنك وIBAN واسم صاحبة الحساب.' }
  if (emailEnabled && (!process.env.RESEND_API_KEY?.trim() || !process.env.RESEND_FROM_EMAIL?.trim())) return { ok: false, error: 'أكملي اسمي إعدادات Resend في بيئة الاستضافة قبل تفعيل الإرسال.' }
  const { error } = await getServiceClient().rpc('save_operational_settings', {
    p_actor_id: admin.id,
    p_expiry_hours: expiryHours,
    p_booking_policy: bookingPolicy,
    p_instapay: instapayHandle ? { handle: instapayHandle, name: instapayName } : null,
    p_wallet: walletNumber ? { number: walletNumber, provider: walletProvider } : null,
    p_bank: bankIban ? { bank: bankName, iban: bankIban, name: bankOwner } : null,
    p_email_enabled: emailEnabled,
  })
  if (error) return { ok: false, error: error.code === 'PGRST202' ? 'يلزم تطبيق تحديث إعدادات التشغيل على Staging أولًا.' : message(error) }
  revalidatePath('/admin/settings'); revalidatePath('/checkout'); revalidatePath('/booking'); return { ok: true }
}

export async function deleteCatalogItem(kind: CatalogKind, id: string): Promise<AdminActionResult> {
  const admin = await requireAdminUser('catalog.delete')
  if (!admin) return { ok: false, error: 'هذه العملية تتطلب صلاحية إدارية.' }
  const service = getServiceClient()
  const table = kind === 'course' ? 'courses' : kind === 'book' ? 'books' : kind === 'workshop' ? 'workshops' : 'services'
  const { data } = await service.from(table).select('*, products(*)').eq('id', id).maybeSingle()
  if (!data) return { ok: false, error: 'السجل غير موجود.' }
  await revision(admin.id, kind, id, data)
  await service.from('media_usages').delete().eq('entity_type', kind).eq('entity_id', id)
  await service.from('media_usages').delete().eq('entity_type', 'product').eq('entity_id', data.product_id)
  const { error } = await service.from('products').delete().eq('id', data.product_id)
  if (error) return { ok: false, error: message(error) }
  await audit(admin.id, `${kind}.deleted`, kind, id, { title: data.title })
  revalidatePath(paths[kind])
  revalidatePath('/')
  return { ok: true }
}

export async function saveSubscriptionPlan(id: string | null, form: FormData): Promise<AdminActionResult> {
  const admin = await requireAdminUser('packages.manage')
  if (!admin) return { ok: false, error: 'هذه العملية تتطلب صلاحية إدارية.' }
  const title = text(form, 'title')
  const slug = text(form, 'slug').toLowerCase()
  const price = number(form, 'price')
  if (title.length < 2 || !/^[a-z0-9-]{3,80}$/.test(slug) || price < 0)
    return { ok: false, error: 'راجعي اسم الباقة والرابط والسعر.' }
  let features: string[] = []
  try {
    features = text(form, 'features').split('\n').map((v) => v.trim()).filter(Boolean)
  } catch { /* textarea always produces text */ }
  const payload = {
    title, slug, price,
    product_id: text(form, 'product_id') || null,
    description: text(form, 'description'),
    currency: text(form, 'currency') || 'EGP',
    billing_interval: text(form, 'billing_interval') || 'month',
    duration_days: Math.max(1, number(form, 'duration_days', 30)),
    sessions_included: Math.max(0, number(form, 'sessions_included')),
    max_subscribers: optionalNumber(form, 'max_subscribers'),
    features,
    starts_at: optionalDate(form, 'starts_at'),
    ends_at: optionalDate(form, 'ends_at'),
    is_active: form.get('is_active') === 'on',
    is_published: form.get('is_published') === 'on',
    sort: number(form, 'sort'),
  }
  const service = getServiceClient()
  const eligibleServiceIds = form.getAll('eligible_service_ids').map(String).filter(Boolean)
  let previousVersion = 0
  if (id) {
    const { data: previous } = await service.from('subscription_plans').select('*').eq('id', id).maybeSingle()
    await revision(admin.id, 'subscription_plan', id, previous)
    previousVersion = Number(previous?.version ?? 0)
  }
  const versionedPayload = { ...payload, archived_at: null, version: id ? previousVersion + 1 : 1 }
  const mutation = id
    ? service.from('subscription_plans').update(versionedPayload).eq('id', id).select('id').single()
    : service.from('subscription_plans').insert(versionedPayload).select('id').single()
  const { data, error } = await mutation
  if (error || !data) return { ok: false, error: message(error) }
  const { error: clearServicesError } = await service.from('subscription_plan_services').delete().eq('plan_id', data.id)
  if (clearServicesError) return { ok: false, error: message(clearServicesError) }
  if (eligibleServiceIds.length) {
    const { error: servicesError } = await service.from('subscription_plan_services').insert(
      [...new Set(eligibleServiceIds)].map((serviceId) => ({ plan_id: data.id, service_id: serviceId })),
    )
    if (servicesError) return { ok: false, error: message(servicesError) }
  }
  await audit(admin.id, id ? 'subscription_plan.updated' : 'subscription_plan.created', 'subscription_plan', data.id, { title, price })
  revalidatePath('/admin/memberships')
  revalidatePath('/services')
  return { ok: true, id: data.id }
}

export async function deleteSubscriptionPlan(id: string): Promise<AdminActionResult> {
  const admin = await requireAdminUser('packages.manage')
  if (!admin) return { ok: false, error: 'هذه العملية تتطلب صلاحية إدارية.' }
  const service = getServiceClient()
  const { data: previous } = await service.from('subscription_plans').select('*').eq('id', id).maybeSingle()
  await revision(admin.id, 'subscription_plan', id, previous)
  const { error } = await service.from('subscription_plans').update({
    is_active: false,
    is_published: false,
    archived_at: new Date().toISOString(),
  }).eq('id', id)
  if (error) return { ok: false, error: message(error) }
  await audit(admin.id, 'subscription_plan.archived', 'subscription_plan', id)
  revalidatePath('/admin/memberships')
  revalidatePath('/services')
  return { ok: true }
}

export async function updateSubscriptionStatus(id: string, status: string): Promise<AdminActionResult> {
  const admin = await requireAdminUser('packages.manage')
  if (!admin) return { ok: false, error: 'هذه العملية تتطلب صلاحية إدارية.' }
  if (!['pending','active','paused','cancelled','expired'].includes(status)) return { ok: false, error: 'حالة غير صحيحة.' }
  const { error } = await getServiceClient().rpc('set_subscription_status', {
    p_subscription_id: id,
    p_status: status,
    p_actor_id: admin.id,
  })
  if (error) return { ok: false, error: message(error) }
  await audit(admin.id, `subscription.${status}`, 'subscription', id)
  revalidatePath('/admin/memberships')
  return { ok: true }
}

export async function createSubscription(form: FormData): Promise<AdminActionResult> {
  const admin = await requireAdminUser('packages.manage'); if (!admin) return { ok:false,error:'هذه العملية تتطلب صلاحية إدارية.' }
  const userId=text(form,'user_id'), planId=text(form,'plan_id'), status=text(form,'status')||'active'
  const service=getServiceClient(); const {data:plan}=await service.from('subscription_plans').select('duration_days').eq('id',planId).is('archived_at',null).maybeSingle()
  if(!userId||!plan)return{ok:false,error:'اختاري العميلة والباقة.'}
  const starts=optionalDate(form,'starts_at')??new Date().toISOString(); const ends=optionalDate(form,'ends_at')??new Date(new Date(starts).getTime()+plan.duration_days*86400000).toISOString()
  const {data,error}=await service.rpc('create_managed_subscription',{p_user_id:userId,p_plan_id:planId,p_status:status,p_starts_at:starts,p_ends_at:ends,p_admin_notes:text(form,'admin_notes'),p_actor_id:admin.id})
  if(error||!data){if(error?.message.includes('plan_capacity_reached'))return{ok:false,error:'اكتملت سعة هذه الباقة ولا يمكن تفعيل اشتراك جديد.'};return{ok:false,error:message(error)}}
  await audit(admin.id,'subscription.created','subscription',String(data),{userId,planId,status});revalidatePath('/admin/memberships');return{ok:true,id:String(data)}
}

export async function adjustSubscriptionCredit(subscriptionId:string,delta:1|-1,reason:string):Promise<AdminActionResult>{
  const admin=await requireAdminUser('packages.manage');if(!admin)return{ok:false,error:'لا تملكين صلاحية إدارة الباقات.'}
  const cleanReason=reason.trim();if(cleanReason.length<2)return{ok:false,error:'اكتبي سبب الحركة.'}
  const{data,error}=await getServiceClient().rpc('adjust_subscription_credits',{p_subscription_id:subscriptionId,p_delta:delta,p_booking_id:null,p_reason:cleanReason,p_actor_id:admin.id,p_idempotency_key:`admin:${subscriptionId}:${crypto.randomUUID()}`})
  if(error){if(error.message.includes('credit_balance_out_of_range'))return{ok:false,error:'لا يمكن أن يصبح الرصيد سالبًا أو يتجاوز رصيد الباقة.'};if(error.message.includes('subscription_inactive'))return{ok:false,error:'الاشتراك غير نشط أو خارج فترة الصلاحية.'};return{ok:false,error:message(error)}}
  revalidatePath('/admin/memberships');return{ok:true,id:String(data?.ledger_id??subscriptionId)}
}

export async function deleteSubscription(id:string):Promise<AdminActionResult>{
  const admin=await requireAdminUser('packages.manage');if(!admin)return{ok:false,error:'هذه العملية تتطلب صلاحية إدارية.'}
  const{error}=await getServiceClient().from('subscriptions').update({status:'cancelled',cancelled_at:new Date().toISOString(),archived_at:new Date().toISOString()}).eq('id',id);if(error)return{ok:false,error:message(error)}
  await audit(admin.id,'subscription.archived','subscription',id);revalidatePath('/admin/memberships');return{ok:true}
}

export async function saveArticle(articleId: string, form: FormData): Promise<AdminActionResult> {
  const admin = await requireAdminUser('content.manage')
  if (!admin) return { ok: false, error: 'هذه العملية تتطلب صلاحية إدارية.' }
  const service = getServiceClient()
  const { data: previous } = await service.from('articles').select('*').eq('id', articleId).maybeSingle()
  if (!previous) return { ok: false, error: 'المقال غير موجود.' }
  await revision(admin.id, 'article', articleId, previous)
  const title = text(form, 'title')
  const slug = text(form, 'slug').toLowerCase()
  if (title.length < 3 || !/^[a-z0-9-]{3,80}$/.test(slug)) return { ok: false, error: 'راجعي العنوان والرابط.' }
  const { error } = await service.from('articles').update({
    title, slug,
    excerpt: text(form, 'excerpt'),
    content: text(form, 'content'),
    cover_url: text(form, 'cover_url') || null,
    seo_title: text(form, 'seo_title') || null,
    seo_description: text(form, 'seo_description') || null,
  }).eq('id', articleId)
  if (error) return { ok: false, error: message(error) }
  await syncMediaUsage(admin.id, text(form, 'cover_asset_id'), 'article', articleId, 'cover_url')
  await audit(admin.id, 'article.updated', 'article', articleId, { title, slug })
  revalidatePath('/admin/articles')
  revalidatePath(`/articles/${slug}`)
  return { ok: true, id: articleId }
}

export async function deleteArticle(articleId: string): Promise<AdminActionResult> {
  const admin = await requireAdminUser('content.delete')
  if (!admin) return { ok: false, error: 'هذه العملية تتطلب صلاحية إدارية.' }
  const service = getServiceClient()
  const { data: previous } = await service.from('articles').select('*').eq('id', articleId).maybeSingle()
  if (!previous) return { ok: false, error: 'المقال غير موجود.' }
  await revision(admin.id, 'article', articleId, previous)
  await service.from('media_usages').delete().eq('entity_type', 'article').eq('entity_id', articleId)
  const { error } = await service.from('articles').delete().eq('id', articleId)
  if (error) return { ok: false, error: message(error) }
  await audit(admin.id, 'article.deleted', 'article', articleId, { title: previous.title })
  revalidatePath('/admin/articles')
  revalidatePath('/articles')
  return { ok: true }
}

export async function saveBookingAdmin(bookingId: string, form: FormData): Promise<AdminActionResult> {
  const admin = await requireAdminUser('bookings.manage')
  if (!admin) return { ok: false, error: 'هذه العملية تتطلب صلاحية إدارية.' }
  const startsAt = optionalDate(form, 'starts_at')
  const endsAt = optionalDate(form, 'ends_at')
  const status = text(form, 'status')
  if (!startsAt || !endsAt || endsAt <= startsAt || !['pending','confirmed','completed','cancelled','no_show'].includes(status))
    return { ok: false, error: 'راجعي الموعد والحالة.' }
  const service = getServiceClient()
  const { error } = await service.rpc('admin_update_booking', {
    p_booking_id: bookingId, p_starts_at: startsAt, p_ends_at: endsAt, p_status: status,
    p_meeting_url: text(form, 'meeting_url'), p_customer_notes: text(form, 'customer_notes'), p_admin_notes: text(form, 'admin_notes'),
  })
  if (error) return { ok: false, error: error.code === '23P01' ? 'الموعد الجديد غير متاح أو يتعارض مع buffer.' : message(error) }
  revalidatePath('/admin/bookings')
  revalidatePath('/dashboard/bookings')
  return { ok: true, id: bookingId }
}

export async function saveHomeCopy(form: FormData): Promise<AdminActionResult> {
  const admin = await requireAdminUser('settings.manage')
  if (!admin) return { ok: false, error: 'هذه العملية تتطلب صلاحية إدارية.' }
  const value = {
    eyebrow: text(form, 'eyebrow'),
    headlineStart: text(form, 'headline_start'),
    headlineAccent: text(form, 'headline_accent'),
    headlineMiddle: text(form, 'headline_middle'),
    headlinePath: text(form, 'headline_path'),
    headlineEnd: text(form, 'headline_end'),
    headlineAwareness: text(form, 'headline_awareness'),
    lead: text(form, 'lead'),
    primaryCta: text(form, 'primary_cta'),
    secondaryCta: text(form, 'secondary_cta'),
    imageTitle: text(form, 'image_title'),
    imageLead: text(form, 'image_lead'),
  }
  if (Object.values(value).some((item) => item.length < 2)) return { ok: false, error: 'أكملي كل نصوص الواجهة قبل الحفظ.' }
  const service = getServiceClient()
  const { data: previous } = await service.from('site_settings').select('*').eq('key', 'home_copy').maybeSingle()
  if (previous) await service.from('content_revisions').insert({ entity_type: 'site_copy', entity_id: admin.id, snapshot: previous, created_by: admin.id })
  const { error } = await service.from('site_settings').upsert({ key: 'home_copy', value, is_public: true, updated_by: admin.id }, { onConflict: 'key' })
  if (error) return { ok: false, error: message(error) }
  await audit(admin.id, 'site_copy.home_updated', 'site_setting', admin.id, { key: 'home_copy' })
  revalidatePath('/admin/settings'); revalidatePath('/'); return { ok: true }
}

type MediaUploadInput = {
  bucket: string
  name: string
  type: string
  size: number
  title?: string
  alt?: string
  tags?: string
  caption?: string
  credit?: string
  rightsStatus?: string
  rightsReference?: string
  folder?: string
  focalX?: number
  focalY?: number
}

type ValidatedMediaUpload = {
  bucket: string
  name: string
  type: string
  size: number
  title: string
  alt: string
  tags: string[]
  caption: string
  credit: string
  rightsStatus: string
  rightsReference: string
  folder: string
  focalX: number
  focalY: number
  kind: 'image' | 'video' | 'audio' | 'document'
}

type MediaUploadStart = { bucket: string; path: string; token: string }

function validateMediaUpload(input: MediaUploadInput): ValidatedMediaUpload | { error: string } {
  const bucket = input.bucket
  const allowed = ['public-media','course-videos','course-resources','protected-books','workshop-recordings']
  if (!allowed.includes(bucket)) return { error: 'المخزن غير مسموح.' }
  if (!input.name.trim() || !Number.isFinite(input.size) || input.size <= 0) return { error: 'اختاري ملفًا.' }
  const limits: Record<string, number> = { 'public-media': 10, 'course-videos': 500, 'course-resources': 50, 'protected-books': 100, 'workshop-recordings': 500 }
  if (input.size > limits[bucket] * 1024 * 1024) return { error: `الحد الأقصى لهذا المخزن ${limits[bucket]} ميجابايت.` }
  const allowedMime: Record<string, RegExp> = {
    'public-media': /^(image\/(jpeg|png|webp|gif|svg\+xml)|application\/pdf)$/,
    'course-videos': /^video\/(mp4|webm|quicktime)$/,
    'course-resources': /^(application\/(pdf|zip|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation))|image\/(jpeg|png|webp))$/,
    'protected-books': /^application\/(pdf|epub\+zip)$/,
    'workshop-recordings': /^(video\/(mp4|webm|quicktime)|audio\/(mpeg|mp4|wav))$/,
  }
  if (!input.type || !allowedMime[bucket].test(input.type)) return { error: 'نوع الملف لا يناسب المخزن المحدد.' }
  const title = input.title?.trim() || input.name.replace(/\.[^.]+$/, '')
  const alt = input.alt?.trim() ?? ''
  if (bucket === 'public-media' && input.type.startsWith('image/') && alt.length < 3) return { error: 'اكتبي نصًا بديلًا واضحًا للصورة العامة.' }
  const rightsStatus = input.rightsStatus?.trim() || 'unverified'
  const rightsReference = (input.rightsReference ?? '').trim().slice(0, 500)
  if (!['unverified','owned','licensed','public_domain'].includes(rightsStatus)) return { error: 'حالة حقوق الاستخدام غير صحيحة.' }
  if (bucket === 'public-media' && input.type.startsWith('image/') && rightsStatus === 'unverified') return { error: 'حددي مصدر حقوق استخدام الصورة العامة قبل رفعها.' }
  if (bucket === 'public-media' && input.type.startsWith('image/') && !rightsReference) return { error: 'أضيفي مرجع ملكية أو ترخيص الصورة العامة.' }
  const tags = [...new Set((input.tags ?? '').split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 20)
  const folder = (input.folder?.trim() || 'uncategorized').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'uncategorized'
  const focalX = Math.min(100, Math.max(0, Number.isFinite(input.focalX) ? Number(input.focalX) : 50))
  const focalY = Math.min(100, Math.max(0, Number.isFinite(input.focalY) ? Number(input.focalY) : 50))
  const kind = input.type.startsWith('image/') ? 'image' : input.type.startsWith('video/') ? 'video' : input.type.startsWith('audio/') ? 'audio' : 'document'
  return {
    bucket, name: input.name.trim(), type: input.type, size: input.size, title, alt, tags, kind,
    caption: (input.caption ?? '').trim().slice(0, 500), credit: (input.credit ?? '').trim().slice(0, 200),
    rightsStatus, rightsReference, folder, focalX, focalY,
  }
}

export async function beginMediaUpload(input: MediaUploadInput): Promise<{ ok: true; data: MediaUploadStart } | { ok: false; error: string }> {
  const admin = await requireAdminUser('media.manage')
  if (!admin) return { ok: false, error: 'هذه العملية تتطلب صلاحية إدارية.' }
  const media = validateMediaUpload(input)
  if ('error' in media) return { ok: false, error: media.error }
  const safeName = media.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'asset'
  const path = `admin/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}-${safeName}`
  const service = getServiceClient()
  const { data, error } = await service.storage.from(media.bucket).createSignedUploadUrl(path)
  if (error || !data) return { ok: false, error: message(error) }
  return { ok: true, data: { bucket: media.bucket, path, token: data.token } }
}

export async function finalizeMediaUpload(input: MediaUploadInput & { path: string }): Promise<AdminActionResult> {
  const admin = await requireAdminUser('media.manage')
  if (!admin) return { ok: false, error: 'هذه العملية تتطلب صلاحية إدارية.' }
  const media = validateMediaUpload(input)
  if ('error' in media) return { ok: false, error: media.error }
  const safeName = media.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'asset'
  if (!new RegExp(`^admin/\\d{4}-\\d{2}-\\d{2}/[0-9a-f-]{36}-${safeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i').test(input.path)) return { ok: false, error: 'مسار الملف غير صحيح.' }
  const service = getServiceClient()
  const { data, error } = await service.from('media_assets').insert({
    bucket: media.bucket, path: input.path, title: media.title, alt: media.alt, tags: media.tags, kind: media.kind, size_bytes: media.size, mime_type: media.type,
    original_name: media.name, visibility: media.bucket === 'public-media' ? 'public' : 'private', uploaded_by: admin.id,
    caption: media.caption, credit: media.credit, rights_status: media.rightsStatus, rights_reference: media.rightsReference, folder: media.folder,
    focal_x: media.focalX, focal_y: media.focalY, processing_status: 'original',
  }).select('id').single()
  if (error || !data) { await service.storage.from(media.bucket).remove([input.path]); return { ok: false, error: message(error) } }
  await audit(admin.id, 'media.uploaded', 'media_asset', data.id, { bucket: media.bucket, kind: media.kind, size: media.size, rightsStatus: media.rightsStatus })
  revalidatePath('/admin/media'); return { ok: true, id: data.id }
}

export async function updateMediaMetadata(id: string, form: FormData): Promise<AdminActionResult> {
  const admin = await requireAdminUser('media.manage')
  if (!admin) return { ok: false, error: 'هذه العملية تتطلب صلاحية إدارة الوسائط.' }
  const title = text(form, 'title')
  const alt = text(form, 'alt')
  const tags = [...new Set(text(form, 'tags').split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 20)
  const caption = text(form, 'caption').slice(0, 500)
  const credit = text(form, 'credit').slice(0, 200)
  const rightsStatus = text(form, 'rights_status')
  const rightsReference = text(form, 'rights_reference').slice(0, 500)
  const folder = (text(form, 'folder') || 'uncategorized').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'uncategorized'
  const focalX = Math.min(100, Math.max(0, number(form, 'focal_x', 50)))
  const focalY = Math.min(100, Math.max(0, number(form, 'focal_y', 50)))
  if (title.length < 2) return { ok: false, error: 'اسم الأصل مطلوب.' }
  if (!['unverified','owned','licensed','public_domain'].includes(rightsStatus)) return { ok: false, error: 'حالة حقوق الاستخدام غير صحيحة.' }
  const service = getServiceClient()
  const { data: previous } = await service.from('media_assets').select('id, bucket, kind, title, alt, tags, caption, credit, rights_status, rights_reference, folder, focal_x, focal_y, archived_at').eq('id', id).maybeSingle()
  if (!previous) return { ok: false, error: 'الملف غير موجود.' }
  if (previous.archived_at) return { ok: false, error: 'استعيدي الأصل من الأرشيف قبل تعديل بياناته.' }
  if (previous.bucket === 'public-media' && previous.kind === 'image' && alt.length < 3) return { ok: false, error: 'النص البديل مطلوب للصورة العامة.' }
  if (previous.bucket === 'public-media' && previous.kind === 'image' && rightsStatus === 'unverified') return { ok: false, error: 'الصورة العامة تتطلب حالة حقوق موثقة.' }
  if (previous.bucket === 'public-media' && previous.kind === 'image' && !rightsReference) return { ok: false, error: 'الصورة العامة تتطلب مرجع ملكية أو ترخيص.' }
  const next = { title, alt, tags, caption, credit, rights_status: rightsStatus, rights_reference: rightsReference, folder, focal_x: focalX, focal_y: focalY }
  const { error } = await service.from('media_assets').update(next).eq('id', id)
  if (error) return { ok: false, error: message(error) }
  const changedFields = Object.entries(next).filter(([key, value]) => value !== previous[key as keyof typeof previous]).map(([key]) => key)
  await audit(admin.id, 'media.metadata_updated', 'media_asset', id, { changedFields, rightsStatus, hasRightsReference: Boolean(rightsReference) })
  revalidatePath('/admin/media')
  return { ok: true, id }
}

export async function manageMediaLifecycle(id: string, action: 'archive' | 'restore' | 'replace', replacementId?: string): Promise<AdminActionResult> {
  const admin = await requireAdminUser('media.manage')
  if (!admin) return { ok: false, error: 'هذه العملية تتطلب صلاحية إدارة الوسائط.' }
  const service = getServiceClient()
  let replacementUrl: string | null = null
  if (action === 'replace') {
    if (!replacementId) return { ok: false, error: 'اختاري الأصل البديل أولًا.' }
    const { data: replacement } = await service.from('media_assets').select('id, bucket, path, archived_at').eq('id', replacementId).maybeSingle()
    if (!replacement || replacement.archived_at) return { ok: false, error: 'الأصل البديل غير متاح.' }
    if (replacement.bucket === 'public-media') replacementUrl = service.storage.from(replacement.bucket).getPublicUrl(replacement.path).data.publicUrl
  }
  const { error } = await service.rpc('manage_media_asset_lifecycle', {
    p_asset_id: id,
    p_action: action,
    p_replacement_id: replacementId || null,
    p_replacement_url: replacementUrl,
    p_actor_id: admin.id,
  })
  if (error) {
    if (error.message.includes('media_in_use_requires_replacement')) return { ok: false, error: 'هذا الأصل مستخدم؛ اختاري بديلًا متوافقًا لينتقل كل استخدام بأمان.' }
    if (error.message.includes('media_replacement_incompatible')) return { ok: false, error: 'البديل يجب أن يطابق نوع الملف والمخزن وحالة الظهور.' }
    if (error.message.includes('replaced_media_cannot_restore')) return { ok: false, error: 'هذا الأصل استُبدل بالفعل؛ الأصل الجديد هو المرجع التشغيلي.' }
    return { ok: false, error: message(error) }
  }
  for (const path of ['/admin/media','/','/courses','/books','/workshops','/articles','/press','/resources','/programs','/search']) revalidatePath(path)
  return { ok: true, id }
}
