import Link from 'next/link'
import { Card } from '@/components/ui/Card'

export function AuthShell({
  title,
  lead,
  footer,
  children,
}: {
  title: string
  lead: string
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 block h-px w-16 bg-antique-gold" aria-hidden />
          <h1 className="text-3xl font-bold text-deep-teal">{title}</h1>
          <p className="mt-2 leading-relaxed text-text-soft">{lead}</p>
        </div>
        <Card className="p-8">{children}</Card>
        {footer && <p className="mt-6 text-center text-sm text-text-soft">{footer}</p>}
      </div>
    </main>
  )
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-burgundy underline-offset-4 hover:underline">
      {children}
    </Link>
  )
}
