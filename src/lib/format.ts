// Locale/format helpers — safe for both server and client components.
export function formatPrice(value: number, currency = 'ج.م') {
  return `${value.toLocaleString('ar-EG')} ${currency}`
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m.toLocaleString('ar-EG')} دقيقة`
  if (m === 0) return `${h.toLocaleString('ar-EG')} ساعات`
  return `${h.toLocaleString('ar-EG')} س ${m.toLocaleString('ar-EG')} د`
}

export const weekdayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
