import 'server-only'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'
import { hasSupabaseServerSecret } from '@/lib/supabase/server'

export type IntegrationStatus = 'configured' | 'incomplete' | 'unconfigured' | 'not-applicable'
export type IntegrationReadiness = {
  id: string
  title: string
  status: IntegrationStatus
  detail: string
  requiredForLaunch: boolean
}

const present = (name: string) => Boolean(process.env[name]?.trim())
const paired = (first: string, second: string): IntegrationStatus => {
  const count = Number(present(first)) + Number(present(second))
  return count === 2 ? 'configured' : count === 1 ? 'incomplete' : 'unconfigured'
}

export function getIntegrationReadiness(): IntegrationReadiness[] {
  const supabaseClient = hasSupabasePublicConfig()
  const supabaseServer = hasSupabaseServerSecret()
  const supabaseStatus = supabaseClient && supabaseServer ? 'configured' : supabaseClient || supabaseServer ? 'incomplete' : 'unconfigured'
  const resendStatus = paired('RESEND_API_KEY', 'RESEND_FROM_EMAIL')
  const sentryStatus: IntegrationStatus = present('SENTRY_DSN') || present('NEXT_PUBLIC_SENTRY_DSN') ? 'configured' : 'unconfigured'
  const scannerStatus = paired('PROTECTED_UPLOAD_SCAN_URL', 'PROTECTED_UPLOAD_SCAN_TOKEN')
  const staging = process.env.HEBA_DEPLOYMENT_ENV === 'staging'
  const stagingStatus: IntegrationStatus = staging ? paired('STAGING_ACCESS_USER', 'STAGING_ACCESS_PASSWORD') : 'not-applicable'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? ''
  const canonicalStatus: IntegrationStatus = /^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(siteUrl) ? 'configured' : siteUrl ? 'incomplete' : 'unconfigured'

  return [
    { id: 'supabase', title: 'Supabase client/server', status: supabaseStatus, requiredForLaunch: true, detail: supabaseStatus === 'configured' ? 'أسماء إعدادات القراءة والخادم موجودة؛ هذه إشارة تهيئة وليست اختبار اتصال.' : 'يلزم تهيئة القراءة العامة ومفتاح الخادم معًا داخل بيئة الاستضافة.' },
    { id: 'canonical', title: 'Canonical site URL', status: canonicalStatus, requiredForLaunch: true, detail: canonicalStatus === 'configured' ? 'اسم متغير النطاق يحمل عنوان HTTPS صالحًا شكليًا؛ يلزم اختباره حيًا.' : 'عنوان الموقع الأساسي مفقود أو ليس أصل HTTPS صالحًا.' },
    { id: 'resend', title: 'Resend transactional email', status: resendStatus, requiredForLaunch: true, detail: resendStatus === 'configured' ? 'أسماء مفتاح Resend والمرسل موجودة؛ لم يُجر اختبار إرسال حي من هذه الصفحة.' : resendStatus === 'incomplete' ? 'تهيئة البريد جزئية؛ لا يمكن تشغيل الإرسال.' : 'البريد غير مهيأ، وتبقى رسائل outbox غير مرسلة.' },
    { id: 'sentry', title: 'Sentry error monitoring', status: sentryStatus, requiredForLaunch: true, detail: sentryStatus === 'configured' ? 'اسم DSN موجود؛ لم يُرسل حدث اختبار حي من هذه الصفحة.' : 'مراقبة الأخطاء غير مهيأة.' },
    { id: 'scanner', title: 'Protected upload scanner', status: scannerStatus, requiredForLaunch: false, detail: scannerStatus === 'configured' ? 'اسما endpoint/token موجودان؛ النشر يظل fail-closed إذا فشل الفحص.' : scannerStatus === 'incomplete' ? 'تهيئة الفحص الجزئي غير صالحة، لذلك يُعامل المزود كغير متاح.' : 'لا يوجد مزود فحص ملفات؛ الملفات المحمية لا تُقبل كمنشورة قبل مسار فحص معتمد.' },
    { id: 'staging-access', title: 'Staging access protection', status: stagingStatus, requiredForLaunch: staging, detail: staging ? stagingStatus === 'configured' ? 'اسما اعتماد حماية Staging موجودان؛ لا تُعرض قيمهما.' : 'Staging يجب أن يفشل مغلقًا حتى يكتمل الاسمان.' : 'غير مطلوب في بيئة غير موسومة Staging.' },
  ]
}
