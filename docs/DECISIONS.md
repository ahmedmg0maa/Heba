# DECISIONS (append-only)

## 2026-07-06 — V0.1.0
- **Next.js 16.2.10 (App Router) + React 19 + Tailwind CSS v4.** Latest stable at build time. Tailwind v4 uses CSS-first `@theme` in `src/app/globals.css`; `src/styles/tokens.ts` mirrors the palette for JS consumers (charts, inline styles). Reason: single source kept in two synced forms — CSS vars for utilities, TS for runtime.
- **pnpm 10.13.1 pinned via `packageManager` + corepack**, Node 24 (`engines`, `.nvmrc`). Per master plan §4.
- **Fonts via `next/font/google`:** Amiri (headings), Aref Ruqaa (decorative accents), IBM Plex Sans Arabic (body) with Cairo fallback. Exposed as CSS variables consumed by `--font-heading/--font-decorative/--font-body`.
- **RTL at the root:** `<html lang="ar" dir="rtl">`; all spacing uses logical utilities (ps/pe/ms/me, start/end).
- **Audit scripts are manifest-driven:** `scripts/expected-routes.json` lists routes that must exist; it grows each phase so `audit:routes` can gate every phase without failing on not-yet-built routes.
- **`--color-line` (not `--color-border`)** for the brand border token — Tailwind v4 reserves sensible defaults for `border-*` utilities and `line` avoids collision with `border-border` ambiguity.
- **Brand assets not yet provided** (logo, portrait, florals). Building refined CSS/SVG ornament substitutes per §3; tracked in KNOWN_ISSUES.md.
