const items = [
  { title: 'محتوى عربي أصيل', text: 'مواد مكتوبة ومصوّرة بالعربية، لا ترجمات مقتضبة.' },
  { title: 'وصول مدى الحياة', text: 'اشتري مرة واحدة وارجعي للمحتوى وقتما شئتِ.' },
  { title: 'دفع آمن وميسّر', text: 'إنستاباي، محافظ إلكترونية، أو تحويل بنكي.' },
  { title: 'دعم شخصي حقيقي', text: 'فريق يرد عليك خلال ٢٤ ساعة كحد أقصى.' },
]

export function TrustStrip() {
  return (
    <section className="border-y border-line bg-soft-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex gap-4">
            <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-antique-gold/15" aria-hidden>
              <svg viewBox="0 0 20 20" className="h-5 w-5 text-antique-gold" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <h3 className="font-body text-base font-bold text-deep-teal">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-text-soft">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
