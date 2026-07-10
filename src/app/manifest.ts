import type { MetadataRoute } from 'next'

// Installable web app (add-to-home-screen on Android/iOS).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'هبة الشريف — منصة التعلّم والتطوير',
    short_name: 'هبة الشريف',
    description: 'دورات، كتب، ورش عمل، وجلسات فردية لرحلة تطوّر واعية.',
    dir: 'rtl',
    lang: 'ar',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F2EA',
    theme_color: '#0E3440',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
