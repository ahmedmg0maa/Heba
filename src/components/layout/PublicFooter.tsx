import Link from 'next/link'
import { BrandLogo } from './BrandLogo'
import { BotanicalSpray } from './BotanicalSpray'
import type { PublicNavigationItem } from '@/lib/data/cms'

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
      { href: '/testimonials', label: 'تجارب موثقة' },
      { href: '/press', label: 'الظهور الإعلامي' },
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

export function PublicFooter({items=[]}:{items?:PublicNavigationItem[]}) {
  const dynamicColumns=items.length?[
    {title:'المنصة',links:items.filter(item=>item.menu==='footer_platform')},
    {title:'تعرّفي أكثر',links:items.filter(item=>item.menu==='footer_about')},
    {title:'قانوني',links:items.filter(item=>item.menu==='footer_legal')},
  ]:columns
  return (
    <footer className="heritage-paper relative overflow-hidden border-t border-antique-gold/30 bg-sand/55 text-ink">
      <BotanicalSpray className="pointer-events-none absolute -start-12 bottom-0 h-52 text-antique-gold opacity-12" />
      <BotanicalSpray mirrored className="pointer-events-none absolute -end-14 bottom-0 h-44 text-antique-gold opacity-10" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <BrandLogo className="h-24 w-24 rounded-3xl" />
          <p className="mt-5 max-w-sm leading-loose text-text-soft">
            مساحة هادئة للتعلّم والتطوّر الواعي — دورات، كتب، ورش عمل، وجلسات
            فردية صُمّمت بعناية لرحلتك.
          </p>
        </div>

        {dynamicColumns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 font-heading text-lg font-bold text-deep-teal">{col.title}</h3>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-text-soft transition-colors hover:text-burgundy">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative border-t border-antique-gold/25 bg-deep-teal text-on-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-on-dark/60 md:flex-row">
          <p>© {new Date().getFullYear()} هبة الشريف. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-2">
            <Link href="/contact" className="hover:text-on-dark">تواصلي معنا</Link>
            <span aria-hidden>·</span>
            <Link href="/privacy" className="hover:text-on-dark">الخصوصية</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
