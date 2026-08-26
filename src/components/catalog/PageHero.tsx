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
    <section className="heritage-paper relative overflow-hidden border-b border-line bg-surface-raised">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,color-mix(in_srgb,var(--color-aqua)_8%,transparent),transparent_28%),radial-gradient(circle_at_88%_80%,color-mix(in_srgb,var(--color-antique-gold)_13%,transparent),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-[20%] top-0 h-px bg-linear-to-r from-transparent via-antique-gold/50 to-transparent" />
      <span className="pointer-events-none absolute start-8 top-8 h-10 w-10 border-s border-t border-antique-gold/20" />
      <span className="pointer-events-none absolute end-8 bottom-8 h-10 w-10 border-e border-b border-antique-gold/20" />
      <div className="relative mx-auto max-w-5xl px-6 py-14 text-center md:py-18">
        <p className="mb-3 flex items-center justify-center gap-3 text-xs font-bold tracking-[.18em] text-antique-gold sm:text-sm">
          <span className="h-px w-10 bg-current opacity-55" aria-hidden />
          {eyebrow}
          <span className="h-px w-10 bg-current opacity-55" aria-hidden />
        </p>
        <h1 className="text-4xl leading-tight font-bold text-deep-teal md:text-5xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-loose text-text-soft md:text-lg">{lead}</p>
        {children}
      </div>
    </section>
  )
}
