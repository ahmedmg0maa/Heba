import { cn } from '@/lib/cn'

// Refined SVG floral substitute until /public/brand/floral-*.svg arrives (KNOWN_ISSUES #1).
export function FloralOrnament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 320" className={cn('text-antique-gold', className)} fill="none" aria-hidden>
      <path d="M60 10v300" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" />
      {[40, 100, 160, 220, 280].map((y, i) => (
        <g key={y} transform={`translate(60 ${y})`}>
          <path
            d={i % 2 === 0 ? 'M0 0C-18 -6 -30 -20 -32 -38 -14 -34 -2 -20 0 0Z' : 'M0 0C18 -6 30 -20 32 -38 14 -34 2 -20 0 0Z'}
            fill="currentColor"
            fillOpacity="0.28"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.6"
          />
          <circle cx={i % 2 === 0 ? -8 : 8} cy="-10" r="2.2" fill="currentColor" fillOpacity="0.7" />
        </g>
      ))}
      <circle cx="60" cy="10" r="3.5" fill="currentColor" fillOpacity="0.8" />
    </svg>
  )
}

// Arched editorial portrait substitute until /public/brand/portrait-*.jpg arrives.
export function PortraitFrame({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <svg viewBox="0 0 380 480" className="w-full drop-shadow-xl" aria-hidden>
        <defs>
          <linearGradient id="arch-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D8D0BE" />
            <stop offset="100%" stopColor="#B59A65" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <path d="M20 470V190C20 96 96 20 190 20s170 76 170 170v280Z" fill="url(#arch-bg)" />
        <path d="M20 470V190C20 96 96 20 190 20s170 76 170 170v280" fill="none" stroke="#B59A65" strokeWidth="2.5" />
        <path d="M38 470V192C38 106 106 38 190 38s152 68 152 154v278" fill="none" stroke="#FFFDF8" strokeWidth="1.5" strokeOpacity="0.8" />
        {/* silhouette */}
        <g fill="#0E3440" fillOpacity="0.92">
          <circle cx="190" cy="200" r="52" />
          <path d="M92 470c0-72 44-118 98-118s98 46 98 118Z" />
        </g>
        {/* gold leaf accents */}
        <g fill="#B59A65" fillOpacity="0.85">
          <path d="M76 120c14 2 24 12 26 26-14-2-24-12-26-26Z" />
          <path d="M304 120c-14 2-24 12-26 26 14-2 24-12 26-26Z" />
        </g>
      </svg>
      <span className="absolute -bottom-3 start-1/2 -translate-x-1/2 rounded-full border border-line bg-soft-white px-6 py-2 text-sm font-semibold text-deep-teal shadow-card rtl:translate-x-1/2">
        هبة الشريف
      </span>
    </div>
  )
}
