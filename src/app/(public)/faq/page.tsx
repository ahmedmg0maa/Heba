import type { Metadata } from 'next'
import { PageHero } from '@/components/catalog/PageHero'
import { CTARibbon } from '@/components/catalog/CTARibbon'

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة',
  description: 'إجابات واضحة عن الأسئلة الأكثر تكرارًا حول الدورات والدفع والوصول.',
}

const faqs = [
  {
    group: 'الدفع والوصول',
    items: [
      {
        q: 'ما وسائل الدفع المتاحة؟',
        a: 'إنستاباي، المحافظ الإلكترونية (فودافون كاش وغيرها)، والتحويل البنكي. بعد التحويل ترفعين صورة الإيصال ويُفعَّل وصولك بعد المراجعة خلال ٢٤ ساعة كحد أقصى في أيام العمل.',
      },
      {
        q: 'متى يصلني المحتوى بعد الدفع؟',
        a: 'فور اعتماد إيصالك يظهر المحتوى تلقائيًا في لوحتك — الدورات في «دوراتي» والكتب في «كتبي» — ويصلك إشعار بالتفعيل.',
      },
      {
        q: 'هل الوصول للدورات مدى الحياة؟',
        a: 'نعم. تشترين مرة واحدة ويبقى الوصول معك دائمًا، شاملًا كل تحديثات الدورة المستقبلية.',
      },
    ],
  },
  {
    group: 'الدورات والمحتوى',
    items: [
      {
        q: 'هل تناسبني الدورات لو وقتي ضيق؟',
        a: 'صُممت الدروس قصيرة (١٥–٢٠ دقيقة) والتطبيقات الأسبوعية لا تتجاوز نصف ساعة. تتعلمين بإيقاعك تمامًا — لا مواعيد إلزامية.',
      },
      {
        q: 'هل أحصل على شهادة؟',
        a: 'نعم، شهادة إتمام إلكترونية موثقة تصدر تلقائيًا عند إنهاء ١٠٠٪ من دروس الدورة.',
      },
      {
        q: 'هل يمكن مشاركة حسابي مع صديقة؟',
        a: 'الحساب شخصي ولا تجوز مشاركته. مشاركة الوصول للمحتوى المدفوع تؤدي لإيقاف الحساب وفق الشروط والأحكام.',
      },
    ],
  },
  {
    group: 'الجلسات والورش',
    items: [
      {
        q: 'كيف تُعقد الجلسات الفردية؟',
        a: 'عبر مكالمة فيديو خاصة (Zoom أو Google Meet). بعد تأكيد الدفع ننسق معك الموعد الدقيق بما يناسب جدولك ضمن المواعيد المتاحة.',
      },
      {
        q: 'ماذا لو فاتتني الورشة المباشرة؟',
        a: 'يصلك تسجيل الورشة كاملًا مع ملفات العمل خلال ٤٨ ساعة من انتهائها، ويبقى متاحًا في حسابك.',
      },
      {
        q: 'هل يمكنني إعادة جدولة جلستي؟',
        a: 'نعم، مرة واحدة مجانًا بشرط الإخطار قبل الموعد بـ ٢٤ ساعة على الأقل من صفحة حجوزاتك.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <main>
      <PageHero
        eyebrow="الأسئلة الشائعة"
        title="كل ما تريدين معرفته"
        lead="جمعنا الأسئلة الأكثر تكرارًا وأجبنا عنها بوضوح — ولو بقي سؤال، راسلينا."
      />

      <div className="mx-auto max-w-3xl space-y-12 px-6 py-16">
        {faqs.map((group) => (
          <section key={group.group}>
            <h2 className="mb-5 flex items-center gap-3 text-2xl font-bold text-deep-teal">
              <span className="h-px w-8 bg-antique-gold" aria-hidden />
              {group.group}
            </h2>
            <div className="space-y-3">
              {group.items.map((item) => (
                <details key={item.q} className="group rounded-2xl border border-line bg-soft-white shadow-card">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 font-bold text-ink [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-antique-gold transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </summary>
                  <p className="border-t border-line/60 p-5 leading-loose text-text-soft">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <CTARibbon
        title="لم تجدي إجابتك؟"
        lead="راسلينا مباشرة وسنرد خلال ٢٤ ساعة."
        ctaLabel="تواصلي معنا"
        ctaHref="/contact"
      />
    </main>
  )
}
