const items = [
  {
    title: 'تجربة عربية',
    text: 'واجهة ومحتوى باتجاه عربي واضح',
    icon: <><path d="M4 5h12v10H4z" /><path d="M7 8h6M7 11h4" /></>,
  },
  {
    title: 'أربعة مسارات',
    text: 'كتب ودورات وجلسات وورش عمل',
    icon: <><circle cx="6" cy="6" r="2" /><circle cx="14" cy="6" r="2" /><circle cx="6" cy="14" r="2" /><circle cx="14" cy="14" r="2" /></>,
  },
  {
    title: 'تفاصيل قبل القرار',
    text: 'صفحات مستقلة للمحتوى والمواعيد',
    icon: <><path d="M3 4.5h5.2A2.8 2.8 0 0 1 11 7.3V17a3 3 0 0 0-3-3H3z" /><path d="M17 4.5h-3.2A2.8 2.8 0 0 0 11 7.3V17a3 3 0 0 1 3-3h3z" /></>,
  },
  {
    title: 'حساب واحد',
    text: 'للطلبات والحجوزات والتعلّم',
    icon: <><circle cx="10" cy="7" r="3" /><path d="M4.5 17c.6-3.1 2.4-5 5.5-5s4.9 1.9 5.5 5" /></>,
  },
]

export function TrustStrip() {
  return (
    <section className="border-b border-line bg-surface-raised" aria-label="مزايا المنصة">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-x-reverse lg:divide-line">
        {items.map((item) => (
          <div key={item.title} className="flex min-h-28 items-center gap-3 border-b border-line/70 px-4 py-5 odd:border-e lg:min-h-24 lg:border-b-0 lg:px-7 lg:odd:border-e-0">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center text-antique-gold" aria-hidden>
              <svg viewBox="0 0 20 20" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                {item.icon}
              </svg>
            </span>
            <div>
              <h2 className="font-body text-sm font-bold text-deep-teal">{item.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-text-soft">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
