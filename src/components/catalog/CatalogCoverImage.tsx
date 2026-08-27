export function CatalogCoverImage({ url, title, className = '' }: { url: string | null; title: string; className?: string }) {
  if (!url) return null
  return <div role="img" aria-label={`غلاف ${title}`} className={`overflow-hidden rounded-2xl border border-line bg-sand/20 bg-cover bg-center shadow-card ${className}`} style={{ backgroundImage: `url(${url})` }} />
}

