import Image from 'next/image'
import Link from 'next/link'
import { DEFAULT_HOME_CONTENT, type PathwaysContent } from '@/lib/home/sections'

const visuals = [
  {
    number: '٠١',
    image: '/images/experience/editorial-reflection-studio.webp',
    icon: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5ZM4 5.5v15M20 18v3H6.5" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    number: '٠٢',
    image: '/images/experience/course-clarity-journey.webp',
    icon: <path d="M4 6h16v11H4zM8 21h8M12 17v4M8 9.5h8M8 12.5h5" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    number: '٠٣',
    image: '/images/experience/journey-landscape.webp',
    icon: <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 9c0-3.9 3.1-7 7-7s7 3.1 7 7" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    number: '٠٤',
    image: '/images/experience/book-listen-inward.webp',
    icon: <><path d="M5 4h14v16H5z" /><path d="M8 2v4M16 2v4M8 10h8M8 14h5" strokeLinecap="round" /></>,
  },
]

export function ServiceCards({ content = DEFAULT_HOME_CONTENT.pathways as PathwaysContent }: { content?: PathwaysContent }) {
  return (
    <section className="heritage-paper border-b border-line bg-ivory px-5 py-16 sm:px-8 md:py-24" aria-labelledby="service-gates-title">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 grid gap-5 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-xs font-bold tracking-[.18em] text-antique-gold">{content.eyebrow}</p>
            <h2 id="service-gates-title" className="mt-3 max-w-xl text-4xl font-bold leading-tight text-deep-teal sm:text-5xl">{content.heading}</h2>
          </div>
          <p className="max-w-xl text-base leading-loose text-text-soft lg:justify-self-end lg:text-lg">{content.lead}</p>
        </header>

        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {content.items.map((service, index) => (
            <Link
              key={service.href}
              href={service.href}
              className={`group relative flex min-h-64 flex-col overflow-hidden rounded-[1.75rem] border p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-deep-teal sm:p-7 ${
                index === 0
                  ? 'border-deep-teal bg-deep-teal text-on-dark sm:col-span-2 lg:col-span-6 lg:row-span-2 lg:min-h-[480px] lg:p-10'
                  : index === 1
                    ? 'border-antique-gold/35 bg-sand/25 sm:col-span-2 lg:col-span-6 lg:min-h-[230px]'
                    : 'border-antique-gold/30 bg-surface-raised lg:col-span-3 lg:min-h-[230px]'
              }`}
            >
              <Image src={visuals[index]?.image ?? visuals[0].image} alt="" fill unoptimized sizes={index === 0 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'} className={`object-cover transition duration-1000 group-hover:scale-[1.045] ${index === 0 ? 'opacity-70' : 'opacity-24 dark:opacity-18'}`} />
              <span className={`absolute inset-0 ${index === 0 ? 'bg-linear-to-t from-deep-teal via-deep-teal/78 to-deep-teal/20' : 'bg-linear-to-t from-surface-raised via-surface-raised/90 to-surface-raised/58'}`} aria-hidden />
              <span className="absolute -end-14 -top-14 h-40 w-40 rounded-full border border-antique-gold/20 transition-transform duration-500 group-hover:scale-110" aria-hidden />
              <div className="relative z-10 flex items-start justify-between">
                <span className={`font-heading text-sm ${index === 0 ? 'text-aqua' : 'text-antique-gold'}`}>{visuals[index]?.number}</span>
                <span className={`flex h-13 w-13 items-center justify-center rounded-full border transition-colors ${index === 0 ? 'border-on-dark/20 text-aqua group-hover:bg-aqua group-hover:text-deep-teal' : 'border-antique-gold/30 text-deep-teal group-hover:bg-deep-teal group-hover:text-on-dark'}`} aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">{visuals[index]?.icon}</svg>
                </span>
              </div>
              <h3 className={`relative z-10 mt-8 font-bold ${index === 0 ? 'text-4xl text-on-dark sm:text-5xl lg:mt-auto' : 'text-2xl text-deep-teal'}`}>{service.title}</h3>
              <p className={`relative z-10 mt-3 flex-1 leading-loose ${index === 0 ? 'max-w-md text-base text-on-dark/78 lg:flex-none' : 'text-sm text-text-soft'}`}>{service.text}</p>
              <span className={`relative z-10 mt-6 inline-flex items-center gap-2 text-sm font-bold ${index === 0 ? 'text-aqua' : 'text-burgundy'}`}>
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
