import Link from 'next/link'
import { BrandLogo } from './BrandLogo'

const columns = [
  {
    title: 'المنصة',
    links: [
      { href: '/courses', label: 'الدورات التدريبية' },
      { href: '/books', label: 'الكتب الرقمية' },
      { href: '/workshops', label: 'ورش العمل' },
      { href: '/booking', label: 'الجلسات الفردية' },
    ],
  },
  {
    title: 'تعرّفي أكثر',
    links: [
      { href: '/about', label: 'عن هبة الشريف' },
      { href: '/start-here', label: 'ابدئي من هنا' },
      { href: '/articles', label: 'المقالات' },
      { href: '/faq', label: 'الأسئلة الشائعة' },
    ],
  },
  {
    title: 'قانوني',
    links: [
      { href: '/privacy', label: 'سياسة الخصوصية' },
      { href: '/terms', label: 'الشروط والأحكام' },
      { href: '/refund', label: 'سياسة الاسترداد' },
      { href: '/disclaimer', label: 'إخلاء المسؤولية' },
    ],
  },
]

export function PublicFooter() {
  return (
    <footer className="bg-deep-teal text-soft-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <BrandLogo tone="light" />
          <p className="mt-5 max-w-sm leading-loose text-soft-white/70">
            مساحة هادئة للتعلّم والتطوّر الواعي — دورات، كتب، ورش عمل، وجلسات
            فردية صُمّمت بعناية لرحلتك.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 font-heading text-lg font-bold text-muted-gold">{col.title}</h3>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-soft-white/70 transition-colors hover:text-soft-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-soft-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-soft-white/60 md:flex-row">
          <p>© {new Date().getFullYear()} هبة الشريف. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-2">
            <Link href="/contact" className="hover:text-soft-white">تواصلي معنا</Link>
            <span aria-hidden>·</span>
            <Link href="/privacy" className="hover:text-soft-white">الخصوصية</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
