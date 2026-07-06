# PROJECT STATE
Last session: 2026-07-07 | Current phase: V0.8.0 | Status: in-progress
## Completed phases
- V0.1.0 ✅ foundation: Next.js 16 + TS + Tailwind v4, RTL root, Arabic fonts, brand tokens, audit scripts, docs, check:deploy green
- V0.2.0 ✅ brand system: 10 ui primitives (src/components/ui/ + index barrel), BrandLogo SVG substitute, PublicHeader/PublicFooter, DashboardShell/AdminShell, (public) route group wired
- V0.3.0 ✅ Supabase: migrations 001–010 (all §6 domains + RLS + storage), auth pages, middleware guards, guarded seed, SUPABASE_SETUP.md
- V0.4.0 ✅ homepage: hero (split, portrait+floral SVG substitutes), trust strip, 4 service cards, live offer countdown, featured articles, testimonials carousel, newsletter form — Supabase-backed with editorial fallbacks; visually verified in browser
- V0.5.0 ✅ discovery: /courses (S2 full: category strip w/ counts, cards w/ badge+rating+lessons, comparison panel, offer countdown, testimonials, CTA ribbon), /books, /workshops, /services, /booking, detail pages (course curriculum accordion, book cover art, workshop countdown+seats), /articles + [slug], editorial (about/start-here/faq/contact form→contact_messages), legal ×4 via shared ProsePage, custom 404 — 22 public routes in manifest
- V0.6.0 ✅ checkout: stepper (summary/coupon/method → instructions/proof upload → confirmation), server actions with server-trusted pricing + service-client coupon validation, payment-proofs upload, awaiting_review transition, audit logs, /dashboard/payments timeline
- V0.7.0 ✅ customer dashboard: 10 routes (home w/ greeting+continue-learning+upcoming session+stats, courses w/ progress bars, books, workshops, bookings, orders table, payments timeline, notifications w/ mark-read, profile form, settings w/ password change) — all with real-data queries + polished empty states
## Current phase tasks
- [ ] LMS player V0.8.0 (§11, S4): /dashboard/courses/[slug]/learn ← RESUME HERE
- [ ] Data: getLearnData(slug) — course + modules + lessons + my lesson_progress + notes + resources; access check via course_enrollments
- [ ] Signed-URL playback: server action getLessonVideoUrl(lessonId) — enrollment check then service-client createSignedUrl (course-videos bucket)
- [ ] Player UI: video shell, curriculum accordion sidebar (per-module x/y), mark-complete, prev/next, notes CRUD, resources downloads, progress ring
- [ ] Progress writes: markLessonComplete server action updates lesson_progress + recomputes course_progress.percent
- [ ] Gate + commit
## Next 3 actions (exact, concrete)
1. Build src/lib/data/learn.ts + src/lib/actions/learn.ts (getLearnData, getLessonVideoUrl, markLessonComplete, saveNote/deleteNote).
2. Build LearnClient (client component: player shell + curriculum accordion + notes panel + resources) at /dashboard/courses/[slug]/learn (route uses its own full-width layout, sidebar per S4).
3. Add route to manifest; `pnpm check:deploy`; commit `V0.8.0: LMS player`.
## Blockers / needs user input
- Brand assets missing in /public/brand (logo, portrait, florals, photos) — using branded SVG/CSS substitutes meanwhile.
- The 4 reference screenshots (S1–S4) were not attached; building from §2 written specs. Please attach them before V1.6.0 polish pass.
- Supabase project credentials (URL + anon key + service role) needed to run V0.3.0 against a live project — schema/migrations/auth UI proceed without them; end-to-end auth testing blocked until provided.
