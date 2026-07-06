# DECISIONS (append-only)

## 2026-07-06 — V0.1.0
- **Next.js 16.2.10 (App Router) + React 19 + Tailwind CSS v4.** Latest stable at build time. Tailwind v4 uses CSS-first `@theme` in `src/app/globals.css`; `src/styles/tokens.ts` mirrors the palette for JS consumers (charts, inline styles). Reason: single source kept in two synced forms — CSS vars for utilities, TS for runtime.
- **pnpm 10.13.1 pinned via `packageManager` + corepack**, Node 24 (`engines`, `.nvmrc`). Per master plan §4.
- **Fonts via `next/font/google`:** Amiri (headings), Aref Ruqaa (decorative accents), IBM Plex Sans Arabic (body) with Cairo fallback. Exposed as CSS variables consumed by `--font-heading/--font-decorative/--font-body`.
- **RTL at the root:** `<html lang="ar" dir="rtl">`; all spacing uses logical utilities (ps/pe/ms/me, start/end).
- **Audit scripts are manifest-driven:** `scripts/expected-routes.json` lists routes that must exist; it grows each phase so `audit:routes` can gate every phase without failing on not-yet-built routes.
- **`--color-line` (not `--color-border`)** for the brand border token — Tailwind v4 reserves sensible defaults for `border-*` utilities and `line` avoids collision with `border-border` ambiguity.
- **Brand assets not yet provided** (logo, portrait, florals). Building refined CSS/SVG ornament substitutes per §3; tracked in KNOWN_ISSUES.md.

## 2026-07-06 — V0.2.0
- **Zero extra UI deps:** primitives use a 6-line `cn()` join instead of clsx/cva; sparklines and ornaments are inline SVG. Keeps bundle lean and audit surface small.
- **`Button` renders `next/link` when `href` is passed** — one API for actions and navigation.
- **Sidebar is one shared client component** parameterized by sections/badges; `DashboardShell` and `AdminShell` are thin config wrappers (no duplicated sidebar code, per token economy).
- **audit:ux placeholder rule refined:** `placeholder=` attr, `placeholder:` Tailwind variant, and `::placeholder` are allowed; the word as content/naming still fails.
- **Countdown first tick deferred to a macrotask** — avoids hydration mismatch and satisfies react-hooks/set-state-in-effect.

## 2026-07-06 — V0.3.0
- **RLS lives inline with each domain migration** (table + its policies in one file) instead of a trailing mega-file — easier review and per-domain evolution.
- **`is_admin()` / `has_role()` / `is_enrolled()` are SECURITY DEFINER SQL functions** so policies avoid recursive RLS lookups on admin_roles.
- **Coupons have no public SELECT at all** — validation happens server-side; public surfaces only ever see the result of applying a code.
- **Lesson/curriculum metadata is public for published courses** (needed for discovery/curriculum preview); `video_path` rows are harmless without a signed URL since buckets are private. Playback is gated server-side via `content_access` + signed URLs.
- **site_settings has an `is_public` flag** — payment account details are public-readable (shown at checkout); everything else admin-only.
- **Supabase clients:** browser client created lazily inside handlers (never module scope) so builds don't need env vars; middleware refreshes sessions and guards /dashboard (auth) + /admin (admin_roles lookup); service-role client only in `getServiceClient()` for post-access-check signed URLs and grants.
- **Seeder is triple-guarded:** SEED_DEMO=true required, DATABASE_URL required, remote supabase.co URLs blocked without SEED_ALLOW_REMOTE=true.

## 2026-07-06 — V0.4.0
- **Homepage data layer (`src/lib/data/home.ts`) returns editorial Arabic fallbacks** when Supabase env is missing or a query fails — the page is never blank and never shows an error to visitors. Fallback shapes mirror seeded rows so swapping to live data is a no-op.
- **Rolling 7-day countdown for the fallback offer is computed in the data layer**, not in component render (React compiler forbids impure calls like Date.now during render).
- **Portrait/floral are branded inline-SVG compositions** (arched frame + silhouette + gold leaves), not gray boxes — swap targets for real assets (KNOWN_ISSUES #1).
- **`revalidate = 300` on the homepage** — ISR keeps offers/testimonials fresh without per-request DB reads.

## 2026-07-06 — V0.5.0
- **One catalog data layer** (`src/lib/data/catalog.ts`) with typed mappers + Arabic editorial fallbacks mirroring seed.sql — every discovery/detail page works with or without Supabase env.
- **Curriculum/FAQ accordions use native `<details>/<summary>`** — zero JS, accessible, RTL-correct.
- **Product covers are branded gradient+glyph compositions** per kind (course/book/workshop/session) via one `ProductCard`; book detail renders a typographic cover. All swap targets for real photography.
- **Legal pages share `ProsePage`**; contact form inserts into `contact_messages` under the anon insert policy.
- **`/checkout/:path*` added to middleware matcher** — checkout requires login (order rows are user-owned under RLS).

## 2026-07-06 — V0.6.0
- **Checkout is one client stepper (summary/coupon/method → instructions/proof → confirmation)** backed by three server actions in `src/lib/actions/checkout.ts`. Prices and coupon math are always recomputed server-side; client totals are display-only.
- **Coupon validation uses the service client** (coupons have no public SELECT) after an auth check; enforces active/window/global-limit/per-user-limit.
- **`submitPaymentProof` verifies ownership + `pending_payment` + expiry under the user's RLS context first**, then uses the service client only for the storage upload and the `awaiting_review` transition (status changes are admin-gated under RLS by design). File constraints: image types only, ≤5MB, stored at `payment-proofs/<uid>/<orderId>/`.
- **Order expiry is enforced at read/submit time** (expired orders reject proof uploads and display as منتهي). A scheduled job to flip DB status comes in V1.1.0 — tracked in KNOWN_ISSUES #3.
- **Format helpers moved to client-safe `src/lib/format.ts`** — data-layer modules import server-only APIs and must never be imported by client components.

## 2026-07-07 — V0.7.0
- **`withUser()` wrapper in dashboard data layer** — one place handles env-missing/unauthenticated/query-error fallbacks for all customer queries.
- **`isPast`/`isFuture` helpers in `src/lib/format.ts`** — React compiler forbids `Date.now()` in component bodies; time comparisons live outside render.
- **Account server actions use the user's RLS context only** (no service client): profiles update + notifications mark-read + `auth.updateUser` password change are all self-scoped operations.
- **Email change and account deletion are deliberately manual** (contact-based) until a verified-email-change flow lands post-MVP.

## 2026-07-07 — V0.8.0
- **Lesson access is checked server-side per request** (`checkLessonAccess`): preview lessons open to any signed-in user; others require a `course_enrollments` row. Signed URLs: 1h for videos, 10min for resources.
- **Course percent recomputed from scratch on every toggle** (completed count / total) rather than incremental — idempotent under retries and immune to drift.
- **Player works in demo mode** (no env): curriculum from catalog fallbacks, local-only completion/notes, clear "وضع العرض" badge — never a broken screen.
- **Dark-mode toggle (S4) deferred to V1.6.0 polish** — needs a theme strategy across all three shells at once.

## 2026-07-07 — V0.9.0
- **Defense in depth for /admin:** middleware role lookup + `requireAdmin()` in the layout + per-action `requireAdminUser()` inside every admin server action (client can never be trusted).
- **Approve flow grants domain access rows** (course_enrollments / book_access / workshop_registrations) in addition to `content_access` — the LMS and library read their own tables, not the generic grant.
- **Reject requires a reason (min 3 chars)** — it is shown verbatim to the customer in her notification and payment timeline (§8).
- **Charts are hand-rolled SVG** (line+area, donut, sparkline) in brand tokens; donut segments precomputed via reduce (React compiler forbids render-time mutation).
- **Admin demo mode:** without env, requireAdmin lets the UI render with zeroed KPIs and honest empty states — no fake numbers, per honesty rules (§17).

## 2026-07-07 — V1.1.0
- **`expire_stale_orders()` is a SECURITY DEFINER SQL function** (migration 011) with pg_cron scheduling instructions in the file — expiry now flips DB rows and writes audit logs, closing KNOWN_ISSUES #3.
- **Bundle grants expand at approval time**: approvePayment walks product_bundles children so each child grants its own domain row (enrollment/book_access/registration).
- **Refund revokes `content_access` by order_id**; domain rows (enrollments, book_access) are left for manual review — revoking a half-finished course automatically felt wrong for a human-scale operation.
- **Rejected payments offer re-upload inline** on /dashboard/payments (order returns to pending_payment per §8), gated by the order's expiry window.

## 2026-07-07 — V1.2.0
- **Offer resolution is one shared server helper** (`resolveActiveOffer` + `applyOffer`): checkout page display and `createOrder` both call it, so the client can never present a price the server wouldn't recompute. Best offer = largest percent, then largest fixed; untargeted offers apply to everything.
- **Coupon redemptions are recorded at payment approval, not order creation** — an unpaid abandoned order never burns a use.
- **Order rows now separate list price (`subtotal`) from combined offer+coupon `discount`** for accurate revenue reporting.
- **Coupon/offer admin CRUD uses the service client after a per-action admin check** (coupons/offers writes are admin-gated under RLS; forms are Arabic-first with datetime-local windows).

## 2026-07-07 — V1.3.0
- **Reports aggregate in the app layer** (12-month window, paid orders only) instead of SQL views — datasets are human-scale; revisit with materialized views if volume demands.
- **Snapshots store the full aggregate JSON** in report_snapshots so historical numbers survive later schema changes.
- **`track()` is fire-and-forget** with a sessionStorage session id; RLS allows anon INSERT and admin-only SELECT. It must never throw or block UI.

## 2026-07-07 — V1.4.0
- **One whitelisted `adminSetField` action** covers all publish/approve toggles — (table, field) pairs are hard-coded; no generic table access from the client, ever.
- **`adminList()` generic reader** collapsed 15 admin list pages into thin declarative tables (read-side only; RLS still applies on top).
- **Feature flags flow server→client**: (public) layout fetches flags and passes to PublicHeader; nav items with an off flag disappear (§10). vip_program stays off until the program page exists.
- **Roles are owner-gated twice** (action checks `role === 'owner'`; RLS "owner manages" policy backs it).
- **Curriculum builder is append-based** (auto sort = count+1); drag-reorder deferred to post-V2 backlog.

## 2026-07-07 — V1.5.0
- **Rate limiting is in-memory sliding-window** (per instance) — right-sized for a human-scale platform; documented upgrade path (Upstash/pg) in SECURITY_REPORT.md.
- **`payments.amount` must equal `orders.total` at INSERT (RLS subquery)** — the admin approval queue displays payments.amount, so a falsified amount was the one real integrity gap found in review.
- **Notification content is trigger-guarded** — users may only flip `read_at`; RLS can't restrict columns so a BEFORE UPDATE trigger raises on any other change.

## 2026-07-07 — V1.6.0
- **Middleware passes through when Supabase env is missing** — demo mode was returning 500 on every guarded route (caught in the browser pass); pages already handle their own demo/empty states.
- **`lessonsLabel()` handles Arabic count grammar** (درس واحد/درسان/دروس/درسًا) — applied on discovery, detail, and dashboard.
- **Countdown digits now Arabic-Indic** via toLocaleString(minimumIntegerDigits) for numeral consistency with the rest of the UI.
- **Streak = consecutive active days from lesson_progress.completed_at** (30-day lookback, today-or-yesterday anchored); achievements derive from certificates + course_progress thresholds (50%/100%).
