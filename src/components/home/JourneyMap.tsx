import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { ComparisonPanel } from '@/components/catalog/ComparisonPanel'

const steps = [
  { number: '١', title: 'حددي ما تحتاجينه', text: 'اختبار البداية يساعدك على تسمية المرحلة بدل الاختيار وسط تشتت.', href: '/start-here', cta: 'ابدئي الاختبار' },
  { number: '٢', title: 'اختاري الإيقاع المناسب', text: 'جلسة خاصة، قراءة هادئة، أو مسار تعلم منظم داخل حسابك.', href: '/services', cta: 'قارني المسارات' },
  { number: '٣', title: 'تابعي خطوة بخطوة', text: 'تقدمك وطلباتك وحجوزاتك تبقى مجمعة في مساحة واحدة واضحة.', href: '/dashboard', cta: 'استكشفي لوحتك' },
]

export function JourneyMap() {
  return (
    <>
      <Section tone="white" eyebrow="رحلة واضحة" title="من السؤال إلى خطوة قابلة للتنفيذ" lead="لا تحتاجين إلى معرفة الطريق كاملًا؛ يكفي أن تختاري الباب الأقرب الآن.">
        <ol className="grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.number} className="relative rounded-xl border border-antique-gold/25 bg-ivory/55 p-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-antique-gold/35 bg-surface-raised font-heading text-xl font-bold text-antique-gold">{step.number}</span>
              <h3 className="mt-4 text-xl font-bold text-deep-teal">{step.title}</h3>
              <p className="mt-2 text-sm leading-loose text-text-soft">{step.text}</p>
              <Link href={step.href} className="mt-4 inline-block text-sm font-bold text-burgundy">{step.cta} ←</Link>
            </li>
          ))}
        </ol>
      </Section>
      <Section eyebrow="لماذا هذه المنصة؟" title="تجربة عربية مترابطة، لا محتوى متفرق" lead="القيمة ليست في كثرة المواد، بل في وضوح الخطوة وما يمكنك تطبيقه بعدها.">
        <ComparisonPanel />
      </Section>
    </>
  )
}
