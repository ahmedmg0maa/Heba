import { cn } from '@/lib/cn'

type CardProps = {
  className?: string
  hover?: boolean
  as?: 'div' | 'article' | 'section' | 'li'
  children: React.ReactNode
}

export function Card({ className, hover = false, as: Tag = 'div', children }: CardProps) {
  return (
    <Tag
      className={cn(
        'rounded-2xl border border-line bg-soft-white p-6 shadow-card',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>{children}</div>
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn('text-xl font-bold text-deep-teal', className)}>{children}</h3>
}
