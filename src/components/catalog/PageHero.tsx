import { FloralOrnament } from '@/components/home/FloralOrnament'

export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string
  title: string
  lead: string
  children?: React.ReactNode
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-soft-white">
      <FloralOrnament className="pointer-events-none absolute -end-4 top-4 h-64 opacity-40" />
      <div className="relative mx-auto max-w-4xl px-6 py-16 text-center md:py-20">
        <p className="mb-3 flex items-center justify-center gap-3 text-sm font-semibold tracking-widest text-antique-gold">
          <span className="h-px w-10 bg-current opacity-60" aria-hidden />
          {eyebrow}
          <span className="h-px w-10 bg-current opacity-60" aria-hidden />
        </p>
        <h1 className="text-4xl font-bold text-deep-teal md:text-5xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-loose text-text-soft">{lead}</p>
        {children}
      </div>
    </section>
  )
}
