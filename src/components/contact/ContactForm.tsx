'use client'

import Link from 'next/link'
import { useState } from 'react'
import { submitContactMessage } from '@/lib/actions/contact'
import { CONTACT_PURPOSES } from '@/lib/contact/intake'
import { Card } from '@/components/ui/Card'
import { FormField, FormTextarea, FormSelect } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'

export function ContactForm({ configured }: { configured: boolean }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!configured) return
    const form = event.currentTarget
    setState('loading')
    setError(null)
    const result = await submitContactMessage(new FormData(form))
    if (result.ok) {
      form.reset()
      setState('done')
      return
    }
    setError(result.error)
    setState('error')
  }

  return (
    <Card className="p-8 md:p-10">
      {!configured ? (
        <div className="space-y-3 py-6 text-center" role="status">
          <h2 className="text-2xl font-bold text-deep-teal">قناة التواصل غير مهيّأة حاليًا</h2>
          <p className="leading-relaxed text-text-soft">
            لا يمكن إرسال رسالة من هذه البيئة قبل تهيئة قاعدة البيانات وقناة المتابعة. لم يُرسل أي محتوى.
          </p>
        </div>
      ) : state === 'done' ? (
        <div className="space-y-3 py-6 text-center" role="status" aria-live="polite">
          <svg viewBox="0 0 48 48" className="mx-auto h-14 w-14 text-deep-teal" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="24" cy="24" r="21" strokeOpacity="0.3" />
            <path d="M15 25l6 6 12-13" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="text-2xl font-bold text-deep-teal">وصلتنا رسالتك</h2>
          <p className="leading-relaxed text-text-soft">
            حُفظت الرسالة في مركز التواصل. تحدد المتابعة وفق الإجراءات والسياسات المنشورة.
          </p>
          <Button type="button" variant="secondary" onClick={() => setState('idle')}>إرسال رسالة أخرى</Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" aria-busy={state === 'loading'}>
          <div className="sr-only" aria-hidden="true">
            <label>الموقع الإلكتروني<input name="website" tabIndex={-1} autoComplete="off" /></label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="الاسم" name="name" autoComplete="name" minLength={2} maxLength={120} required />
            <FormField label="البريد الإلكتروني" name="email" type="email" autoComplete="email" maxLength={254} required dir="ltr" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="رقم الهاتف (اختياري)" name="phone" type="tel" autoComplete="tel" maxLength={40} dir="ltr" />
            <FormSelect label="غرض التواصل" name="purpose" required options={[...CONTACT_PURPOSES]} />
          </div>
          <FormTextarea label="رسالتك" name="message" rows={6} minLength={10} maxLength={5000} required />
          <label className="flex items-start gap-3 text-sm leading-relaxed text-text-soft">
            <input name="privacy_consent" type="checkbox" required className="mt-1 h-5 w-5 shrink-0 accent-deep-teal" />
            <span>أوافق على استخدام بياناتي للرد على هذه الرسالة وفق <Link href="/privacy" className="font-bold text-deep-teal underline underline-offset-4">سياسة الخصوصية</Link>.</span>
          </label>
          {error && (
            <p className="rounded-xl bg-burgundy/10 px-4 py-3 text-sm font-medium text-burgundy" role="alert" aria-live="assertive">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" disabled={state === 'loading'} className="w-full">
            {state === 'loading' ? 'جارٍ الإرسال…' : 'أرسلي الرسالة'}
          </Button>
        </form>
      )}
    </Card>
  )
}
