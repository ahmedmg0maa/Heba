'use client'

import { useState } from 'react'
import {
  adminSetField,
  publishArticle,
  createArticle,
  deleteReview,
  setBookingStatus,
  updateSetting,
  toggleFlag,
  grantRole,
  revokeRole,
} from '@/lib/actions/cms'
import { Button } from '@/components/ui/Button'
import { FormField, FormTextarea, FormSelect } from '@/components/ui/FormField'

function useBusy() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true)
    setError(null)
    const res = await fn()
    if (!res.ok) setError(res.error ?? 'حدث خطأ.')
    setBusy(false)
    return res.ok
  }
  return { busy, error, run }
}

export function PublishToggle({
  table,
  id,
  published,
  isArticle = false,
}: {
  table: string
  id: string
  published: boolean
  isArticle?: boolean
}) {
  const { busy, error, run } = useBusy()
  return (
    <div>
      <Button
        variant={published ? 'secondary' : 'primary'}
        size="sm"
        disabled={busy}
        onClick={() =>
          run(() => (isArticle ? publishArticle(id, !published) : adminSetField(table, id, 'is_published', !published)))
        }
      >
        {published ? 'إخفاء' : 'نشر'}
      </Button>
      {error && <p className="mt-1 text-xs text-burgundy">{error}</p>}
    </div>
  )
}

export function ReviewControls({ id, approved, featured }: { id: string; approved: boolean; featured: boolean }) {
  const { busy, error, run } = useBusy()
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={approved ? 'secondary' : 'primary'} disabled={busy} onClick={() => run(() => adminSetField('reviews', id, 'is_approved', !approved))}>
          {approved ? 'إلغاء الاعتماد' : 'اعتماد'}
        </Button>
        <Button size="sm" variant={featured ? 'secondary' : 'gold'} disabled={busy} onClick={() => run(() => adminSetField('reviews', id, 'is_featured', !featured))}>
          {featured ? 'إزالة التمييز' : 'تمييز'}
        </Button>
        <Button size="sm" variant="burgundy" disabled={busy} onClick={() => run(() => deleteReview(id))}>
          حذف
        </Button>
      </div>
      {error && <p className="text-xs text-burgundy">{error}</p>}
    </div>
  )
}

export function BookingControls({ id, status }: { id: string; status: string }) {
  const { busy, error, run } = useBusy()
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2">
        {status === 'pending' && (
          <Button size="sm" disabled={busy} onClick={() => run(() => setBookingStatus(id, 'confirmed'))}>
            تأكيد
          </Button>
        )}
        {(status === 'pending' || status === 'confirmed') && (
          <>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => run(() => setBookingStatus(id, 'completed'))}>
              اكتملت
            </Button>
            <Button size="sm" variant="burgundy" disabled={busy} onClick={() => run(() => setBookingStatus(id, 'cancelled'))}>
              إلغاء
            </Button>
          </>
        )}
        {status === 'confirmed' && (
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(() => setBookingStatus(id, 'no_show'))}>
            تغيّب
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-burgundy">{error}</p>}
    </div>
  )
}

export function ArticleForm() {
  const { busy, error, run } = useBusy()
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        const form = e.currentTarget
        const ok = await run(() => createArticle(new FormData(form)))
        if (ok) form.reset()
      }}
      className="grid gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="العنوان" name="title" required />
        <FormField label="الرابط (slug)" name="slug" required dir="ltr" hint="مثال: quiet-no" />
      </div>
      <FormField label="المقتطف" name="excerpt" required />
      <FormTextarea label="المحتوى" name="content" rows={8} required />
      {error && (
        <p className="rounded-xl bg-burgundy/10 px-4 py-3 text-sm font-medium text-burgundy" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy} className="justify-self-start">
        {busy ? 'لحظات…' : 'حفظ كمسودة'}
      </Button>
    </form>
  )
}

export function SettingEditor({ settingKey, initialValue }: { settingKey: string; initialValue: string }) {
  const { busy, error, run } = useBusy()
  const [value, setValue] = useState(initialValue)
  const [saved, setSaved] = useState(false)
  return (
    <div className="space-y-2">
      <label htmlFor={`setting-${settingKey}`} className="block text-sm font-bold text-deep-teal" dir="ltr">
        {settingKey}
      </label>
      <textarea
        id={`setting-${settingKey}`}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setSaved(false)
        }}
        rows={3}
        dir="ltr"
        className="w-full rounded-xl border border-line bg-ivory/50 px-4 py-3 font-mono text-xs text-ink focus:border-deep-teal focus:outline-2 focus:outline-deep-teal/20"
      />
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={async () => {
            const ok = await run(() => updateSetting(settingKey, value))
            setSaved(ok)
          }}
        >
          حفظ
        </Button>
        {saved && <span className="text-xs text-deep-teal">حُفظ ✓</span>}
        {error && <span className="text-xs text-burgundy">{error}</span>}
      </div>
    </div>
  )
}

export function FlagToggle({ flagKey, enabled, description }: { flagKey: string; enabled: boolean; description: string }) {
  const { busy, run } = useBusy()
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-ivory/60 px-4 py-3">
      <div>
        <p className="text-sm font-bold text-deep-teal" dir="ltr">
          {flagKey}
        </p>
        <p className="text-xs text-text-soft">{description}</p>
      </div>
      <Button size="sm" variant={enabled ? 'secondary' : 'primary'} disabled={busy} onClick={() => run(() => toggleFlag(flagKey, !enabled))}>
        {enabled ? 'تعطيل' : 'تفعيل'}
      </Button>
    </div>
  )
}

export function RoleForm() {
  const { busy, error, run } = useBusy()
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        const form = e.currentTarget
        const ok = await run(() => grantRole(new FormData(form)))
        if (ok) form.reset()
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <FormField label="بريد العضوة" name="email" type="email" required dir="ltr" className="min-w-64 flex-1" />
      <FormSelect
        label="الدور"
        name="role"
        options={[
          { value: 'admin', label: 'مديرة' },
          { value: 'support', label: 'دعم' },
          { value: 'editor', label: 'محررة' },
          { value: 'owner', label: 'مالكة' },
        ]}
        className="w-40"
      />
      <Button type="submit" disabled={busy}>
        منح الدور
      </Button>
      {error && <p className="w-full text-xs text-burgundy">{error}</p>}
    </form>
  )
}

export function RevokeRoleButton({ roleId }: { roleId: string }) {
  const { busy, error, run } = useBusy()
  return (
    <div>
      <Button size="sm" variant="burgundy" disabled={busy} onClick={() => run(() => revokeRole(roleId))}>
        سحب الدور
      </Button>
      {error && <p className="mt-1 text-xs text-burgundy">{error}</p>}
    </div>
  )
}
