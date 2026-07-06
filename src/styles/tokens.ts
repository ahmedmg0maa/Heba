export const brandColors = {
  ivory: '#F7F2EA',
  softWhite: '#FFFDF8',
  sand: '#D8D0BE',
  taupe: '#9C9484',
  khaki: '#A79C82',
  deepTeal: '#0E3440',
  tealHover: '#123F4C',
  burgundy: '#7A1F2B',
  burgundySoft: '#B45A64',
  cobalt: '#2F6FA8',
  antiqueGold: '#B59A65',
  mutedGold: '#D5C49E',
  ink: '#1F1E1C',
  textSoft: '#6E675D',
  border: '#E6DDCF',
} as const

export type BrandColor = keyof typeof brandColors

export const fonts = {
  heading: 'var(--font-amiri)',
  decorative: 'var(--font-aref-ruqaa)',
  body: 'var(--font-plex-arabic)',
} as const

export const radii = {
  sm: '0.375rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
} as const

export const shadows = {
  card: '0 1px 3px rgba(31, 30, 28, 0.06), 0 6px 24px rgba(31, 30, 28, 0.05)',
  cardHover: '0 2px 6px rgba(31, 30, 28, 0.08), 0 12px 36px rgba(31, 30, 28, 0.09)',
  sidebar: '-4px 0 24px rgba(14, 52, 64, 0.12)',
} as const
