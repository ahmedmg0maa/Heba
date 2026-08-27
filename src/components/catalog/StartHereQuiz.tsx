'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { START_HERE_PATHS, type StartHereContent, type StartHerePath } from '@/lib/start-here/content'

export function StartHereQuiz({ content }: { content: StartHereContent['quiz'] }) {
  const [answers, setAnswers] = useState<(StartHerePath | null)[]>([null, null, null])
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    rootRef.current?.setAttribute('data-hydrated', 'true')
  }, [])

  const complete = answers.every(Boolean)
  const score = answers.reduce<Record<StartHerePath, number>>((map, answer) => {
    if (answer) map[answer] += 1
    return map
  }, { session: 0, course: 0, book: 0 })
  const resultPath = (Object.entries(score).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'session') as StartHerePath
  const result = content.results[resultPath]

  return (
    <div ref={rootRef} data-start-here-quiz data-hydrated="false" className="mx-auto max-w-5xl rounded-3xl border border-line bg-surface-raised p-5 shadow-card sm:p-8">
      <div className="text-center">
        <p className="text-sm font-bold text-antique-gold">{content.eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold text-deep-teal">{content.heading}</h2>
        <p className="mt-2 text-text-soft">{content.lead}</p>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {content.questions.map((question, questionIndex) => (
          <fieldset key={question.title} className="rounded-2xl border border-line bg-ivory/55 p-4">
            <legend className="px-2 font-bold text-deep-teal">{question.title}</legend>
            <div className="mt-3 space-y-2">
              {START_HERE_PATHS.map((path) => (
                <button
                  key={path}
                  type="button"
                  aria-pressed={answers[questionIndex] === path}
                  onClick={() => setAnswers((current) => current.map((answer, index) => index === questionIndex ? path : answer))}
                  className={cn('min-h-12 w-full rounded-xl border px-3 text-sm font-semibold transition-colors', answers[questionIndex] === path ? 'border-deep-teal bg-deep-teal text-on-dark' : 'border-line bg-surface-raised text-text-soft hover:border-antique-gold')}
                >
                  {question.options[path]}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      {complete && (
        <div role="status" aria-live="polite" className="mt-6 rounded-2xl border border-antique-gold/40 bg-antique-gold/8 p-6 text-center">
          <p className="text-xs font-bold text-burgundy">ترشيحك الحالي</p>
          <h3 className="mt-1 text-2xl font-bold text-deep-teal">{result.title}</h3>
          <p className="mx-auto mt-2 max-w-xl text-text-soft">{result.text}</p>
          <Button href={result.href} className="mt-5">{result.cta}</Button>
        </div>
      )}
    </div>
  )
}
