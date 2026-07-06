import { Section } from '@/components/ui/Section'

const rows = [
  { label: 'اللغة والسياق', us: 'محتوى عربي أصيل يفهم واقعك', them: 'ترجمات عامة بعيدة عن سياقك' },
  { label: 'التطبيق', us: 'كراسات عمل وتمارين أسبوعية', them: 'مشاهدة سلبية بلا تطبيق' },
  { label: 'الوصول', us: 'مدى الحياة، بما فيه التحديثات', them: 'اشتراك شهري يتوقف بتوقفك' },
  { label: 'الدعم', us: 'إجابة شخصية خلال ٢٤ ساعة', them: 'ردود آلية أو لا ردود' },
  { label: 'الشهادة', us: 'شهادة إتمام موثقة', them: 'غالبًا بلا إثبات إتمام' },
]

export function ComparisonPanel() {
  return (
    <Section eyebrow="لماذا تتعلمين معنا؟" title="فرق تلمسينه من الأسبوع الأول" tone="white">
      <div className="overflow-hidden rounded-3xl border border-line shadow-card">
        <div className="grid grid-cols-[1fr_1.2fr_1.2fr] bg-deep-teal text-sm font-bold text-soft-white md:text-base">
          <div className="p-4 md:p-5" />
          <div className="border-s border-soft-white/10 p-4 text-center md:p-5">منصة هبة الشريف</div>
          <div className="border-s border-soft-white/10 p-4 text-center text-soft-white/70 md:p-5">التعلم التقليدي</div>
        </div>
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`grid grid-cols-[1fr_1.2fr_1.2fr] text-sm ${i % 2 === 0 ? 'bg-soft-white' : 'bg-ivory/60'}`}
          >
            <div className="p-4 font-semibold text-deep-teal md:p-5">{row.label}</div>
            <div className="flex items-start gap-2 border-s border-line p-4 md:p-5">
              <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-deep-teal" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-ink">{row.us}</span>
            </div>
            <div className="flex items-start gap-2 border-s border-line p-4 md:p-5">
              <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-burgundy-soft" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              </svg>
              <span className="text-text-soft">{row.them}</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
