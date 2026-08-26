'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { adminSearch, type SearchHit } from '@/lib/actions/admin-tools'
import { cn } from '@/lib/cn'

const kindMeta: Record<SearchHit['kind'], { label: string; tone: string }> = {
  customer: { label: 'عميلة', tone: 'bg-deep-teal/10 text-deep-teal' },
  order: { label: 'طلب', tone: 'bg-cobalt/10 text-cobalt' },
  payment: { label: 'دفعة', tone: 'bg-antique-gold/15 text-antique-gold' },
}

// Command-style global search over customers/orders/payments + quick links.
export function AdminTopbar() {
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<SearchHit[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [])

  function onChange(value: string) {
    setQ(value)
    setOpen(true)
    if (debounce.current) clearTimeout(debounce.current)
    if (value.trim().length < 2) {
      setHits(null)
      return
    }
    debounce.current = setTimeout(async () => {
      setBusy(true)
      const res = await adminSearch(value)
      setHits(res.ok ? res.data : [])
      setBusy(false)
    }, 350)
  }

  return (
    <div className="mb-7 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-raised/85 p-3 shadow-card backdrop-blur">
      <div ref={boxRef} className="relative min-w-64 flex-1">
        <svg viewBox="0 0 24 24" className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
        <label htmlFor="admin-search" className="sr-only">
          بحث شامل
        </label>
        <input
          id="admin-search"
          value={q}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => q.trim().length >= 2 && setOpen(true)}
          placeholder="ابحثي باسم العميلة أو بريدها…"
          className="w-full rounded-full border border-line bg-surface-raised py-2.5 ps-11 pe-4 text-sm text-ink shadow-card transition-colors placeholder:text-taupe/60 focus:border-deep-teal focus:outline-2 focus:outline-deep-teal/20"
        />
        {open && q.trim().length >= 2 && (
          <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-card-hover">
            {busy ? (
              <p className="px-5 py-4 text-sm text-taupe">جارٍ البحث…</p>
            ) : !hits || hits.length === 0 ? (
              <p className="px-5 py-4 text-sm text-taupe">لا نتائج — جرّبي الاسم أو جزءًا من البريد.</p>
            ) : (
              <ul className="divide-y divide-line/60">
                {hits.map((h, i) => (
                  <li key={i}>
                    <Link
                      href={h.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-ivory/70"
                    >
                      <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold', kindMeta[h.kind].tone)}>
                        {kindMeta[h.kind].label}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-deep-teal">{h.title}</span>
                        <span className="block truncate text-xs text-taupe" dir="ltr">
                          {h.subtitle}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {[
          { href: '/admin/payments', label: 'المدفوعات' },
          { href: '/admin/offers', label: 'عرض جديد' },
          { href: '/admin/articles', label: 'مقال جديد' },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="hidden rounded-full border border-line bg-surface-raised px-4 py-2 text-sm font-semibold text-deep-teal shadow-card transition-all hover:-translate-y-0.5 hover:border-antique-gold sm:block"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
