'use client'

import { useState } from 'react'
import { addModule, addLesson } from '@/lib/actions/cms'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'

export function ModuleForm({ courseId }: { courseId: string }) {
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError(null)
        const res = await addModule(courseId, title)
        if (res.ok) setTitle('')
        else setError(res.error)
        setBusy(false)
      }}
      className="flex items-end gap-3"
    >
      <div className="flex-1">
        <label htmlFor="module-title" className="mb-1.5 block text-sm font-semibold text-deep-teal">
          وحدة جديدة
        </label>
        <input
          id="module-title"
          value={title}
          maxLength={160}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-line bg-surface-raised px-4 py-2.5 text-ink focus:border-deep-teal focus:outline-2 focus:outline-deep-teal/20"
        />
      </div>
      <Button type="submit" disabled={busy || title.trim().length < 2}>
        إضافة وحدة
      </Button>
      {error && <p className="w-full text-xs text-burgundy">{error}</p>}
    </form>
  )
}

export function LessonForm({ moduleId, courseId }: { moduleId: string; courseId: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        const form = e.currentTarget
        setBusy(true)
        setError(null)
        const res = await addLesson(moduleId, courseId, new FormData(form))
        if (res.ok) form.reset()
        else setError(res.error)
        setBusy(false)
      }}
      className="grid gap-3 rounded-xl bg-ivory/60 p-4 sm:grid-cols-[2fr_1fr_auto_auto]"
    >
      <FormField label="عنوان الدرس" name="title" required maxLength={180} />
      <FormField label="الدقائق" name="minutes" type="number" min={0} max={1440} dir="ltr" />
      <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-ink">
        <input type="checkbox" name="is_preview" className="h-4 w-4 accent-deep-teal" />
        معاينة
      </label>
      <Button type="submit" size="sm" disabled={busy} className="self-end">
        إضافة
      </Button>
      <p className="text-xs text-text-soft sm:col-span-4">أضيفي الفيديو والملفات من أدوات الرفع الآمن بعد إنشاء الدرس.</p>
      {error && <p role="alert" className="text-xs text-burgundy sm:col-span-4">{error}</p>}
    </form>
  )
}
