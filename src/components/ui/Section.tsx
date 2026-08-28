import { cn } from '@/lib/cn'

type SectionProps = {
  id?: string
  eyebrow?: string
  title?: string
  lead?: string
  align?: 'center' | 'start'
  tone?: 'ivory' | 'white' | 'teal' | 'sand'
  className?: string
  children: React.ReactNode
}

const tones = {
  ivory: 'bg-ivory text-ink',
  white: 'bg-surface-raised text-ink',
  teal: 'bg-deep-teal text-on-dark',
  sand: 'bg-sand/40 text-ink',
}

export function Section({ id, eyebrow, title, lead, align = 'center', tone = 'ivory', className, children }: SectionProps) {
  const centered = align === 'center'
  return (
    <section id={id} className={cn('heritage-paper section-atmosphere relative isolate overflow-hidden px-6 py-14 md:py-18', tones[tone], className)}>
      <span className="pointer-events-none absolute -end-24 -top-28 h-72 w-72 rounded-full bg-aqua/6 blur-3xl" aria-hidden />
      <span className="pointer-events-none absolute -start-32 bottom-[-9rem] h-80 w-80 rounded-full bg-antique-gold/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-7xl">
        {(eyebrow || title || lead) && (
          <header className={cn('mb-9 md:mb-11', centered ? 'text-center' : 'text-start')}>
            {eyebrow && (
              <p
                className={cn(
                  'mb-3 flex items-center gap-3 text-sm font-medium tracking-widest',
                  tone === 'teal' ? 'text-muted-gold' : 'text-antique-gold',
                  centered && 'justify-center',
                )}
              >
                <span className="h-px w-10 bg-current opacity-60" aria-hidden />
                {eyebrow}
                {centered && <span className="h-px w-10 bg-current opacity-60" aria-hidden />}
              </p>
            )}
            {title && (
              <h2 className={cn('text-3xl font-bold md:text-4xl', tone === 'teal' ? 'text-on-dark' : 'text-deep-teal')}>
                {title}
              </h2>
            )}
            {lead && (
              <p
                className={cn(
                  'mt-4 max-w-2xl text-lg leading-loose',
                  tone === 'teal' ? 'text-on-dark/80' : 'text-text-soft',
                  centered && 'mx-auto',
                )}
              >
                {lead}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}
