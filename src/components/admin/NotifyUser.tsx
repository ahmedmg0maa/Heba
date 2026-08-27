'use client'

import { useRef, useState } from 'react'
import { sendUserNotification } from '@/lib/actions/admin-tools'
import { Button } from '@/components/ui/Button'

// Support tool: send a personal in-app notification to a customer.
export function NotifyUser({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [succeeded, setSucceeded] = useState(false)
  const requestId = useRef<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formElement = e.currentTarget
    const form = new FormData(formElement)
    setBusy(true)
    setMsg(null)
    setSucceeded(false)
    requestId.current ??= crypto.randomUUID()
    const res = await sendUserNotification({
      userId,
      title: String(form.get('title') ?? ''),
      body: String(form.get('body') ?? ''),
      kind: String(form.get('kind') ?? 'info'),
      link: String(form.get('link') ?? '/dashboard/notifications'),
      requestId: requestId.current,
    })
    if (res.ok) {
      setMsg('تم إرسال الإشعار وتسجيل العملية.')
      setSucceeded(true)
      requestId.current = null
      formElement.reset()
      setOpen(false)
    } else setMsg(res.error)
    setBusy(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="sm" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          إشعار
        </Button>
        {msg && <span role="status" className={`text-xs ${succeeded ? 'text-deep-teal' : 'text-burgundy'}`}>{msg}</span>}
      </div>
      {open && (
        <form onSubmit={onSubmit} className="w-72 space-y-2 rounded-xl border border-line bg-ivory/60 p-3">
          <p className="text-xs font-bold text-deep-teal">رسالة إلى {userName}</p>
          <label htmlFor={`nt-${userId}`} className="sr-only">
            العنوان
          </label>
          <input
            id={`nt-${userId}`}
            name="title"
            required
            minLength={3}
            maxLength={120}
            placeholder="العنوان"
            className="w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm"
          />
          <label htmlFor={`nb-${userId}`} className="sr-only">
            النص
          </label>
          <textarea
            id={`nb-${userId}`}
            name="body"
            rows={2}
            maxLength={1000}
            placeholder="نص الرسالة (اختياري)"
            className="w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-xs font-semibold text-text-soft">
              النوع
              <select name="kind" defaultValue="info" className="w-full rounded-lg border border-line bg-surface-raised px-2 py-2 text-sm text-text">
                <option value="info">معلومة</option>
                <option value="success">نجاح</option>
                <option value="warning">تنبيه</option>
                <option value="error">إجراء مطلوب</option>
              </select>
            </label>
            <label className="space-y-1 text-xs font-semibold text-text-soft">
              الوجهة
              <select name="link" defaultValue="/dashboard/notifications" className="w-full rounded-lg border border-line bg-surface-raised px-2 py-2 text-sm text-text">
                <option value="/dashboard/notifications">الإشعارات</option>
                <option value="/dashboard/orders">الطلبات</option>
                <option value="/dashboard/payments">المدفوعات</option>
                <option value="/dashboard/bookings">الحجوزات</option>
                <option value="/dashboard/courses">الدورات</option>
                <option value="/dashboard/books">الكتب</option>
                <option value="/dashboard/workshops">الورش</option>
              </select>
            </label>
          </div>
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? 'لحظات…' : 'إرسال'}
          </Button>
        </form>
      )}
    </div>
  )
}
