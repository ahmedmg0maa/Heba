import type { Metadata } from 'next'
import { adminList, getContentReadiness, getFeatureFlags, launchLevelForStatus, type ContentReadinessItem, type ContentReadinessStatus, type LaunchReadinessLevel } from '@/lib/data/cms'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'
import { getBookingExperience } from '@/lib/data/booking'

export const metadata: Metadata = { title: 'حالة النظام — الإدارة' }

type EventRow = { id: string; level: string; source: string; message: string; created_at: string }

const dateFmt = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

const levelTones: Record<string, 'danger' | 'pending' | 'cobalt' | 'sand'> = {
  error: 'danger',
  warn: 'pending',
  info: 'cobalt',
  debug: 'sand',
}

const readinessTone: Record<ContentReadinessStatus, 'success' | 'pending' | 'danger' | 'sand' | 'cobalt'> = {
  ready: 'success',
  'needs-content': 'pending',
  blocked: 'danger',
  unconfigured: 'sand',
  unknown: 'cobalt',
}

const readinessLabel: Record<ContentReadinessStatus, string> = {
  ready: 'جاهز',
  'needs-content': 'يحتاج محتوى',
  blocked: 'مانع',
  unconfigured: 'غير مهيأ',
  unknown: 'غير معروف',
}

const launchTone: Record<LaunchReadinessLevel, 'success' | 'pending' | 'danger'> = {
  ready: 'success', warning: 'pending', blocker: 'danger',
}
const launchLabel: Record<LaunchReadinessLevel, string> = {
  ready: 'ready', warning: 'warning', blocker: 'blocker',
}

export default async function AdminSystemPage() {
  const [events, flags, contentReadiness, bookingExperience] = await Promise.all([
    adminList<EventRow>('system_events', 'id, level, source, message, created_at', { orderBy: 'created_at', limit: 50 }),
    getFeatureFlags(),
    getContentReadiness(),
    getBookingExperience(),
  ])
  const bookingRuntime = {
    id: 'booking-runtime', title: 'عقد تشغيل الحجز 044', href: '/admin/bookings',
    detail: bookingExperience.runtime.detail,
    status: bookingExperience.runtime.status === 'ready' ? 'ready' : bookingExperience.runtime.status === 'unconfigured' ? 'unconfigured' : bookingExperience.runtime.status === 'migration-required' ? 'blocked' : 'unknown',
  } satisfies ContentReadinessItem

  const envReady = hasSupabasePublicConfig()
  const serviceReady = Boolean(process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)
  const readinessItems = [bookingRuntime, ...contentReadiness]
  const blockers = readinessItems.filter((item) => launchLevelForStatus(item.status) === 'blocker')
  const warnings = readinessItems.filter((item) => launchLevelForStatus(item.status) === 'warning')

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">حالة النظام</h1>
        <p className="mt-1 text-text-soft">التهيئة الحالية وأحدث أحداث النظام.</p>
      </header>

      <Card className="space-y-3 p-8">
        <CardTitle>التهيئة</CardTitle>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center justify-between rounded-xl bg-ivory/60 px-4 py-2.5">
            <span>اتصال Supabase (قراءة)</span>
            <Badge tone={envReady ? 'success' : 'pending'}>{envReady ? 'مفعّل' : 'وضع العرض'}</Badge>
          </li>
          <li className="flex items-center justify-between rounded-xl bg-ivory/60 px-4 py-2.5">
            <span>مفتاح الخادم (عمليات الإدارة والروابط الموقعة)</span>
            <Badge tone={serviceReady ? 'success' : 'pending'}>{serviceReady ? 'مفعّل' : 'غير مهيأ'}</Badge>
          </li>
          {Object.entries(flags).map(([key, enabled]) => (
            <li key={key} className="flex items-center justify-between rounded-xl bg-ivory/60 px-4 py-2.5">
              <span dir="ltr">{key}</span>
              <Badge tone={enabled ? 'success' : 'sand'}>{enabled ? 'مفعّل' : 'معطّل'}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-5 p-8">
        <div>
          <CardTitle>قائمة جاهزية المحتوى</CardTitle>
          <p className="mt-2 text-sm leading-relaxed text-text-soft">تقرأ هذه القائمة مصادر الحقيقة فقط. لا تعتبر النص المحلي أو القيم الافتراضية جاهزية للإطلاق.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-ivory/60 p-4">
            <Badge tone={blockers.length === 0 ? 'success' : 'danger'}>{blockers.length === 0 ? 'Launch Ready' : 'Launch Ready: لا'}</Badge>
            <span className="text-sm text-text-soft">{blockers.length.toLocaleString('ar-EG')} blocker · {warnings.length.toLocaleString('ar-EG')} warning</span>
          </div>
        </div>
        <ul className="space-y-3">
          {readinessItems.map((item) => {
            const launchLevel = launchLevelForStatus(item.status)
            return (
            <li key={item.id} className="rounded-2xl border border-line bg-ivory/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-bold text-deep-teal">{item.title}</h2>
                <div className="flex gap-2"><Badge tone={launchTone[launchLevel]}>{launchLabel[launchLevel]}</Badge><Badge tone={readinessTone[item.status]}>{readinessLabel[item.status]}</Badge></div>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-text-soft">{item.detail}</p>
              <a href={item.href} className="mt-3 inline-block text-sm font-semibold text-burgundy">افتحي موضع الإجراء ←</a>
            </li>
          )})}
        </ul>
      </Card>

      <Card className="p-8">
        <CardTitle className="mb-4">أحداث النظام</CardTitle>
        {events.length === 0 ? (
          <EmptyState
            className="border-0 bg-transparent"
            title="لا أحداث مسجلة"
            description="أخطاء وتنبيهات النظام تُسجَّل هنا حين تقع — الهدوء خبر جيد."
          />
        ) : (
          <ul className="divide-y divide-line/70">
            {events.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <div className="flex items-start gap-3">
                  <Badge tone={levelTones[e.level] ?? 'cobalt'}>{e.level}</Badge>
                  <div>
                    <p className="text-ink">{e.message}</p>
                    <p className="text-xs text-taupe" dir="ltr">{e.source}</p>
                  </div>
                </div>
                <span className="tnum shrink-0 text-xs text-taupe">{dateFmt.format(new Date(e.created_at))}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
