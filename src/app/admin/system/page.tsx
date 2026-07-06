import type { Metadata } from 'next'
import { adminList, getFeatureFlags } from '@/lib/data/cms'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata: Metadata = { title: 'حالة النظام — الإدارة' }

type EventRow = { id: string; level: string; source: string; message: string; created_at: string }

const dateFmt = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

const levelTones: Record<string, 'danger' | 'pending' | 'cobalt' | 'sand'> = {
  error: 'danger',
  warn: 'pending',
  info: 'cobalt',
  debug: 'sand',
}

export default async function AdminSystemPage() {
  const [events, flags] = await Promise.all([
    adminList<EventRow>('system_events', 'id, level, source, message, created_at', { orderBy: 'created_at', limit: 50 }),
    getFeatureFlags(),
  ])

  const envReady = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const serviceReady = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

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
