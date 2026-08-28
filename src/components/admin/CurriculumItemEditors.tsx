'use client'

import { type FormEvent, useState } from 'react'
import { deleteCourseLesson, deleteCourseModule, updateCourseLesson, updateCourseModule } from '@/lib/actions/cms'
import { Button } from '@/components/ui/Button'

const input = 'min-h-9 rounded-lg border border-line bg-surface-raised px-2 text-sm text-ink disabled:opacity-60'

function ResultMessage({ message, failed }: { message: string | null; failed: boolean }) {
  return message ? <span role={failed ? 'alert' : 'status'} className="w-full text-xs font-semibold text-deep-teal">{message}</span> : null
}

export function ModuleEditor({ id, courseId, title, sort }: { id: string; courseId: string; title: string; sort: number }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setBusy(true)
    try {
      const result = await updateCourseModule(id, courseId, String(form.get('title')), Number(form.get('sort')))
      setFailed(!result.ok)
      setMessage(result.ok ? 'حُفظت الوحدة.' : result.error)
    } catch {
      setFailed(true); setMessage('تعذّر حفظ الوحدة.')
    } finally { setBusy(false) }
  }

  async function remove() {
    if (!window.confirm('هل تريدين حذف هذه الوحدة الخالية؟')) return
    setBusy(true)
    try {
      const result = await deleteCourseModule(id, courseId)
      setFailed(!result.ok)
      setMessage(result.ok ? 'حُذفت الوحدة.' : result.error)
    } catch {
      setFailed(true); setMessage('تعذّر حذف الوحدة.')
    } finally { setBusy(false) }
  }

  return <details><summary className="cursor-pointer text-xs font-bold text-antique-gold">تعديل الوحدة</summary><form className="mt-2 flex flex-wrap gap-2" onSubmit={save}><input name="title" maxLength={160} required disabled={busy} defaultValue={title} aria-label="عنوان الوحدة" className={input}/><input name="sort" type="number" min="1" max="10000" required disabled={busy} defaultValue={sort} aria-label="ترتيب الوحدة" className={`w-20 ${input}`}/><Button type="submit" size="sm" disabled={busy}>حفظ</Button><Button type="button" size="sm" variant="burgundy" disabled={busy} onClick={remove}>حذف</Button><ResultMessage message={message} failed={failed}/></form></details>
}

export function LessonEditor({ id, courseId, title, minutes, sort, preview }: { id: string; courseId: string; title: string; minutes: number; sort: number; preview: boolean }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    try {
      const result = await updateCourseLesson(id, courseId, new FormData(event.currentTarget))
      setFailed(!result.ok)
      setMessage(result.ok ? 'حُفظ الدرس.' : result.error)
    } catch {
      setFailed(true); setMessage('تعذّر حفظ الدرس.')
    } finally { setBusy(false) }
  }

  async function remove() {
    if (!window.confirm('هل تريدين حذف هذا الدرس الخالي من الملفات وسجل العميلات؟')) return
    setBusy(true)
    try {
      const result = await deleteCourseLesson(id, courseId)
      setFailed(!result.ok)
      setMessage(result.ok ? 'حُذف الدرس.' : result.error)
    } catch {
      setFailed(true); setMessage('تعذّر حذف الدرس.')
    } finally { setBusy(false) }
  }

  return <details><summary className="cursor-pointer text-xs font-bold text-antique-gold">تعديل الدرس</summary><form className="mt-2 grid gap-2 sm:grid-cols-4" onSubmit={save}><input name="title" maxLength={180} required disabled={busy} defaultValue={title} aria-label="عنوان الدرس" className={`sm:col-span-2 ${input}`}/><input name="minutes" type="number" min="0" max="1440" required disabled={busy} defaultValue={minutes} aria-label="مدة الدرس بالدقائق" className={input}/><input name="sort" type="number" min="1" max="10000" required disabled={busy} defaultValue={sort} aria-label="ترتيب الدرس" className={input}/><label className="flex items-center gap-2 text-xs"><input type="checkbox" name="is_preview" disabled={busy} defaultChecked={preview}/>معاينة</label><Button type="submit" size="sm" disabled={busy}>حفظ</Button><Button type="button" size="sm" variant="burgundy" disabled={busy} onClick={remove}>حذف</Button><div className="sm:col-span-4"><ResultMessage message={message} failed={failed}/></div></form></details>
}
