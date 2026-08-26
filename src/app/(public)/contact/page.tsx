'use client'

import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabase/client'
import { PageHero } from '@/components/catalog/PageHero'
import { Card } from '@/components/ui/Card'
import { FormField, FormTextarea, FormSelect } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'

export default function ContactPage() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const contactIsConfigured = hasSupabasePublicConfig()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!contactIsConfigured) return
    setState('loading')
    const form = new FormData(e.currentTarget)
    try {
      const { error } = await getBrowserClient().from('contact_messages').insert({
        name: String(form.get('name')),
        email: String(form.get('email')),
        phone: String(form.get('phone') || '') || null,
        subject: String(form.get('subject')),
        message: String(form.get('message')),
      })
      if (error) throw error
      setState('done')
    } catch {
      setState('error')
    }
  }

  return (
    <main>
      <PageHero
        eyebrow="التواصل"
        title="نسمعك باهتمام"
        lead="سؤال أو اقتراح أو مشكلة في طلبك: يظهر نموذج الرسائل عند تهيئة قناة التواصل في المنصة."
      />

      <div className="mx-auto max-w-2xl px-6 py-16">
        <Card className="p-8 md:p-10">
          {!contactIsConfigured ? (
            <div className="space-y-3 py-6 text-center" role="status">
              <h2 className="text-2xl font-bold text-deep-teal">قناة التواصل غير مهيّأة حاليًا</h2>
              <p className="leading-relaxed text-text-soft">
                لا يمكن إرسال رسالة من هذه البيئة قبل تهيئة قاعدة البيانات وقناة المتابعة. لم يُرسل أي محتوى من النموذج.
              </p>
            </div>
          ) : state === 'done' ? (
            <div className="space-y-3 py-6 text-center">
              <svg viewBox="0 0 48 48" className="mx-auto h-14 w-14 text-deep-teal" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="24" cy="24" r="21" strokeOpacity="0.3" />
                <path d="M15 25l6 6 12-13" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h2 className="text-2xl font-bold text-deep-teal">وصلتنا رسالتك</h2>
              <p className="leading-relaxed text-text-soft">
                حُفظت رسالتك في مركز تواصل المنصة. تُحدّد متابعة الفريق وفق إجراءات التشغيل المنشورة.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="الاسم" name="name" autoComplete="name" required />
                <FormField label="البريد الإلكتروني" name="email" type="email" autoComplete="email" required dir="ltr" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="رقم الهاتف (اختياري)" name="phone" type="tel" autoComplete="tel" dir="ltr" />
                <FormSelect
                  label="الموضوع"
                  name="subject"
                  required
                  options={[
                    { value: 'استفسار عام', label: 'استفسار عام' },
                    { value: 'مشكلة في الدفع', label: 'مشكلة في الدفع' },
                    { value: 'مشكلة تقنية', label: 'مشكلة تقنية' },
                    { value: 'طلب استرداد', label: 'طلب استرداد' },
                    { value: 'اقتراح', label: 'اقتراح' },
                  ]}
                />
              </div>
              <FormTextarea label="رسالتك" name="message" rows={6} required />
              {state === 'error' && (
                <p className="rounded-xl bg-burgundy/10 px-4 py-3 text-sm font-medium text-burgundy" role="alert">
                  تعذّر الإرسال الآن — حاولي مرة أخرى بعد قليل.
                </p>
              )}
              <Button type="submit" size="lg" disabled={state === 'loading'} className="w-full">
                {state === 'loading' ? 'جارٍ الإرسال…' : 'أرسلي الرسالة'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </main>
  )
}
