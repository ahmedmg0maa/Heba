import { Button } from '@/components/ui/Button'

export function CTARibbon({
  title = 'جاهزة لخطوتك التالية؟',
  lead = 'انضمي لأكثر من ألف متعلّمة اخترن النمو الهادئ.',
  ctaLabel = 'ابدئي الآن',
  ctaHref = '/courses',
}: {
  title?: string
  lead?: string
  ctaLabel?: string
  ctaHref?: string
}) {
  return (
    <section className="bg-deep-teal px-6 py-14">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-start">
        <div>
          <h2 className="text-2xl font-bold text-soft-white md:text-3xl">{title}</h2>
          <p className="mt-2 text-soft-white/75">{lead}</p>
        </div>
        <Button href={ctaHref} variant="gold" size="lg" className="shrink-0">
          {ctaLabel}
        </Button>
      </div>
    </section>
  )
}
