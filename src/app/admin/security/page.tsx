import type { Metadata } from 'next'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export const metadata: Metadata = { title: 'الأمان — الإدارة' }

const controls = [
  { name: 'عزل الصفوف (RLS) مفعّل على كل الجداول', detail: 'كل جدول من جداول المنصة محكوم بسياسات وصول — العميلة ترى بياناتها فقط.' },
  { name: 'المحتوى المحمي عبر روابط موقّتة', detail: 'الكتب والفيديوهات والملفات تُقدَّم بروابط موقعة قصيرة العمر (١٠–٦٠ دقيقة) بعد التحقق من الشراء.' },
  { name: 'إيصالات الدفع في مخزن خاص', detail: 'لا يصل إليها إلا صاحبة الإيصال وفريق المراجعة.' },
  { name: 'مفتاح service_role على الخادم فقط', detail: 'لا يظهر في كود المتصفح أبدًا، ويفحصه audit:security آليًا مع كل بناء.' },
  { name: 'حراسة مزدوجة لمسارات الإدارة', detail: 'Middleware + فحص الدور في الطبقة الخادمية + إعادة فحص داخل كل إجراء إداري.' },
  { name: 'سجل تدقيق شامل', detail: 'الموافقات والرفض والمنح وتغييرات الإعدادات كلها مسجلة بهوية المنفِّذة.' },
  { name: 'التحقق من الأسعار على الخادم', detail: 'الخصومات والكوبونات تُحسب في الخادم — لا يمكن التلاعب بها من المتصفح.' },
]

export default function AdminSecurityPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">الأمان</h1>
        <p className="mt-1 text-text-soft">وضع الحماية الحالي للمنصة — يُراجع تلقائيًا مع كل بناء عبر audit:security.</p>
      </header>

      <Card className="space-y-5 p-8">
        <CardTitle>ضوابط مفعّلة</CardTitle>
        <ul className="space-y-4">
          {controls.map((c) => (
            <li key={c.name} className="flex gap-3">
              <Badge tone="success" className="mt-0.5 h-fit shrink-0">✓</Badge>
              <div>
                <p className="font-bold text-ink">{c.name}</p>
                <p className="text-sm leading-relaxed text-text-soft">{c.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-8">
        <CardTitle className="mb-3">توصيات التشغيل</CardTitle>
        <ul className="list-inside space-y-2 text-sm leading-relaxed text-text-soft">
          <li>• فعّلي تأكيد البريد الإلكتروني في إعدادات Supabase Auth.</li>
          <li>• جدولي <span dir="ltr">expire_stale_orders()</span> عبر pg_cron (التعليمات في migration 011).</li>
          <li>• راجعي سجل التدقيق أسبوعيًا وأي أحداث رفض متكررة لنفس الحساب.</li>
          <li>• امنحي أدنى دور كافٍ لكل عضوة فريق (دعم/محررة بدل مديرة).</li>
        </ul>
      </Card>
    </div>
  )
}
