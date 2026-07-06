'use client'

import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export function Newsletter() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('loading')
    const email = String(new FormData(e.currentTarget).get('email'))
    try {
      const { error } = await getBrowserClient().from('newsletter_subscribers').insert({ email })
      // duplicate email (unique violation) still means "you're subscribed"
      if (error && error.code !== '23505') throw error
      setState('done')
    } catch {
      setState('error')
    }
  }

  return (
    <section className="bg-ivory px-6 py-16 md:py-24">
      <div className="mx-auto max-w-3xl rounded-3xl border border-antique-gold/40 bg-soft-white p-10 text-center shadow-card md:p-14">
        <p className="mb-3 text-sm font-semibold tracking-widest text-antique-gold">رسالة الأحد الصباحية</p>
        <h2 className="text-3xl font-bold text-deep-teal">رسالة أسبوعية تُشبه العناق</h2>
        <p className="mx-auto mt-3 max-w-md leading-loose text-text-soft">
          كل يوم أحد: تأمل قصير، أداة عملية، وسؤال للتدوين — مباشرة إلى بريدك.
        </p>

        {state === 'done' ? (
          <p className="mt-8 rounded-2xl bg-deep-teal/8 px-6 py-4 font-semibold text-deep-teal">
            أهلًا بك في العائلة! تصلك أول رسالة يوم الأحد القادم.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              البريد الإلكتروني
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              dir="ltr"
              placeholder="example@email.com"
              className="w-full flex-1 rounded-full border border-line bg-ivory px-5 py-3 text-start text-ink placeholder:text-taupe/60 focus:border-deep-teal focus:outline-2 focus:outline-deep-teal/20"
            />
            <Button type="submit" disabled={state === 'loading'}>
              {state === 'loading' ? 'لحظات…' : 'اشتركي مجانًا'}
            </Button>
          </form>
        )}
        {state === 'error' && (
          <p className="mt-4 text-sm font-medium text-burgundy" role="alert">
            تعذّر الاشتراك الآن — حاولي مرة أخرى بعد قليل.
          </p>
        )}
        <p className="mt-4 text-xs text-taupe">بلا إزعاج، ويمكنك إلغاء الاشتراك بضغطة واحدة في أي وقت.</p>
      </div>
    </section>
  )
}
