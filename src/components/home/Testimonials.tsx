'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import type { HomeTestimonial } from '@/lib/data/home'

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-1 text-antique-gold" aria-label={`التقييم ${rating} من 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={cn('h-4 w-4', i < rating ? 'fill-current' : 'fill-sand')} aria-hidden>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9Z" />
        </svg>
      ))}
    </span>
  )
}

export function Testimonials({ testimonials }: { testimonials: HomeTestimonial[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (testimonials.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6000)
    return () => clearInterval(id)
  }, [testimonials.length])

  if (testimonials.length === 0) return null
  const current = testimonials[index]

  return (
    <section className="heritage-paper border-y border-line bg-ivory px-6 py-14 md:py-18">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-3 flex items-center justify-center gap-3 text-sm font-medium tracking-widest text-antique-gold">
          <span className="h-px w-10 bg-current opacity-60" aria-hidden />
          قالوا عن التجربة
          <span className="h-px w-10 bg-current opacity-60" aria-hidden />
        </p>
        <h2 className="text-3xl font-bold text-deep-teal md:text-4xl">شهادات متعلّماتنا</h2>

        <figure className="relative mt-9 flex min-h-52 flex-col items-center justify-center gap-5 overflow-hidden rounded-xl border border-antique-gold/35 bg-surface-raised p-9 shadow-card">
          <span className="absolute start-0 top-0 h-20 w-20 rounded-ee-full border-ee border-antique-gold/20 bg-antique-gold/5" />
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-antique-gold/60" fill="currentColor" aria-hidden>
            <path d="M4 12c0-4 2.5-7 6-8l.8 1.6C8.5 6.8 7 8.6 6.8 10.5c.3-.1.7-.2 1.2-.2 1.8 0 3 1.3 3 3.1S9.6 16.5 7.7 16.5C5.5 16.5 4 14.7 4 12Zm9 0c0-4 2.5-7 6-8l.8 1.6c-2.3 1.2-3.8 3-4 4.9.3-.1.7-.2 1.2-.2 1.8 0 3 1.3 3 3.1s-1.4 3.1-3.3 3.1C14.5 16.5 13 14.7 13 12Z" />
          </svg>
          <blockquote className="text-xl leading-loose text-ink" aria-live="polite">
            {current.comment}
          </blockquote>
          <figcaption className="flex flex-col items-center gap-2">
            <Stars rating={current.rating} />
            <span className="font-semibold text-deep-teal">{current.displayName}</span>
          </figcaption>
        </figure>

        {testimonials.length > 1 && (
          <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="التنقل بين الشهادات">
            {testimonials.map((t, i) => (
              <button
                key={t.displayName + i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`شهادة ${i + 1}`}
                onClick={() => setIndex(i)}
                className="flex h-10 w-10 touch-manipulation items-center justify-center"
              >
                <span
                  className={cn(
                    'h-2.5 rounded-full transition-all',
                    i === index ? 'w-8 bg-deep-teal' : 'w-2.5 bg-sand',
                  )}
                  aria-hidden
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
