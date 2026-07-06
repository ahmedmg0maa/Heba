import type { Metadata } from 'next'
import { PortraitFrame } from '@/components/home/FloralOrnament'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { CTARibbon } from '@/components/catalog/CTARibbon'

export const metadata: Metadata = {
  title: 'عن هبة الشريف',
  description: 'تعرّفي على هبة الشريف ورسالتها في مرافقة النساء نحو نموّ هادئ وواعٍ.',
}

const values = [
  { title: 'الهدوء قبل السرعة', text: 'لا نؤمن بالتحول السحري في ٢١ يومًا — نؤمن بالخطوات الصغيرة المستدامة.' },
  { title: 'العملية قبل النظرية', text: 'كل فكرة تتحول إلى تمرين، وكل تمرين إلى ممارسة يومية.' },
  { title: 'الصدق قبل التسويق', text: 'نقول لك بوضوح ما يناسبك وما لا يناسبك، حتى لو خسرنا عملية بيع.' },
]

export default function AboutPage() {
  return (
    <main>
      <section className="border-b border-line bg-soft-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold tracking-widest text-antique-gold">عن هبة</p>
            <h1 className="text-4xl leading-snug font-bold text-deep-teal md:text-5xl">
              مرافقة، لا مُحاضِرة
            </h1>
            <div className="mt-6 space-y-4 text-lg leading-loose text-text-soft">
              <p>
                أنا هبة الشريف — مدرِّبة تطوير ومرافقة رحلات نمو. أعمل مع النساء
                اللواتي يشعرن أن حياتهن تمضي أسرع منهن: مسؤوليات تتراكم، وطاقة
                تُستنزف، وصوت داخلي يهمس أن هناك طريقة أهدأ للعيش.
              </p>
              <p>
                على مدى السنوات الماضية رافقت أكثر من ألف متعلّمة عبر الدورات
                والجلسات والورش، بمنهج واحد ثابت: خطوات صغيرة، أدوات عملية،
                وصبر جميل على النفس.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/start-here" size="lg">
                ابدئي من هنا
              </Button>
              <Button href="/booking" variant="secondary" size="lg">
                احجزي جلسة تعارف
              </Button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-sm">
            <PortraitFrame />
          </div>
        </div>
      </section>

      <Section eyebrow="ما نؤمن به" title="ثلاث قيم تحكم كل ما نقدمه">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((v, i) => (
            <div key={v.title} className="rounded-3xl border border-line bg-soft-white p-8 text-center shadow-card">
              <span className="tnum mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-antique-gold/15 font-heading text-xl font-bold text-antique-gold">
                {(i + 1).toLocaleString('ar-EG')}
              </span>
              <h3 className="text-xl font-bold text-deep-teal">{v.title}</h3>
              <p className="mt-3 leading-relaxed text-text-soft">{v.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <CTARibbon />
    </main>
  )
}
