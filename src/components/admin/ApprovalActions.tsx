'use client'

import { useState } from 'react'
import { approvePayment, rejectPayment, getProofUrl } from '@/lib/actions/admin'
import { Button } from '@/components/ui/Button'

export function ApprovalActions({ paymentId, hasProof }: { paymentId: string; hasProof: boolean }) {
  const [busy, setBusy] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onViewProof() {
    setError(null)
    const res = await getProofUrl(paymentId)
    if (res.ok) window.open(res.data.url, '_blank', 'noopener')
    else setError(res.error)
  }

  async function onApprove() {
    setBusy(true)
    setError(null)
    const res = await approvePayment(paymentId)
    if (!res.ok) setError(res.error)
    setBusy(false)
  }

  async function onReject() {
    setBusy(true)
    setError(null)
    const res = await rejectPayment(paymentId, reason)
    if (!res.ok) setError(res.error)
    else setRejecting(false)
    setBusy(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <a className="text-xs font-bold text-deep-teal underline underline-offset-4" href="/auth/admin/mfa?reauth=1&redirect=/admin/payments">تأكيد أمني حديث</a>
        {hasProof && (
          <Button variant="ghost" size="sm" onClick={onViewProof}>
            عرض الإيصال
          </Button>
        )}
        <Button size="sm" disabled={busy} onClick={onApprove}>
          اعتماد
        </Button>
        <Button variant="burgundy" size="sm" disabled={busy} onClick={() => setRejecting((v) => !v)}>
          رفض
        </Button>
      </div>
      {rejecting && (
        <div className="flex items-center gap-2">
          <label htmlFor={`reason-${paymentId}`} className="sr-only">
            سبب الرفض
          </label>
          <input
            id={`reason-${paymentId}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-52 rounded-lg border border-line bg-surface-raised px-3 py-1.5 text-sm"
          />
          <Button variant="burgundy" size="sm" disabled={busy || reason.trim().length < 3} onClick={onReject}>
            تأكيد الرفض
          </Button>
        </div>
      )}
      {error && (
        <p className="text-xs font-medium text-burgundy" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
