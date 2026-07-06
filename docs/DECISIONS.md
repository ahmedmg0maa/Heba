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
