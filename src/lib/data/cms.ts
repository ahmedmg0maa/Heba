import { getServerClient } from '@/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'
import { defaultHomeSections, normalizeHomeSections, type HomeSection } from '@/lib/home/sections'

const hasEnv = hasSupabasePublicConfig

export type FeatureFlags = Record<string, boolean>
export type MediaOption = { id: string; title: string; alt: string; kind: string; url: string }
export type PublicNavigationItem={menu:string;label:string;href:string;sort:number}

export type PublishedCmsPage = {
  title: string
  updatedAt: string
  legalVersion: string | null
  effectiveAt: string | null
  sections: { id: string; kind: string; sort: number; content: unknown }[]
}

export async function getPublishedCmsPage(slug: string): Promise<PublishedCmsPage | null> {
  if (!hasEnv()) return null
  try {
    const supabase = await getServerClient()
    const { data } = await supabase.from('pages')
      .select('title, updated_at, legal_review_status, legal_version, effective_at, page_sections(id, kind, sort, content)')
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('is_published', true)
      .maybeSingle()
    if (!data) return null
    if (['privacy','terms','refund','disclaimer','session-policy'].includes(slug) && (data.legal_review_status !== 'approved' || !data.legal_version || !data.effective_at)) return null
    return { title: data.title, updatedAt: data.updated_at, legalVersion: data.legal_version, effectiveAt: data.effective_at, sections: [...(data.page_sections ?? [])].sort((a, b) => a.sort - b.sort) }
  } catch { return null }
}

export async function getPublicNavigation():Promise<PublicNavigationItem[]>{if(!hasEnv())return[];try{const supabase=await getServerClient(),{data}=await supabase.from('navigation_items').select('menu,label,href,sort').eq('is_visible',true).order('sort',{ascending:true});return data??[]}catch{return[]}}

export type HomeCopy = {
  eyebrow: string; headlineStart: string; headlineAccent: string; headlineMiddle: string;
  headlinePath: string; headlineEnd: string; headlineAwareness: string; lead: string;
  primaryCta: string; secondaryCta: string; imageTitle: string; imageLead: string
}

export const defaultHomeCopy: HomeCopy = {
  eyebrow: 'كتب ودورات وجلسات وورش في مكان واحد', headlineStart: 'اختاري', headlineAccent: 'خطوتك',
  headlineMiddle: 'بوضوح', headlinePath: 'وبإيقاعك', headlineEnd: 'وابنيها',
  headlineAwareness: 'على مهل', lead: 'تصفّحي المسارات المتاحة، واقرئي تفاصيل كل تجربة، ثم ابدئي من الباب الأقرب إليكِ الآن.',
  primaryCta: 'ابدئي من هنا', secondaryCta: 'تصفّحي المسارات', imageTitle: 'صورة تعبيرية',
  imageLead: 'تمثل جمهور المنصة ولا تمثل المالكة',
}

export async function getHomeCopy(): Promise<HomeCopy> {
  if (!hasEnv()) return defaultHomeCopy
  try {
    const supabase = await getServerClient()
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'home_copy').maybeSingle()
    return data?.value && typeof data.value === 'object' ? { ...defaultHomeCopy, ...(data.value as Partial<HomeCopy>) } : defaultHomeCopy
  } catch { return defaultHomeCopy }
}

export async function getPublishedHomeSections(): Promise<HomeSection[]> {
  if (!hasEnv()) return defaultHomeSections()
  try {
    const supabase = await getServerClient()
    const { data, error } = await supabase.from('pages')
      .select('page_sections(id,name,kind,sort,is_visible,content)')
      .eq('slug', 'home')
      .eq('status', 'published')
      .eq('is_published', true)
      .maybeSingle()
    if (error || !data) return defaultHomeSections()
    return normalizeHomeSections(data.page_sections ?? [])
  } catch { return defaultHomeSections() }
}
export type OwnerProfile={eyebrow:string;title:string;lead:string;method:string;values:{title:string;text:string}[]}
export const defaultOwnerProfile:OwnerProfile={eyebrow:'عن هبة',title:'مساحة إنسانية للتعلّم والنمو',lead:'أنا هبة الشريف. أقدّم محتوى وبرامج ومساحات خاصة تساعدك على الفهم والتطبيق بخطوات واضحة.',method:'منهج هادئ: معرفة موثوقة، أدوات عملية، ومساحة تحترم إيقاعك.',values:[{title:'الوضوح',text:'نشرح ما نقدمه وحدوده بلغة مباشرة.'},{title:'التطبيق',text:'نحوّل المعرفة إلى خطوات قابلة للتجربة.'},{title:'الخصوصية',text:'نحترم بياناتك ومساحتك الشخصية.'}]}
export async function getOwnerProfile():Promise<OwnerProfile>{if(!hasEnv())return defaultOwnerProfile;try{const supabase=await getServerClient(),{data}=await supabase.from('site_settings').select('value').eq('key','owner_profile').maybeSingle();return data?.value&&typeof data.value==='object'?{...defaultOwnerProfile,...data.value as Partial<OwnerProfile>}:defaultOwnerProfile}catch{return defaultOwnerProfile}}

const disabledFlags: FeatureFlags = { workshops: false, vip_program: false, certificates: false }
export type FeatureFlagSnapshot = { state: 'ready' | 'unconfigured' | 'unavailable'; flags: FeatureFlags }

export async function getFeatureFlagSnapshot(): Promise<FeatureFlagSnapshot> {
  if (!hasEnv()) return { state: 'unconfigured', flags: disabledFlags }
  try {
    const supabase = await getServerClient()
    const { data, error } = await supabase.from('feature_flags').select('key, is_enabled')
    if (error) return { state: 'unavailable', flags: disabledFlags }
    return { state: 'ready', flags: { ...disabledFlags, ...Object.fromEntries((data ?? []).map((flag) => [flag.key, flag.is_enabled])) } }
  } catch {
    return { state: 'unavailable', flags: disabledFlags }
  }
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  return (await getFeatureFlagSnapshot()).flags
}

export type AdminListResult<T> = { state: 'ready' | 'unconfigured' | 'unavailable'; rows: T[] }

export async function adminListResult<T>(
  table: string,
  columns: string,
  opts: { orderBy?: string; ascending?: boolean; limit?: number } = {},
): Promise<AdminListResult<T>> {
  if (!hasEnv()) return { state: 'unconfigured', rows: [] }
  try {
    const supabase = await getServerClient()
    let query = supabase.from(table).select(columns).limit(opts.limit ?? 100)
    if (opts.orderBy) query = query.order(opts.orderBy, { ascending: opts.ascending ?? false })
    const { data, error } = await query
    if (error) return { state: 'unavailable', rows: [] }
    return { state: 'ready', rows: (data ?? []) as T[] }
  } catch {
    return { state: 'unavailable', rows: [] }
  }
}

// Generic guarded list fetch for Admin pages. In a configured environment a
// failed query throws a sanitized boundary error instead of becoming fake emptiness.
export async function adminList<T>(
  table: string,
  columns: string,
  opts: { orderBy?: string; ascending?: boolean; limit?: number } = {},
): Promise<T[]> {
  const result = await adminListResult<T>(table, columns, opts)
  if (result.state === 'unavailable') throw new Error('ADMIN_DATA_READ_UNAVAILABLE')
  return result.rows
}

export async function getPublicMediaOptions(limit = 80): Promise<MediaOption[]> {
  if (!hasEnv()) return []
  try {
    const supabase = await getServerClient()
    const { data } = await supabase.from('media_assets')
      .select('id, title, alt, kind, bucket, path')
      .eq('visibility', 'public')
      .eq('bucket', 'public-media')
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)
    return (data ?? []).map((asset) => ({
      id: asset.id,
      title: asset.title || asset.alt || asset.path.split('/').at(-1) || 'وسيط',
      alt: asset.alt,
      kind: asset.kind,
      url: supabase.storage.from(asset.bucket).getPublicUrl(asset.path).data.publicUrl,
    }))
  } catch { return [] }
}

export type ContentReadinessStatus = 'ready' | 'needs-content' | 'blocked' | 'unconfigured' | 'unknown'
export type LaunchReadinessLevel = 'ready' | 'warning' | 'blocker'

export type ContentReadinessItem = {
  id: string
  title: string
  detail: string
  status: ContentReadinessStatus
  href: string
}

export function launchLevelForStatus(status: ContentReadinessStatus): LaunchReadinessLevel {
  if (status === 'ready') return 'ready'
  if (status === 'needs-content') return 'warning'
  return 'blocker'
}

type CountResult = { count: number | null; error: { message: string } | null }

function readinessForCount(
  id: string,
  title: string,
  count: CountResult,
  href: string,
  readyDetail: (count: number) => string,
  missingDetail: string,
): ContentReadinessItem {
  if (count.error) return { id, title, detail: 'تعذّر التحقق من هذا المصدر؛ راجعي الصلاحيات والترحيلات بعد ربط مشروع الإنتاج الصحيح.', status: 'unknown', href }
  if ((count.count ?? 0) > 0) return { id, title, detail: readyDetail(count.count ?? 0), status: 'ready', href }
  return { id, title, detail: missingDetail, status: 'needs-content', href }
}

// This checklist only reads the configured database. It deliberately reports
// "unconfigured" rather than inferring readiness from local fallback copy.
export async function getContentReadiness(): Promise<ContentReadinessItem[]> {
  if (!hasEnv()) {
    return [
      { id: 'connection', title: 'اتصال مصدر الحقيقة', detail: 'لم تُهيأ متغيرات Supabase العامة في هذه البيئة؛ لا يمكن قياس جاهزية المحتوى.', status: 'unconfigured', href: '/admin/system' },
      { id: 'catalog', title: 'منتجات منشورة', detail: 'تُفحص بعد ربط مشروع الإنتاج الصحيح؛ لا توجد بيانات بديلة محلية.', status: 'unconfigured', href: '/admin/products' },
      { id: 'booking', title: 'خدمات ومواعيد منشورة', detail: 'تُفحص بعد ربط مشروع الإنتاج الصحيح؛ لا توجد مواعيد افتراضية.', status: 'unconfigured', href: '/admin/bookings' },
      { id: 'payments', title: 'وسيلة دفع مفعّلة', detail: 'تُفحص بعد ربط مشروع الإنتاج الصحيح؛ الشراء والحجز محجوبان بلا وسيلة دفع.', status: 'unconfigured', href: '/admin/settings' },
      { id: 'articles', title: 'مقال منشور', detail: 'تُفحص بعد ربط مشروع الإنتاج الصحيح.', status: 'unconfigured', href: '/admin/articles' },
      { id: 'legal', title: 'سياسات قانونية معتمدة', detail: 'تتطلب اعتماد المالكة ومراجعة قانونية؛ النصوص الحالية مسودات غير منشورة.', status: 'blocked', href: '/admin/pages' },
      { id: 'database-change', title: 'ترحيلات التشغيل والحوكمة', detail: '044–056 مصدرية محلية فقط ولم تُقبل على Staging؛ 043 وحدها هي آخر حالة Production موثقة.', status: 'blocked', href: '/admin/system' },
      { id: 'recovery', title: 'نسخة احتياطية وخطة رجوع مجرّبة', detail: 'لا توجد نقطة استعادة موثقة ولا تجربة رجوع على staging.', status: 'blocked', href: '/admin/system' },
      { id: 'auth-redirects', title: 'روابط Auth والنطاق القانوني', detail: 'يلزم اعتماد النطاق الأساسي ثم التحقق من Site URL وقائمة redirect URLs في Supabase وبيئة الاستضافة.', status: 'blocked', href: '/admin/settings' },
    ]
  }

  try {
    const supabase = await getServerClient()
    const [products, activeServices, availability, articles, paymentRows, approvedLegal] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('services').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('availability_rules').select('id', { count: 'exact', head: true }),
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('site_settings').select('key, value').in('key', ['payment_instapay', 'payment_wallet', 'payment_bank']),
      supabase.from('pages').select('slug', { count: 'exact', head: true }).in('slug', ['privacy','terms','refund','disclaimer','session-policy']).eq('status', 'published').eq('is_published', true).eq('legal_review_status', 'approved').not('legal_version', 'is', null).not('effective_at', 'is', null),
    ])

    const serviceCount = activeServices.count ?? 0
    const availabilityCount = availability.count ?? 0
    const paymentError = paymentRows.error
    const paymentValues = Object.fromEntries((paymentRows.data ?? []).map((row) => [row.key, row.value as Record<string, unknown>]))
    const paymentReady = Boolean(
      paymentValues.payment_instapay?.handle || paymentValues.payment_wallet?.number || paymentValues.payment_bank?.iban,
    )

    return [
      { id: 'connection', title: 'اتصال مصدر الحقيقة', detail: 'تمت تهيئة إعدادات القراءة العامة. لا تثبت هذه الإشارة وحدها صحة صلاحيات أو بيانات الإنتاج.', status: 'ready', href: '/admin/system' },
      readinessForCount('catalog', 'منتجات منشورة', products, '/admin/products', (count) => `${count.toLocaleString('ar-EG')} منتجًا منشورًا يمكن للواجهة العامة قراءته.`, 'انشري منتجًا حقيقيًا واحدًا على الأقل قبل فتح الشراء.'),
      serviceCount > 0 && availabilityCount > 0
        ? { id: 'booking', title: 'خدمات ومواعيد منشورة', detail: `${serviceCount.toLocaleString('ar-EG')} خدمة نشطة و${availabilityCount.toLocaleString('ar-EG')} قاعدة توافر منشورة.`, status: 'ready', href: '/admin/bookings' }
        : activeServices.error || availability.error
          ? { id: 'booking', title: 'خدمات ومواعيد منشورة', detail: 'تعذّر التحقق من الخدمات أو قواعد التوافر؛ راجعي الصلاحيات والترحيلات.', status: 'unknown', href: '/admin/bookings' }
          : { id: 'booking', title: 'خدمات ومواعيد منشورة', detail: 'أضيفي خدمة نشطة وقاعدة توافر فعلية؛ لا تنشئ المنصة مواعيد بديلة.', status: 'needs-content', href: '/admin/bookings' },
      paymentError
        ? { id: 'payments', title: 'وسيلة دفع مفعّلة', detail: 'تعذّر التحقق من إعدادات الدفع؛ راجعي الصلاحيات والترحيلات.', status: 'unknown', href: '/admin/settings' }
        : paymentReady
          ? { id: 'payments', title: 'وسيلة دفع مفعّلة', detail: 'توجد وسيلة دفع مفعّلة واحدة على الأقل؛ لا تعرض هذه القائمة أي بيانات حساب.', status: 'ready', href: '/admin/settings' }
          : { id: 'payments', title: 'وسيلة دفع مفعّلة', detail: 'الشراء والحجز محجوبان حتى تفعيل وسيلة دفع من الإعدادات.', status: 'needs-content', href: '/admin/settings' },
      readinessForCount('articles', 'مقال منشور', articles, '/admin/articles', (count) => `${count.toLocaleString('ar-EG')} مقالًا منشورًا ظاهرًا في الكتالوج العام.`, 'انشري مقالًا أو اتركي قسم المقالات فارغًا بوضوح.'),
      approvedLegal.error
        ? { id: 'legal', title: 'سياسات قانونية معتمدة', detail: 'تعذّر التحقق من حالة السياسات؛ لا تُعامل كمعتمدة.', status: 'unknown', href: '/admin/pages' }
        : approvedLegal.count === 5
          ? { id: 'legal', title: 'سياسات قانونية معتمدة', detail: 'الخصوصية والشروط والاسترداد وإخلاء المسؤولية وسياسة الجلسة منشورة بإصدار وتاريخ سريان معتمدين.', status: 'ready', href: '/admin/pages' }
          : { id: 'legal', title: 'سياسات قانونية معتمدة', detail: `${(approvedLegal.count ?? 0).toLocaleString('ar-EG')} من ٥ سياسات فقط مستوفية للاعتماد والإصدار وتاريخ السريان.`, status: 'blocked', href: '/admin/pages' },
      { id: 'database-change', title: 'ترحيلات التشغيل والحوكمة', detail: '044–056 محلية فقط؛ يلزم Recovery ثم تطبيقها بالترتيب على Staging قبل أي إطلاق.', status: 'blocked', href: '/admin/system' },
      { id: 'recovery', title: 'نسخة احتياطية وخطة رجوع مجرّبة', detail: 'يلزم إثبات نقطة استعادة حديثة وتجربة rollback على staging قبل الترحيلات.', status: 'blocked', href: '/admin/system' },
      { id: 'auth-redirects', title: 'روابط Auth والنطاق القانوني', detail: 'لم يتم التحقق من Site URL وredirect allow-list؛ اعتماد النطاق والتحقق الخارجي مانع إطلاق.', status: 'blocked', href: '/admin/settings' },
    ]
  } catch {
    return [{ id: 'connection', title: 'اتصال مصدر الحقيقة', detail: 'تعذّر الوصول إلى مصدر البيانات؛ لم يُفترض أن النظام جاهز.', status: 'unknown', href: '/admin/system' }]
  }
}
