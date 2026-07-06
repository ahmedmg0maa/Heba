export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="h-px w-16 bg-antique-gold" aria-hidden />
        <p className="text-sm font-medium tracking-widest text-antique-gold">
          منصة هبة الشريف
        </p>
      </div>
      <h1 className="max-w-2xl text-5xl leading-relaxed font-bold text-deep-teal md:text-6xl">
        رحلة تطوّر <span className="text-burgundy">واعية</span> تبدأ من هنا
      </h1>
      <p className="max-w-xl text-lg leading-loose text-text-soft">
        دورات تدريبية، كتب، ورش عمل، وجلسات فردية — مساحة هادئة صُمّمت بعناية
        لتنمو فيها على مهل. المنصة قيد البناء وتُفتتح أبوابها للدفعة الأولى من
        قائمة الانتظار.
      </p>
      <div className="mt-4 rounded-full border border-line bg-soft-white px-8 py-3 text-sm text-taupe shadow-card">
        الإصدار التأسيسي V0.1.0
      </div>
    </main>
  );
}
