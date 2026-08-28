'use client'

import { useState } from 'react'
import { archiveProtectedDelivery } from '@/lib/actions/delivery-admin'
import { Button } from '@/components/ui/Button'

type Kind = 'book' | 'lesson-video' | 'lesson-resource' | 'workshop-resource' | 'workshop-recording'
type Item = { id: string; title: string; detail?: string }

export function ProtectedDeliveryItems({
  kind,
  entityId,
  items,
  label = 'ملفات التسليم الحالية',
}: {
  kind: Kind
  entityId: string
  items: Item[]
  label?: string
}) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  async function remove(item: Item) {
    if (!window.confirm(`إزالة «${item.title}» من تسليم العميلات؟ سيُحفظ السجل الإداري ولن يعود الملف متاحًا.`)) return
    setBusyId(item.id)
    setMessage(null)
    setFailed(false)
    try {
      const result = await archiveProtectedDelivery(kind, entityId, item.id)
      if (!result.ok) {
        setFailed(true)
        setMessage(result.error)
        return
      }
      if (result.data.storageOutcome === 'failed') {
        setFailed(true)
        setMessage(result.data.evidenceRecorded
          ? 'أُزيل الملف من التسليم، لكن حذف كائن التخزين فشل وسُجّل للتسوية.'
          : 'أُزيل الملف من التسليم، لكن تعذّر حذف كائن التخزين وتسجيل دليل التسوية.')
        return
      }
      if (!result.data.evidenceRecorded) {
        setFailed(true)
        setMessage('أُزيل الملف من التسليم، لكن تعذّر تسجيل نتيجة تنظيف التخزين. راجعي سجل النظام.')
        return
      }
      setMessage(result.data.storageOutcome === 'removed'
        ? 'أُزيل الملف من التسليم والتخزين بأمان.'
        : 'أُزيل الربط من التسليم مع حفظ الملف التاريخي غير المُدار.')
    } catch {
      setFailed(true)
      setMessage('تعذّر إكمال إزالة ملف التسليم.')
    } finally {
      setBusyId(null)
    }
  }

  if (items.length === 0) return null
  return (
    <section className="rounded-xl border border-line bg-surface-raised p-3" aria-label={label}>
      <p className="mb-2 text-xs font-bold text-deep-teal">{label}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-ivory/45 px-3 py-2">
            <span className="min-w-0 text-xs text-ink">
              <span className="block truncate font-semibold">{item.title}</span>
              {item.detail && <span className="text-taupe">{item.detail}</span>}
            </span>
            <Button variant="burgundy" size="sm" disabled={busyId !== null} onClick={() => remove(item)}>
              {busyId === item.id ? 'جارٍ الإزالة…' : 'إزالة من التسليم'}
            </Button>
          </li>
        ))}
      </ul>
      {message && <p role={failed ? 'alert' : 'status'} aria-live="polite" className="mt-2 text-xs font-semibold text-deep-teal">{message}</p>}
    </section>
  )
}
