# PROJECT STATE
Last session: 2026-07-06 | Current phase: V0.5.0 | Status: in-progress
## Completed phases
- V0.1.0 ✅ foundation: Next.js 16 + TS + Tailwind v4, RTL root, Arabic fonts, brand tokens, audit scripts, docs, check:deploy green
- V0.2.0 ✅ brand system: 10 ui primitives (src/components/ui/ + index barrel), BrandLogo SVG substitute, PublicHeader/PublicFooter, DashboardShell/AdminShell, (public) route group wired
- V0.3.0 ✅ Supabase: migrations 001–010 (all §6 domains + RLS + storage), auth pages, middleware guards, guarded seed, SUPABASE_SETUP.md
- V0.4.0 ✅ homepage: hero (split, portrait+floral SVG substitutes), trust strip, 4 service cards, live offer countdown, featured articles, testimonials carousel, newsletter form — Supabase-backed with editorial fallbacks; visually verified in browser
## Current phase tasks
- [ ] Discovery pages (S2 quality): /courses, /books, /workshops, /services, /booking ← RESUME HERE
- [ ] Detail pages: /courses/[slug], /books/[slug], /workshops/[slug], /articles + /articles/[slug]
- [ ] Static/editorial pages: /about, /start-here, /contact, /faq, /privacy, /terms, /refund, /disclaimer, /not-found
- [ ] Data layer: src/lib/data/{catalog,articles}.ts with fallbacks like home.ts
- [ ] Update expected-routes.json; gate + commit
## Next 3 actions (exact, concrete)
1. Build src/lib/data/catalog.ts (products/courses/books/workshops/services queries + fallbacks) and shared discovery components (ProductCard, CategoryStrip, ComparisonPanel, CTARibbon).
2. Build /courses (S2: hero, category strip w/ counts, featured cards w/ badge+rating+lesson count, why-us comparison, offer ribbon w/ countdown, testimonials, deep-teal CTA ribbon) then reuse for /books, /workshops, /services, /booking + detail pages.
3. Static pages from one shared LegalPage/ProsePage component; update manifest; `pnpm check:deploy`; commit `V0.5.0: discovery + detail + editorial pages`.
## Blockers / needs user input
- Brand assets missing in /public/brand (logo, portrait, florals, photos) — using branded SVG/CSS substitutes meanwhile.
- The 4 reference screenshots (S1–S4) were not attached; building from §2 written specs. Please attach them before V1.6.0 polish pass.
- Supabase project credentials (URL + anon key + service role) needed to run V0.3.0 against a live project — schema/migrations/auth UI proceed without them; end-to-end auth testing blocked until provided.
