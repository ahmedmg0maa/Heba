'use client'

import { useState } from 'react'
import { manageOrderRefund, updateOrderStatus } from '@/lib/actions/admin'
import { Button } from '@/components/ui/Button'

export function OrderActions({ orderId, status, canUpdate, canRefund }: { orderId: string; status: string; canUpdate: boolean; canRefund: boolean }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [evidence, setEvidence] = useState('')

  async function cancel() {
    setBusy(true)
    setError(null)
    setSuccess(null)
    const res = await updateOrderStatus(orderId, 'cancelled', reason)
    if (!res.ok) setError(res.error)
    else setSuccess('أُلغي الطلب وإشعار العميلة وسُجلت العملية.')
    setBusy(false)
  }

  async function refund(action: 'initiate' | 'complete' | 'fail') {
    if (action === 'complete' && !window.confirm('هل أُعيد المبلغ فعلًا؟ سيؤدي التأكيد إلى سحب الاستحقاقات المرتبطة بالطلب.')) return
    setBusy(true)
    setError(null)
    setSuccess(null)
    const res = await manageOrderRefund(orderId, action, { reason, evidenceReference: evidence })
    if (!res.ok) setError(res.error)
    else setSuccess(action === 'initiate' ? 'بدأت معالجة الاسترداد دون سحب الوصول.' : action === 'complete' ? 'اكتمل الاسترداد وسُحبت الاستحقاقات.' : 'سُجل فشل الاسترداد وبقي وصول العميلة فعالًا.')
    setBusy(false)
  }

  const showCancel = canUpdate && (status === 'pending_payment' || status === 'awaiting_review')
  const showRefundStart = canRefund && status === 'paid'
  const showRefundResolution = canRefund && status === 'refund_pending'
  if (!showCancel && !showRefundStart && !showRefundResolution) return <span className="text-xs text-taupe">—</span>

  return (
    <div className="space-y-1">
      <div className="grid min-w-64 gap-2">
        {(showRefundStart || showRefundResolution) && <a className="text-xs font-bold text-deep-teal underline underline-offset-4" href="/auth/admin/mfa?reauth=1&redirect=/admin/orders">تأكيد أمني حديث قبل الاسترداد</a>}
        {(showCancel || showRefundStart) && <label className="text-xs font-semibold text-deep-teal">{showCancel ? 'سبب الإلغاء' : 'سبب الاسترداد'}<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={2} className="mt-1 w-full rounded-lg border border-line bg-surface-raised p-2 text-xs text-ink" /></label>}
        {showCancel && (
          <Button variant="secondary" size="sm" disabled={busy || reason.trim().length < 3} onClick={cancel}>
            إلغاء
          </Button>
        )}
        {showRefundStart && (
          <Button variant="burgundy" size="sm" disabled={busy || reason.trim().length < 3} onClick={() => refund('initiate')}>
            بدء معالجة الاسترداد
          </Button>
        )}
        {showRefundResolution && <>
          <label className="text-xs font-semibold text-deep-teal">مرجع إعادة المبلغ<input value={evidence} onChange={(event) => setEvidence(event.target.value)} maxLength={120} className="mt-1 min-h-10 w-full rounded-lg border border-line bg-surface-raised px-2 text-xs text-ink" placeholder="مرجع التحويل أو الإيصال" /></label>
          <Button variant="burgundy" size="sm" disabled={busy || evidence.trim().length < 3} onClick={() => refund('complete')}>تأكيد إتمام الاسترداد</Button>
          <label className="text-xs font-semibold text-deep-teal">سبب تعذّر الاسترداد<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={2} className="mt-1 w-full rounded-lg border border-line bg-surface-raised p-2 text-xs text-ink" /></label>
          <Button variant="secondary" size="sm" disabled={busy || reason.trim().length < 3} onClick={() => refund('fail')}>تسجيل فشل الاسترداد</Button>
        </>}
      </div>
      {error && (
        <p className="text-xs font-medium text-burgundy" role="alert">
          {error}
        </p>
      )}
      {success && <p className="text-xs font-semibold text-deep-teal" role="status">{success}</p>}
    </div>
  )
}
