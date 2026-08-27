'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import type { GuidedAssessmentContent } from '@/lib/assessments/governance'

export function StartHereQuiz({ content, version }: { content: GuidedAssessmentContent; version?: number | null }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [answerOrder, setAnswerOrder] = useState<string[]>([])
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => { rootRef.current?.setAttribute('data-hydrated', 'true') }, [])

  const answered = content.questions.filter((question) => answers[question.key]).length
  const complete = answered === content.questions.length
  const result = useMemo(() => {
    const scores = Object.fromEntries(content.results.map((item) => [item.key, 0])) as Record<string, number>
    for (const question of content.questions) {
      const option = question.options.find((item) => item.key === answers[question.key])
      if (option && option.resultKey in scores) scores[option.resultKey] += option.weight
    }
    return [...content.results].sort((a, b) => scores[b.key] - scores[a.key] || content.results.indexOf(a) - content.results.indexOf(b))[0]
  }, [answers, content])
  const undoLast = () => {
    const last = answerOrder.at(-1)
    if (last) { setAnswers((current) => { const next = { ...current }; delete next[last]; return next }); setAnswerOrder((current) => current.slice(0, -1)) }
  }

  return (
    <div ref={rootRef} data-start-here-quiz data-hydrated="false" className="mx-auto max-w-5xl rounded-3xl border border-line bg-surface-raised p-5 shadow-card sm:p-8">
      <div className="text-center">
        <p className="text-sm font-bold text-antique-gold">{content.eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold text-deep-teal">{content.heading}</h2>
        <p className="mt-2 text-text-soft">{content.lead}</p>
        <p className="mt-3 text-xs leading-relaxed text-burgundy">{content.disclaimer}</p>
        {version ? <p className="mt-2 text-xs text-text-soft">الإصدار المنشور {version.toLocaleString('ar-EG')}</p> : null}
      </div>
      <div className="mx-auto mt-6 max-w-2xl" aria-live="polite">
        <div className="flex items-center justify-between gap-3 text-xs font-bold text-deep-teal">
          <span>التقدم: {answered.toLocaleString('ar-EG')} من {content.questions.length.toLocaleString('ar-EG')}</span>
          {answered > 0 ? <button type="button" className="rounded-lg px-2 py-1 text-burgundy underline-offset-4 hover:underline" onClick={undoLast}>الرجوع عن آخر إجابة</button> : null}
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-label="تقدم الاختبار" aria-valuemin={0} aria-valuemax={content.questions.length} aria-valuenow={answered}>
          <div className="h-full rounded-full bg-deep-teal transition-[width] motion-reduce:transition-none" style={{ width: `${(answered / content.questions.length) * 100}%` }} />
        </div>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {content.questions.map((question) => (
          <fieldset key={question.key} className="rounded-2xl border border-line bg-ivory/55 p-4">
            <legend className="px-2 font-bold text-deep-teal">{question.title}</legend>
            {question.help ? <p className="mt-1 text-xs leading-relaxed text-text-soft">{question.help}</p> : null}
            <div className="mt-3 space-y-2">
              {question.options.map((option) => (
                <button key={option.key} type="button" aria-pressed={answers[question.key] === option.key}
                  onClick={() => { setAnswers((current) => ({ ...current, [question.key]: option.key })); setAnswerOrder((current) => [...current.filter((key) => key !== question.key), question.key]) }}
                  className={cn('min-h-12 w-full rounded-xl border px-3 text-sm font-semibold transition-colors', answers[question.key] === option.key ? 'border-deep-teal bg-deep-teal text-on-dark' : 'border-line bg-surface-raised text-text-soft hover:border-antique-gold')}>
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      {complete && result ? (
        <div role="status" aria-live="polite" className="mt-6 rounded-2xl border border-antique-gold/40 bg-antique-gold/8 p-6 text-center">
          <p className="text-xs font-bold text-burgundy">ترشيحك الحالي</p>
          <h3 className="mt-1 text-2xl font-bold text-deep-teal">{result.title}</h3>
          <p className="mx-auto mt-2 max-w-xl text-text-soft">{result.explanation}</p>
          <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-deep-teal">لماذا؟ {result.rationale}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3"><Button href={result.target}>{result.cta}</Button><Button type="button" variant="secondary" onClick={() => { setAnswers({}); setAnswerOrder([]) }}>تعديل الإجابات</Button></div>
        </div>
      ) : null}
      <p className="mt-5 text-center text-xs text-text-soft">إجاباتك تبقى داخل هذه الصفحة ولا تُرسل إلى الخادم أو أدوات التحليل.</p>
    </div>
  )
}
