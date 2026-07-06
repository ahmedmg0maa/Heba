# منصة هبة الشريف — Heba ElSherif Platform

Premium Arabic-first learning platform: public site, customer dashboard, LMS course player, protected digital content, unified checkout with manual payment-proof review, and a full Admin OS.

## Stack

- **Next.js 16** (App Router, RTL root) · **TypeScript** strict · **Tailwind CSS v4** (CSS-first `@theme`)
- **Supabase** — Postgres + RLS, Auth (SSR cookies), Storage (signed URLs for all protected content)
- **pnpm 10.13.1** (pinned via corepack) · Node **24** · Vercel-ready

## Quick start

```bash
corepack enable && corepack prepare pnpm@10.13.1 --activate
pnpm install --frozen-lockfile
cp .env.example .env.local   # fill from your Supabase project
pnpm dev
```

Without Supabase credentials the site runs in **demo mode**: public pages show editorial fallback content, dashboards show empty states, and ordering is disabled with a clear message.

## Environment

See [.env.example](.env.example). `SUPABASE_SERVICE_ROLE_KEY` is server-only — it must never be prefixed with `NEXT_PUBLIC_`.

## Database

Ordered SQL migrations live in `supabase/migrations/` (001 → 010: helpers, users/auth, commerce, LMS, books, booking, workshops, CMS, reports, storage). Setup steps: [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). Demo seed: `SEED_DEMO=true DATABASE_URL=... pnpm db:seed` (guarded — refuses production).

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js lifecycle |
| `pnpm type-check` / `pnpm lint` | TS + ESLint |
| `pnpm audit:routes` | every route in `scripts/expected-routes.json` exists |
| `pnpm audit:ux` | no placeholders / TODO / lorem / weak coming-soon |
| `pnpm audit:colors` | brand tokens only — no generic Tailwind palette |
| `pnpm audit:security` | no service key in client code, no tracked .env, no package-lock |
| `pnpm audit:admin` | admin tree has a role gate |
| `pnpm audit:db` | migration naming/order sanity |
| `pnpm audit:launch` | required files present |
| `pnpm check:deploy` | type-check + lint + build + all audits (phase gate) |

## Project docs

- [docs/MASTER_PLAN.md](docs/MASTER_PLAN.md) — full product spec (do not edit)
- [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) — single source of truth for progress
- [docs/DECISIONS.md](docs/DECISIONS.md) — technical decision log
- [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md) — open items with severity
- [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) — backend setup

## Deployment (Vercel)

`vercel.json` pins the install command (corepack + frozen lockfile). Set the three Supabase env vars in the Vercel project. Detailed guides land in `DEPLOYMENT.md` / `VERCEL_DEPLOYMENT.md` at V1.8.0.
