# PROJECT STATE
Last session: 2026-07-07 | Current phase: V1.7.0 | Status: in-progress
## Completed phases
- V0.1.0 ✅ foundation: Next.js 16 + TS + Tailwind v4, RTL root, Arabic fonts, brand tokens, audit scripts, docs, check:deploy green
- V0.2.0 ✅ brand system: 10 ui primitives (src/components/ui/ + index barrel), BrandLogo SVG substitute, PublicHeader/PublicFooter, DashboardShell/AdminShell, (public) route group wired
- V0.3.0 ✅ Supabase: migrations 001–010 (all §6 domains + RLS + storage), auth pages, middleware guards, guarded seed, SUPABASE_SETUP.md
- V0.4.0 ✅ homepage: hero (split, portrait+floral SVG substitutes), trust strip, 4 service cards, live offer countdown, featured articles, testimonials carousel, newsletter form — Supabase-backed with editorial fallbacks; visually verified in browser
- V0.5.0 ✅ discovery: /courses (S2 full: category strip w/ counts, cards w/ badge+rating+lessons, comparison panel, offer countdown, testimonials, CTA ribbon), /books, /workshops, /services, /booking, detail pages (course curriculum accordion, book cover art, workshop countdown+seats), /articles + [slug], editorial (about/start-here/faq/contact form→contact_messages), legal ×4 via shared ProsePage, custom 404 — 22 public routes in manifest
- V0.6.0 ✅ checkout: stepper (summary/coupon/method → instructions/proof upload → confirmation), server actions with server-trusted pricing + service-client coupon validation, payment-proofs upload, awaiting_review transition, audit logs, /dashboard/payments timeline
- V0.7.0 ✅ customer dashboard: 10 routes (home w/ greeting+continue-learning+upcoming session+stats, courses w/ progress bars, books, workshops, bookings, orders table, payments timeline, notifications w/ mark-read, profile form, settings w/ password change) — all with real-data queries + polished empty states
- V0.8.0 ✅ LMS player: /dashboard/courses/[slug]/learn — video shell w/ signed-URL playback (enrollment/preview-gated), curriculum accordion w/ per-module x/y + checkmarks, mark-complete w/ percent recompute, prev/next, notes CRUD, resources signed downloads, progress ring, not-enrolled state, demo mode
- V0.9.0 ✅ admin foundation: requireAdmin layout gate + sidebar badges, /admin/overview (KPI cards w/ sparkline, 6-month revenue SVG chart, bookings donut, approvals preview, recent customers, today schedule), /admin/payments functional queue (proof signed-URL preview, approve → paid + access grants by product type + enrollment/book_access/registration + notify + audit; reject → required reason + order back to pending_payment + notify + audit)
- V1.0.0 ✅ MVP gate: README, frozen-lockfile verified, full check:deploy green, tagged v1.0.0
- V1.1.0 ✅ commerce completion: expire_stale_orders() (migration 011 + pg_cron notes), bundle child-grant expansion, /admin/orders lifecycle (status filters, cancel/refund w/ notify+audit, refund revokes content_access), inline proof re-upload for rejected payments
- V1.2.0 ✅ offers/coupons: /admin/coupons + /admin/offers CRUD w/ activate toggles + redemption counts, coupon redemption recorded at approval, offer-aware server-side pricing (resolveActiveOffer/applyOffer in checkout page AND createOrder), offer label at checkout. Note: discovery-card offer badges still via compareAtPrice; live offer badges on cards → V1.6.0 polish
- V1.3.0 ✅ reports: /admin/reports (revenue by month + by product type, per-course enrollments/avg-progress/completions, bookings by status), report_snapshots save+list, track() analytics helper wired into checkout (order_created, proof_submitted) + newsletter (subscribed)
- V1.4.0 ✅ CMS + full admin coverage: all 23 §5 admin routes live — products/books/courses/workshops publish toggles, curriculum builder (add module/lesson), bookings status controls w/ notify, users list, articles create+publish, reviews approve/feature/delete, pages SEO editor, media registry, settings editor + feature-flag toggles (flags drive public nav), roles grant/revoke (owner-only), audit-logs viewer, security posture page, system status
- V1.5.0 ✅ security hardening: rate limits (coupon 10/5min, proof 5/10min), migration 012 (payments amount = order total, orders total consistency, notification-update trigger guard, anon payload size caps), docs/SECURITY_REPORT.md
- V1.6.0 ✅ visual polish: browser pass done — **fixed demo-mode 500 on all guarded routes (middleware now passes through without env)**, Arabic lesson pluralization (lessonsLabel), Arabic-Indic countdown digits, S4 streak day-dots + achievements feed on /dashboard. S1–S4 screenshots still not provided (KNOWN_ISSUES #2) — polished against §2 specs
## Current phase tasks
- [ ] V1.7.0 mobile QA ← RESUME HERE
- [ ] Browser pass at 375/768/1024 over: /, /courses, /courses/[slug], /books, /workshops, /booking, /faq, /auth/login, /checkout, /dashboard, learn, /admin/overview, /admin/payments
- [ ] Fix found issues (overflow, tap targets, sidebar behavior on mobile — Sidebar is fixed w-64: needs mobile drawer or top-bar fallback for dashboard/admin)
- [ ] docs/MOBILE_QA_REPORT.md
- [ ] Gate + commit
## Next 3 actions (exact, concrete)
1. Make Sidebar responsive (hidden on <lg with a slide-over drawer + hamburger topbar in DashboardShell/AdminShell).
2. Preview at 375px: walk the route list, fix overflow/spacing; then 768/1024 spot check.
3. Write MOBILE_QA_REPORT.md; gate; commit `V1.7.0: mobile QA`.
## Blockers / needs user input
- Brand assets missing in /public/brand (logo, portrait, florals, photos) — using branded SVG/CSS substitutes meanwhile.
- The 4 reference screenshots (S1–S4) were not attached; building from §2 written specs. Please attach them before V1.6.0 polish pass.
- Supabase project credentials (URL + anon key + service role) needed to run V0.3.0 against a live project — schema/migrations/auth UI proceed without them; end-to-end auth testing blocked until provided.
