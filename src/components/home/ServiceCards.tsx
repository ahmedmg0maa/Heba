import Link from 'next/link'
import { DEFAULT_HOME_CONTENT, type PathwaysContent } from '@/lib/home/sections'

const visuals = [
  {
    number: '٠١',
    icon: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5ZM4 5.5v15M20 18v3H6.5" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    number: '٠٢',
    icon: <path d="M4 6h16v11H4zM8 21h8M12 17v4M8 9.5h8M8 12.5h5" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    number: '٠٣',
    icon: <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 9c0-3.9 3.1-7 7-7s7 3.1 7 7" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    number: '٠٤',
    icon: <><path d="M5 4h14v16H5z" /><path d="M8 2v4M16 2v4M8 10h8M8 14h5" strokeLinecap="round" /></>,
  },
]

export function ServiceCards({ content = DEFAULT_HOME_CONTENT.pathways as PathwaysContent }: { content?: PathwaysContent }) {
  return (
    <section className="heritage-paper border-b border-line bg-ivory px-5 py-14 sm:px-8 md:py-20" aria-labelledby="service-gates-title">
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-bold tracking-[.18em] text-antique-gold">{content.eyebrow}</p>
          <h2 id="service-gates-title" className="mt-3 text-3xl font-bold text-deep-teal sm:text-4xl">{content.heading}</h2>
          <p className="mt-3 leading-loose text-text-soft">{content.lead}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.items.map((service, index) => (
            <Link
              key={service.href}
              href={service.href}
              className="group relative flex min-h-64 flex-col overflow-hidden rounded-xl border border-antique-gold/30 bg-surface-raised p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-antique-gold/60 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-deep-teal"
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-antique-gold/65 to-transparent" />
              <div className="flex items-start justify-between">
                <span className="font-heading text-sm text-antique-gold">{visuals[index]?.number}</span>
                <span className="flex h-13 w-13 items-center justify-center rounded-full border border-antique-gold/30 text-deep-teal transition-colors group-hover:bg-deep-teal group-hover:text-on-dark" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">{visuals[index]?.icon}</svg>
                </span>
              </div>
              <h3 className="mt-8 text-2xl font-bold text-deep-teal">{service.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-loose text-text-soft">{service.text}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-burgundy">
                {service.cta}
                <span className="transition-transform group-hover:-translate-x-1" aria-hidden>←</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
