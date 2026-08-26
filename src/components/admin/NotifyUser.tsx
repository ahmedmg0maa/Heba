'use client'

import { useState } from 'react'
import { sendUserNotification } from '@/lib/actions/admin-tools'
import { Button } from '@/components/ui/Button'

// Support tool: send a personal in-app notification to a customer.
export function NotifyUser({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setBusy(true)
    setMsg(null)
    const res = await sendUserNotification(userId, String(form.get('title')), String(form.get('body') ?? ''))
    if (res.ok) {
      setMsg('أُرسل ✓')
      setOpen(false)
    } else setMsg(res.error)
    setBusy(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
          إشعار
        </Button>
        {msg && <span className="text-xs text-deep-teal">{msg}</span>}
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
            placeholder="نص الرسالة (اختياري)"
            className="w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm"
          />
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? 'لحظات…' : 'إرسال'}
          </Button>
        </form>
      )}
    </div>
  )
}
