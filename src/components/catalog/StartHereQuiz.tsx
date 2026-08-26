'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'

type Path = 'session' | 'course' | 'book'

const questions: { title: string; options: { label: string; path: Path }[] }[] = [
  {
    title: 'ما الأقرب لما تشعرين به الآن؟',
    options: [
      { label: 'تشتت واحتياج لوضوح', path: 'session' },
      { label: 'أريد مسار تعلم منظم', path: 'course' },
      { label: 'أحتاج قراءة هادئة وحدي', path: 'book' },
    ],
  },
  {
    title: 'أي إيقاع يناسبك؟',
    options: [
      { label: 'جلسة مركزة وشخصية', path: 'session' },
      { label: 'خطوات أسبوعية واضحة', path: 'course' },
      { label: 'وقت خاص للقراءة', path: 'book' },
    ],
  },
  {
    title: 'ما الذي تحتاجينه أكثر؟',
    options: [
      { label: 'تفكيك سؤال شخصي', path: 'session' },
      { label: 'فهم نمط متكرر وتطبيق', path: 'course' },
      { label: 'تهدئة داخلية وتأمل', path: 'book' },
    ],
  },
]

const results: Record<Path, { title: string; text: string; href: string; cta: string }> = {
  session: { title: 'قد يناسبك استكشاف الجلسات المنشورة', text: 'هذا ترشيح إرشادي عام. تحققي من تفاصيل الخدمة ومواعيدها قبل اتخاذ أي قرار.', href: '/booking', cta: 'استكشفي الجلسات' },
  course: { title: 'قد يناسبك استكشاف الدورات المنشورة', text: 'يعرض الكتالوج وصف كل دورة ومنهجها الفعلي عند نشره.', href: '/courses', cta: 'استكشفي الدورات' },
  book: { title: 'قد يناسبك استكشاف الكتب المنشورة', text: 'يعرض الكتالوج تفاصيل كل كتاب وطريقة الوصول المنشورة له.', href: '/books', cta: 'تصفحي الكتب' },
}

export function StartHereQuiz() {
  const [answers, setAnswers] = useState<(Path | null)[]>([null, null, null])

  const complete = answers.every(Boolean)
  const score = answers.reduce<Record<Path, number>>((map, answer) => {
    if (answer) map[answer] += 1
    return map
  }, { session: 0, course: 0, book: 0 })
  const resultPath = (Object.entries(score).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'session') as Path
  const result = results[resultPath]

  return (
    <div className="mx-auto max-w-5xl rounded-3xl border border-line bg-surface-raised p-5 shadow-card sm:p-8">
      <div className="text-center">
        <p className="text-sm font-bold text-antique-gold">اختبار اختيار المسار</p>
        <h2 className="mt-2 text-3xl font-bold text-deep-teal">ثلاثة أسئلة لترشيح بداية تشبهك</h2>
        <p className="mt-2 text-text-soft">لا تسجيل ولا نتيجة ثابتة؛ غيّري أي إجابة وشاهدي ترشيحًا إرشاديًا عامًا فورًا.</p>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {questions.map((question, questionIndex) => (
          <fieldset key={question.title} className="rounded-2xl border border-line bg-ivory/55 p-4">
            <legend className="px-2 font-bold text-deep-teal">{question.title}</legend>
            <div className="mt-3 space-y-2">
              {question.options.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setAnswers((current) => current.map((answer, index) => index === questionIndex ? option.path : answer))}
                  className={cn('min-h-12 w-full rounded-xl border px-3 text-sm font-semibold transition-colors', answers[questionIndex] === option.path ? 'border-deep-teal bg-deep-teal text-on-dark' : 'border-line bg-surface-raised text-text-soft hover:border-antique-gold')}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      {complete && (
        <div className="mt-6 rounded-2xl border border-antique-gold/40 bg-antique-gold/8 p-6 text-center">
          <p className="text-xs font-bold text-burgundy">ترشيحك الحالي</p>
          <h3 className="mt-1 text-2xl font-bold text-deep-teal">{result.title}</h3>
          <p className="mx-auto mt-2 max-w-xl text-text-soft">{result.text}</p>
          <Button href={result.href} className="mt-5">{result.cta}</Button>
        </div>
      )}
    </div>
  )
}
