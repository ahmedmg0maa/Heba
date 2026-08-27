'use client'

import { useState } from 'react'
import { approvePayment, rejectPayment, getProofUrl } from '@/lib/actions/admin'
import { Button } from '@/components/ui/Button'

export function ApprovalActions({ paymentId, hasProof, canApprove, canReject }: { paymentId: string; hasProof: boolean; canApprove: boolean; canReject: boolean }) {
  const [busy, setBusy] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [reviewed, setReviewed] = useState(false)

  async function onViewProof() {
    setError(null)
    setSuccess(null)
    const res = await getProofUrl(paymentId)
    if (res.ok) { setReviewed(true); window.open(res.data.url, '_blank', 'noopener') }
    else setError(res.error)
  }

  async function onApprove() {
    setBusy(true)
    setError(null)
    setSuccess(null)
    const res = await approvePayment(paymentId)
    if (!res.ok) setError(res.error)
    else setSuccess('تم اعتماد الدفعة وتفعيل الاستحقاقات مرة واحدة.')
    setBusy(false)
  }

  async function onReject() {
    setBusy(true)
    setError(null)
    setSuccess(null)
    const res = await rejectPayment(paymentId, reason)
    if (!res.ok) setError(res.error)
    else { setRejecting(false); setSuccess('تم رفض الإيصال وإبلاغ العميلة بإمكانية إعادة الرفع.') }
    setBusy(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {(canApprove || canReject) && <a className="text-xs font-bold text-deep-teal underline underline-offset-4" href="/auth/admin/mfa?reauth=1&redirect=/admin/payments">تأكيد أمني حديث</a>}
        {hasProof && (
          <Button variant="ghost" size="sm" onClick={onViewProof}>
            عرض الإيصال
          </Button>
        )}
        {canApprove && <Button size="sm" disabled={busy || !hasProof || !reviewed} onClick={onApprove}>
          اعتماد
        </Button>}
        {canReject && <Button variant="burgundy" size="sm" disabled={busy} onClick={() => setRejecting((v) => !v)}>
          رفض
        </Button>}
      </div>
      {canApprove && !hasProof && <p className="text-xs font-semibold text-burgundy">لا يمكن الاعتماد قبل وجود إيصال.</p>}
      {canApprove && hasProof && !reviewed && <p className="text-xs font-semibold text-taupe">افتحي الإيصال وراجعيه لتفعيل زر الاعتماد لمدة 30 دقيقة.</p>}
      {canReject && rejecting && (
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
      {success && <p className="text-xs font-semibold text-deep-teal" role="status">{success}</p>}
    </div>
  )
}
