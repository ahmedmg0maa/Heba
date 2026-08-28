'use client'

import { useState } from 'react'
import {
  adminSetField,
  publishArticle,
  createArticle,
  updateSetting,
  toggleFlag,
  grantRole,
  revokeRole,
} from '@/lib/actions/cms'
import { moderateReview, type ReviewModerationAction } from '@/lib/actions/reviews'
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

export function ReviewControls({ id, featured, status = 'pending' }: { id: string; approved: boolean; featured: boolean; status?: string }) {
  const { busy, error, run } = useBusy()
  const [reason, setReason] = useState('')
  const [response, setResponse] = useState('')
  const [publishResponse, setPublishResponse] = useState(false)
  const moderate = (action: ReviewModerationAction) => run(() => moderateReview(id, action, reason, response, publishResponse))
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status !== 'approved' && <Button size="sm" variant="primary" disabled={busy} onClick={() => moderate('approve')}>اعتماد</Button>}
        {status !== 'rejected' && <Button size="sm" variant="secondary" disabled={busy} onClick={() => moderate('reject')}>رفض</Button>}
        {status === 'archived' ? <Button size="sm" variant="secondary" disabled={busy} onClick={() => moderate('restore')}>استعادة</Button> : <Button size="sm" variant="burgundy" disabled={busy} onClick={() => moderate('archive')}>أرشفة</Button>}
        {status === 'approved' && <Button size="sm" variant={featured ? 'secondary' : 'gold'} disabled={busy} onClick={() => moderate(featured ? 'unfeature' : 'feature')}>
          {featured ? 'إزالة التمييز' : 'تمييز'}
        </Button>}
        {status === 'approved' && <Button size="sm" variant="ghost" disabled={busy} onClick={() => moderate('respond')}>حفظ الرد</Button>}
      </div>
      <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} placeholder="سبب الرفض الداخلي (مطلوب عند الرفض)" className="w-full rounded-lg border border-line bg-surface-raised p-2 text-xs text-ink" />
      <textarea value={response} onChange={(event) => setResponse(event.target.value)} rows={2} placeholder="رد المالكة الاختياري" className="w-full rounded-lg border border-line bg-surface-raised p-2 text-xs text-ink" />
      <label className="flex items-center gap-2 text-xs text-text-soft"><input type="checkbox" checked={publishResponse} onChange={(event) => setPublishResponse(event.target.checked)} />نشر الرد مع التقييم المعتمد</label>
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
        <FormField label="العنوان" name="title" required minLength={3} maxLength={160} />
        <FormField label="الرابط (slug)" name="slug" required minLength={3} maxLength={80} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" hint="مثال: quiet-no" />
      </div>
      <FormField label="المقتطف" name="excerpt" required maxLength={500} />
      <FormTextarea label="المحتوى" name="content" rows={8} required maxLength={100000} />
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
        maxLength={32768}
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
        {saved && <span role="status" aria-live="polite" className="text-xs text-deep-teal">حُفظ مع نسخة استعادة ✓</span>}
        {error && <span role="alert" aria-live="polite" className="text-xs text-burgundy">{error}</span>}
      </div>
    </div>
  )
}

export function FlagToggle({ flagKey, enabled, description }: { flagKey: string; enabled: boolean; description: string }) {
  const { busy, error, run } = useBusy()
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
      {error && <p role="alert" aria-live="polite" className="text-xs text-burgundy">{error}</p>}
    </div>
  )
}

export function RoleForm() {
  const { busy, error, run } = useBusy()
  return (
    <>
    <a className="text-xs font-bold text-deep-teal underline underline-offset-4" href="/auth/admin/mfa?reauth=1&redirect=/admin/roles">تأكيد أمني حديث قبل تغيير الأدوار</a>
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
          { value: 'operations', label: 'العمليات' },
          { value: 'finance', label: 'المالية' },
          { value: 'content', label: 'إدارة المحتوى' },
          { value: 'marketing', label: 'التسويق' },
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
    </>
  )
}

export function RevokeRoleButton({ roleId, disabled = false }: { roleId: string; disabled?: boolean }) {
  const { busy, error, run } = useBusy()
  return (
    <div>
      <a className="mb-2 inline-block text-xs font-bold text-deep-teal underline underline-offset-4" href="/auth/admin/mfa?reauth=1&redirect=/admin/roles">تأكيد أمني حديث</a>
      <Button size="sm" variant="burgundy" disabled={busy || disabled} onClick={() => {
        if (window.confirm('هل تريدين سحب هذا الدور؟ سيُطبق التغيير فورًا ويُسجل في سجل التدقيق.')) run(() => revokeRole(roleId))
      }}>
        {disabled ? 'دورك الحالي' : 'سحب الدور'}
      </Button>
      {error && <p className="mt-1 text-xs text-burgundy">{error}</p>}
    </div>
  )
}
