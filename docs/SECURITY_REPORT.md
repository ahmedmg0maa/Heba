# SECURITY REPORT — V1.5.0

Scope: full review of auth, RLS, storage, server actions, and client/server boundaries.
Verified automatically on every build by `pnpm audit:security` (+ `audit:admin`).

## What was built / verified

### Authentication & session
- Supabase Auth (email/password) with SSR cookie sessions (`@supabase/ssr`), refreshed in middleware.
- Middleware guards `/dashboard/*` and `/checkout/*` (session) and `/admin/*` (session + `admin_roles` lookup).
- Defense in depth on admin: middleware → `requireAdmin()` in layout → `requireAdminUser()` re-check inside **every** admin server action.
- Password reset never reveals whether an email is registered.

### Row Level Security (all tables have RLS enabled)
- Users read/write only their own rows: orders, order_items, payments, payment_proofs, bookings, enrollments, progress, notes, notifications, content_access, checkout_sessions, book_access, registrations, certificates.
- Public reads only published/active/approved rows: products, courses/modules/lessons (metadata), books, workshops, services, articles, pages, offers, reviews.
- **Coupons have no public SELECT at all** — validated server-side with the service client.
- Owner-only: admin_roles / admin_permissions management.
- Admin-only: audit_logs, report_snapshots, system_events, contact inbox, newsletter list, analytics reads.
- V1.5.0 hardening (migration 012):
  - `payments` INSERT now requires `amount = orders.total` (prevents falsified amounts in the approval queue).
  - `orders` INSERT now requires `total = greatest(0, subtotal - discount)` with non-negative parts.
  - Notification updates by users restricted to `read_at` via trigger (RLS cannot restrict columns).
  - Size caps on anon-insertable payloads (analytics props < 4KB, contact message ≤ 5000 chars).

### Storage
- Private buckets: protected-books, course-videos, course-resources, payment-proofs, workshop-recordings.
- Delivery is exclusively via server-generated signed URLs **after an explicit access check**: videos 60min (enrollment or preview), resources 10min (RLS-gated row read), proofs 10min (admin-only).
- Uploads: payment proofs land in `payment-proofs/<uid>/<orderId>/`, path-scoped by RLS; server action re-validates type (jpeg/png/webp) and size (≤5MB).
- avatars/public-media: public read; writes owner-scoped / admin-only respectively.

### Server actions
- Prices, offers, and coupons are always recomputed server-side (`resolveActiveOffer` + `applyOffer` + `validateCoupon`); client totals are display-only.
- `adminSetField` uses a hard-coded (table, field) whitelist — no generic table access is reachable from the client.
- Rate limits (V1.5.0): coupon validation 10/5min/user; proof upload 5/10min/user (in-memory sliding window — see Limitations).
- Every sensitive mutation writes `audit_logs` with the actor id.

### Secrets & client/server boundary
- `SUPABASE_SERVICE_ROLE_KEY` used only in `getServiceClient()` (server modules); `audit:security` fails the build if it appears in a `"use client"` file or with a `NEXT_PUBLIC_` prefix, and scans for hardcoded JWT-shaped strings.
- No `.env*` files tracked by git (also build-enforced).
- Format helpers are isolated in `src/lib/format.ts` so client components never import server-only data modules.

## Commands run
`pnpm check:deploy` (type-check, lint, build, audit:routes/ux/colors/security/admin/db/launch) — all green.

## Known limitations / follow-ups
| Item | Severity | Plan |
|---|---|---|
| Rate limiter is per-instance memory; resets on cold start and doesn't share across regions | low | Swap to Upstash Redis or a pg-backed counter if abuse is observed |
| Proof review is human judgment (amount now enforced, authenticity is not) | accepted | Inherent to manual payment flow; audit trail covers disputes |
| `expire_stale_orders()` must be scheduled (pg_cron) on the live project | low | Instructions in migration 011; verify at V1.8.0 staging |
| Email confirmation must be enabled in Supabase Auth settings | low | Checklist item in SUPABASE_SETUP.md |
| `middleware.ts` → `proxy.ts` rename (Next 16 deprecation) | low | V1.9.0 |
