import type { Metadata } from 'next'
import { adminList } from '@/lib/data/cms'
import { Card, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { SettingEditor, FlagToggle } from '@/components/admin/AdminControls'

export const metadata: Metadata = { title: 'الإعدادات — الإدارة' }

type SettingRow = { key: string; value: unknown; is_public: boolean }
type FlagRow = { key: string; is_enabled: boolean; description: string }

export default async function AdminSettingsPage() {
  const [settings, flags] = await Promise.all([
    adminList<SettingRow>('site_settings', 'key, value, is_public', { orderBy: 'key', ascending: true }),
    adminList<FlagRow>('feature_flags', 'key, is_enabled, description', { orderBy: 'key', ascending: true }),
  ])

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">الإعدادات</h1>
        <p className="mt-1 text-text-soft">
          بيانات الدفع ومهلة الطلبات والروابط — تُستخدم مباشرة في صفحة الدفع والواجهة العامة.
        </p>
      </header>

      <Card className="space-y-6 p-8">
        <CardTitle>إعدادات الموقع</CardTitle>
        {settings.length === 0 ? (
          <EmptyState
            className="border-0 bg-transparent"
            title="لا إعدادات محفوظة"
            description="تُنشأ المفاتيح الافتراضية مع سكربت البيانات التجريبية، ويمكن تعديلها من هنا فور ربط قاعدة البيانات."
          />
        ) : (
          <div className="space-y-6">
            {settings.map((s) => (
              <SettingEditor key={s.key} settingKey={s.key} initialValue={JSON.stringify(s.value, null, 2)} />
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-4 p-8">
        <CardTitle>مفاتيح الميزات</CardTitle>
        {flags.length === 0 ? (
          <EmptyState
            className="border-0 bg-transparent"
            title="لا مفاتيح بعد"
            description="مفاتيح الميزات تتحكم في ظهور أقسام مثل ورش العمل وبرنامج VIP."
          />
        ) : (
          <div className="space-y-3">
            {flags.map((f) => (
              <FlagToggle key={f.key} flagKey={f.key} enabled={f.is_enabled} description={f.description} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
