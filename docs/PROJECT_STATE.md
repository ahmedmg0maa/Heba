# PROJECT STATE
Last session: 2026-07-11 | Current phase: V2.2.0 | Status: done
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
- V1.7.0 ✅ mobile QA: responsive sidebar (mobile top bar + RTL slide-over drawer, verified interactively), shells flex-col→lg:flex-row, programmatic overflow sweep 375/768/1024 across 26 routes — zero overflow, MOBILE_QA_REPORT.md
## Current phase tasks (V1.8.0 staging)
- [x] **LIVE SUPABASE CONNECTED** — user provided .env (project azuvwkzpgtyxwxmvedmp "HebaElSherif", eu-central-1); fixed URL (was dashboard URL → API URL)
- [x] Found pre-existing legacy schema w/ REAL business data (2 sessions 1200/1500 ج.م, Instapay 01037141322, brand tagline) → migration 000 relocates legacy tables non-destructively to `legacy` schema; 013 ports the real data into our schema; owner role auto-grants to heba0elsherif@gmail.com on signup
- [x] All 14 migrations pushed via supabase CLI (repaired legacy history 0001–0009 as reverted); buckets + flags + settings verified live
- [x] Live-mode semantics: empty catalog → honest empty states (fallbacks now only for no-env/error), unknown checkout product → 404, unconfigured payment methods hidden (bank hidden — only instapay+wallet configured), hero fabricated stats replaced with honest descriptors, booking hides empty availability
- [x] Live RLS validated with temp user (profile trigger ✓, valid order ✓, tampered total rejected 42501 ✓, coupons invisible ✓, cleaned up)
- [x] Restored .env.example (was renamed to .env by user; .gitignore now !.env.example)
- [x] DEPLOYMENT.md + VERCEL_DEPLOYMENT.md + SUPABASE_SETUP.md refresh; pg_cron scheduled live (migration 014)
- V1.8.0 ✅ staging: live Supabase integrated, legacy preserved+ported, deployment docs, expiry cron live
- V1.9.0 ✅ production hardening: error.tsx + global-error.tsx boundaries, loading.tsx ×3 groups (PageSpinner), robots.ts + sitemap.ts (dynamic slugs), metadataBase + OpenGraph/Twitter meta, middleware→proxy rename (Next 16 deprecation gone)
- V2.0.0 ✅ FINAL RELEASE: all §16 docs complete (TEST/ROUTE_QA/ADMIN_GUIDE/CUSTOMER_GUIDE/VISUAL_SYSTEM/SUPABASE_MIGRATIONS/FINAL_DELIVERY_REPORT), §15 acceptance verified (frozen-lockfile ✓, check:deploy ✓, no package-lock ✓), tagged v2.0.0
## Current phase tasks
- V2.1.0 ✅ mobile UX pass (user-requested): bottom tab bar, sticky buy bar, safe areas + manifest + icon, touch targets, orders cards on phones — verified live at 375px with real login
- V2.2.0 ✅ brand + luxury + admin elevation (user-requested): official «بذرة نقية» logo as SVG everywhere + app icon, magic-link login (/auth/confirm) + password eye toggle, AdminTopbar global search + quick links + users search + notify tool + pending totals, scroll-reveal/hero entrance/shimmer/gold accents motion system — verified in browser
- (project complete — post-launch items are owner actions, see Blockers)
## Next 3 actions (exact, concrete)
1. (owner) Push to GitHub → deploy per docs/VERCEL_DEPLOYMENT.md.
2. (owner) Register heba0elsherif@gmail.com (auto-owner) + Supabase Auth settings per docs/DEPLOYMENT.md checklist.
3. (next session, if requested) Post-V2 backlog: real brand assets swap-in, Playwright E2E suite, durable rate limiting, drag-reorder curriculum, email-change flow.
## Blockers / needs user input
- Brand assets missing in /public/brand (logo, portrait, florals, photos) — branded SVG/CSS substitutes in place (KNOWN_ISSUES #1).
- Reference screenshots S1–S4 never provided — built/verified against §2 written specs (KNOWN_ISSUES #2).
- Post-launch (owner actions): sign up with heba0elsherif@gmail.com (auto-owner), set Site URL + email confirmation in Supabase Auth, add payment_bank in /admin/settings if bank transfers wanted, push repo to GitHub + import to Vercel per docs/VERCEL_DEPLOYMENT.md.
