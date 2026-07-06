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
  white: 'bg-soft-white text-ink',
  teal: 'bg-deep-teal text-soft-white',
  sand: 'bg-sand/40 text-ink',
}

export function Section({ id, eyebrow, title, lead, align = 'center', tone = 'ivory', className, children }: SectionProps) {
  const centered = align === 'center'
  return (
    <section id={id} className={cn('px-6 py-16 md:py-24', tones[tone], className)}>
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title || lead) && (
          <header className={cn('mb-10 md:mb-14', centered ? 'text-center' : 'text-start')}>
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
              <h2 className={cn('text-3xl font-bold md:text-4xl', tone === 'teal' ? 'text-soft-white' : 'text-deep-teal')}>
                {title}
              </h2>
            )}
            {lead && (
              <p
                className={cn(
                  'mt-4 max-w-2xl text-lg leading-loose',
                  tone === 'teal' ? 'text-soft-white/80' : 'text-text-soft',
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
