# PROJECT STATE
Last session: 2026-07-06 | Current phase: V0.6.0 | Status: in-progress
## Completed phases
- V0.1.0 ✅ foundation: Next.js 16 + TS + Tailwind v4, RTL root, Arabic fonts, brand tokens, audit scripts, docs, check:deploy green
- V0.2.0 ✅ brand system: 10 ui primitives (src/components/ui/ + index barrel), BrandLogo SVG substitute, PublicHeader/PublicFooter, DashboardShell/AdminShell, (public) route group wired
- V0.3.0 ✅ Supabase: migrations 001–010 (all §6 domains + RLS + storage), auth pages, middleware guards, guarded seed, SUPABASE_SETUP.md
- V0.4.0 ✅ homepage: hero (split, portrait+floral SVG substitutes), trust strip, 4 service cards, live offer countdown, featured articles, testimonials carousel, newsletter form — Supabase-backed with editorial fallbacks; visually verified in browser
- V0.5.0 ✅ discovery: /courses (S2 full: category strip w/ counts, cards w/ badge+rating+lessons, comparison panel, offer countdown, testimonials, CTA ribbon), /books, /workshops, /services, /booking, detail pages (course curriculum accordion, book cover art, workshop countdown+seats), /articles + [slug], editorial (about/start-here/faq/contact form→contact_messages), legal ×4 via shared ProsePage, custom 404 — 22 public routes in manifest
## Current phase tasks
- [ ] Checkout §8: /checkout/[productType]/[slug] — product summary, price+offer, coupon field, payment method choice (instapay/wallet/bank from site_settings), create order pending_payment ← RESUME HERE
- [ ] Payment instructions screen + proof upload to payment-proofs bucket → order awaiting_review
- [ ] Server actions: createOrder, applyCoupon (server-side validation), submitProof; audit_logs writes
- [ ] /dashboard/payments status timeline (user side); order auto-expiry after 72h (site_settings) — expiry check on read + note for cron
- [ ] Gate + commit
## Next 3 actions (exact, concrete)
1. Build src/lib/actions/checkout.ts (server actions: createOrder+items, validateCoupon, submitPaymentProof) with RLS-compatible inserts and audit logging.
2. Build /checkout/[productType]/[slug]/page.tsx (auth-guarded by middleware) with steps: summary → method → instructions (from site_settings payment_* keys) → proof upload (client) → confirmation.
3. Minimal /dashboard/payments page with status timeline; add checkout+payments routes to manifest; `pnpm check:deploy`; commit `V0.6.0: checkout + manual payment flow`.
## Blockers / needs user input
- Brand assets missing in /public/brand (logo, portrait, florals, photos) — using branded SVG/CSS substitutes meanwhile.
- The 4 reference screenshots (S1–S4) were not attached; building from §2 written specs. Please attach them before V1.6.0 polish pass.
- Supabase project credentials (URL + anon key + service role) needed to run V0.3.0 against a live project — schema/migrations/auth UI proceed without them; end-to-end auth testing blocked until provided.
