import Link from 'next/link'
import { BrandLogo } from './BrandLogo'
import { BotanicalSpray } from './BotanicalSpray'
import type { PublicNavigationItem } from '@/lib/data/cms'

const columns = [
  {
    title: 'اختاري تجربتك',
    links: [
      { href: '/start-here', label: 'ابدئي من هنا' },
      { href: '/courses', label: 'الدورات التدريبية' },
      { href: '/books', label: 'الكتب الرقمية' },
      { href: '/workshops', label: 'ورش العمل' },
      { href: '/booking', label: 'الجلسات الفردية' },
      { href: '/programs', label: 'البرامج والباقات' },
    ],
  },
  {
    title: 'اكتشفي المنصة',
    links: [
      { href: '/about', label: 'عن هبة الشريف' },
      { href: '/articles', label: 'المقالات' },
      { href: '/resources', label: 'مكتبة الموارد' },
      { href: '/testimonials', label: 'تجارب موثقة' },
      { href: '/press', label: 'الظهور الإعلامي' },
      { href: '/faq', label: 'الأسئلة الشائعة' },
    ],
  },
  {
    title: 'الثقة والخصوصية',
    links: [
      { href: '/privacy', label: 'سياسة الخصوصية' },
      { href: '/terms', label: 'الشروط والأحكام' },
      { href: '/refund', label: 'الحجز والإلغاء والاسترداد' },
      { href: '/disclaimer', label: 'إخلاء المسؤولية' },
      { href: '/contact', label: 'تواصلي معنا' },
    ],
  },
]

export function PublicFooter({ items = [] }: { items?: PublicNavigationItem[] }) {
  const dynamicColumns = items.length ? [
    { title: 'اختاري تجربتك', links: items.filter((item) => item.menu === 'footer_platform') },
    { title: 'اكتشفي المنصة', links: items.filter((item) => item.menu === 'footer_about') },
    { title: 'الثقة والخصوصية', links: items.filter((item) => item.menu === 'footer_legal') },
  ] : columns

  return (
    <footer className="relative overflow-hidden bg-deep-teal text-on-dark">
      <BotanicalSpray className="pointer-events-none absolute -start-20 bottom-0 h-80 text-aqua opacity-10" />
      <BotanicalSpray mirrored className="pointer-events-none absolute -end-20 top-12 h-72 text-antique-gold opacity-10" />

      <div className="relative border-b border-on-dark/12">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:py-12">
          <div>
            <p className="text-xs font-bold tracking-[.18em] text-aqua">حين تكون البداية غير واضحة</p>
            <h2 className="mt-3 max-w-3xl font-heading text-3xl font-bold leading-snug sm:text-4xl">ابدئي من السؤال الأقرب إليكِ، لا من كل الإجابات.</h2>
            <p className="mt-3 max-w-2xl leading-loose text-on-dark/68">رحلة قصيرة تساعدك على رؤية المسارات المتاحة، ثم تترك لكِ مساحة الاختيار بهدوء.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/start-here" className="inline-flex min-h-12 items-center justify-center rounded-full bg-aqua px-7 font-bold text-deep-teal transition hover:-translate-y-0.5 hover:bg-on-dark">ابدئي رحلتك <span className="ms-2" aria-hidden>←</span></Link>
            <Link href="/contact" className="inline-flex min-h-12 items-center justify-center rounded-full border border-on-dark/30 px-7 font-bold text-on-dark transition hover:border-aqua hover:text-aqua">لديكِ سؤال؟</Link>
          </div>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1.25fr_2fr] lg:py-16">
        <div>
          <div className="flex items-center gap-4">
            <BrandLogo tone="light" className="h-20 w-20 rounded-[1.6rem]" />
            <div>
              <p className="font-heading text-2xl font-bold">هبة الشريف</p>
              <p className="mt-1 text-[9px] font-bold tracking-[.28em] text-antique-gold" dir="ltr">HEBA ELSHERIF</p>
            </div>
          </div>
          <p className="mt-6 max-w-sm text-sm leading-[2] text-on-dark/68">
            مساحة عربية للتعلّم والتطوّر الواعي؛ تجمع بين المعرفة الهادئة، الأدوات العملية، وتجارب واضحة الحدود تساعدك على اختيار خطوتك التالية.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <Link href="/search" className="rounded-full border border-on-dark/18 px-4 py-2 text-on-dark/78 transition hover:border-aqua hover:text-aqua">ابحثي في المنصة</Link>
            <Link href="/auth/login" className="rounded-full border border-on-dark/18 px-4 py-2 text-on-dark/78 transition hover:border-aqua hover:text-aqua">دخول الحساب</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
          {dynamicColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-5 font-heading text-lg font-bold text-aqua">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}`}>
                    <Link href={link.href} className="text-sm text-on-dark/65 transition-colors hover:text-on-dark">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="relative border-t border-on-dark/12 bg-[#183D49]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-center text-xs text-on-dark/55 sm:px-8 md:flex-row md:text-start">
          <p>© {new Date().getFullYear()} هبة الشريف. جميع الحقوق محفوظة.</p>
          <p>محتوى للتعلّم والتطوير، لا يقدّم تشخيصًا أو بديلًا عن المختصين.</p>
        </div>
      </div>
    </footer>
  )
}
