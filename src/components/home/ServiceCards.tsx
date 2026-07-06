import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'

const services = [
  {
    href: '/courses',
    title: 'الدورات التدريبية',
    text: 'برامج معمقة بالفيديو مع كراسات عمل وتطبيقات أسبوعية تمشي معك خطوة بخطوة.',
    cta: 'تصفّحي الدورات',
    icon: (
      <path d="M4 6h16v11H4zM8 21h8M12 17v4M8 9.5h8M8 12.5h5" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    href: '/booking',
    title: 'الجلسات الفردية',
    text: 'جلسة وضوح خاصة ٦٠ دقيقة نفكك فيها تحديك ونرسم خطة عملية لخطوتك التالية.',
    cta: 'احجزي جلستك',
    icon: (
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 9c0-3.9 3.1-7 7-7s7 3.1 7 7" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    href: '/workshops',
    title: 'ورش العمل المباشرة',
    text: 'لقاءات تفاعلية أونلاين بمقاعد محدودة، بتمارين جماعية وتطبيق فوري.',
    cta: 'اطّلعي على الورش',
    icon: (
      <path d="M12 3v3M5.6 5.6l2.1 2.1M3 12h3M5.6 18.4l2.1-2.1M12 21v-3M18.4 18.4l-2.1-2.1M21 12h-3M18.4 5.6l-2.1 2.1M12 9a3 3 0 1 0 3 3" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    href: '/books',
    title: 'الكتب الرقمية',
    text: 'كتب عملية بتمارين ونماذج تدوين، تُحمَّل فورًا وترافقك أينما كنتِ.',
    cta: 'تصفّحي الكتب',
    icon: (
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5ZM4 5.5v15M20 18v3H6.5" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
]

export function ServiceCards() {
  return (
    <Section
      eyebrow="كيف نرافقك؟"
      title="أربعة مسارات لرحلتك"
      lead="اختاري الشكل الأنسب لك اليوم — وكلها تلتقي عند هدف واحد: نموّك بهدوء وثبات."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => (
          <Card key={s.href} hover as="article" className="group flex flex-col">
            <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-deep-teal/8 text-deep-teal transition-colors group-hover:bg-deep-teal group-hover:text-soft-white" aria-hidden>
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
                {s.icon}
              </svg>
            </span>
            <h3 className="text-xl font-bold text-deep-teal">{s.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-text-soft">{s.text}</p>
            <Link href={s.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-burgundy">
              {s.cta}
              <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M12 5l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </Card>
        ))}
      </div>
    </Section>
  )
}
