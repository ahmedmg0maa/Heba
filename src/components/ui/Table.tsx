import { cn } from '@/lib/cn'

export function Table({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('overflow-x-auto rounded-2xl border border-line bg-soft-white shadow-card', className)}>
      <table className="w-full min-w-max text-start text-sm">{children}</table>
    </div>
  )
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-line bg-ivory/70 text-xs font-semibold tracking-wide text-taupe">
      {children}
    </thead>
  )
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-line/70">{children}</tbody>
}

export function TR({ className, children }: { className?: string; children: React.ReactNode }) {
  return <tr className={cn('transition-colors hover:bg-ivory/50', className)}>{children}</tr>
}

export function TH({ className, children }: { className?: string; children: React.ReactNode }) {
  return <th className={cn('px-5 py-3.5 text-start font-semibold', className)}>{children}</th>
}

export function TD({ className, children }: { className?: string; children: React.ReactNode }) {
  return <td className={cn('tnum px-5 py-4 align-middle text-ink', className)}>{children}</td>
}
