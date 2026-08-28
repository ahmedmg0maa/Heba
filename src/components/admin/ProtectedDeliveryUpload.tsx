'use client'

import { type FormEvent, useState } from 'react'
import { abandonProtectedUpload, beginProtectedUpload, finalizeProtectedUpload } from '@/lib/actions/delivery-admin'
import { getBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

type Kind = 'book' | 'lesson-video' | 'lesson-resource' | 'workshop-resource' | 'workshop-recording'

export function ProtectedDeliveryUpload({ kind, entityId, label }: { kind: Kind; entityId: string; label: string }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [progress, setProgress] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const file = form.get('file')
    if (!(file instanceof File) || !file.size) return

    setBusy(true)
    setFailed(false)
    setMessage(null)
    try {
      setProgress('تجهيز الرفع…')
      const start = await beginProtectedUpload(kind, entityId, { name: file.name, type: file.type, size: file.size })
      if (!start.ok) {
        setFailed(true)
        setMessage(start.error)
        return
      }

      setProgress('جارٍ الرفع المباشر إلى التخزين…')
      const upload = await getBrowserClient().storage
        .from(start.data.bucket)
        .uploadToSignedUrl(start.data.path, start.data.token, file, { contentType: file.type })
      if (upload.error) {
        await abandonProtectedUpload(kind, entityId, { intentId: start.data.intentId, path: start.data.path })
        setFailed(true)
        setMessage('تعذّر رفع الملف.')
        return
      }

      setProgress('فحص الملف وربطه بالمحتوى…')
      const done = await finalizeProtectedUpload(kind, entityId, {
        intentId: start.data.intentId,
        path: start.data.path,
        title: String(form.get('title') || file.name),
        format: String(form.get('version') || '1.0'),
        published: form.get('published') === 'on',
      })
      setFailed(!done.ok)
      setMessage(done.ok ? 'تم الرفع والفحص والربط بنجاح.' : done.error)
      if (done.ok) formElement.reset()
    } catch {
      setFailed(true)
      setMessage('تعذّر إكمال الرفع الآمن. حاولي مرة أخرى.')
    } finally {
      setProgress('')
      setBusy(false)
    }
  }

  const accept = kind === 'book'
    ? '.pdf,.epub'
    : kind.includes('video') || kind === 'workshop-recording'
      ? '.mp4,.webm,.mov'
      : '.pdf,.zip,.mp3,.wav,.m4a'

  return (
    <form className="grid gap-2 rounded-xl border border-line bg-ivory/35 p-3" onSubmit={submit}>
      <p className="text-sm font-bold text-deep-teal">{label}</p>
      <input
        name="title"
        maxLength={180}
        disabled={busy}
        placeholder="عنوان الملف"
        className="min-h-10 rounded-lg border border-line bg-surface-raised px-3 text-sm text-ink"
      />
      {kind === 'book' && (
        <input
          name="version"
          maxLength={30}
          defaultValue="1.0"
          disabled={busy}
          aria-label="رقم الإصدار"
          className="min-h-10 rounded-lg border border-line bg-surface-raised px-3 text-sm text-ink"
        />
      )}
      <input name="file" type="file" required disabled={busy} className="text-xs text-text-soft" accept={accept} />
      {kind === 'workshop-recording' && (
        <label className="flex items-center gap-2 text-xs font-semibold text-deep-teal">
          <input type="checkbox" name="published" disabled={busy} className="accent-deep-teal" />
          نشر التسجيل للمسجلات فورًا
        </label>
      )}
      <Button type="submit" size="sm" disabled={busy}>{busy ? 'جارٍ الرفع…' : 'رفع آمن مباشر'}</Button>
      {progress && <p role="status" aria-live="polite" className="text-xs text-text-soft">{progress}</p>}
      {message && <p role={failed ? 'alert' : 'status'} className="text-xs font-semibold text-deep-teal">{message}</p>}
    </form>
  )
}
