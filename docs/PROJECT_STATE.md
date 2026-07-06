# PROJECT STATE
Last session: 2026-07-06 | Current phase: V0.3.0 | Status: in-progress
## Completed phases
- V0.1.0 ✅ foundation: Next.js 16 + TS + Tailwind v4, RTL root, Arabic fonts, brand tokens, audit scripts, docs, check:deploy green
- V0.2.0 ✅ brand system: 10 ui primitives (src/components/ui/ + index barrel), BrandLogo SVG substitute, PublicHeader/PublicFooter, DashboardShell/AdminShell, (public) route group wired
## Current phase tasks
- [ ] Install @supabase/supabase-js + @supabase/ssr; create src/lib/supabase/{client,server,middleware}.ts ← RESUME HERE
- [ ] Write supabase/migrations/*.sql for all §6 tables (ordered: users/auth → commerce → LMS → books → booking → workshops → CMS → reports)
- [ ] RLS policies per §7 + storage buckets SQL
- [ ] Auth pages: /auth/login, /auth/register, /auth/reset-password (inside (public) group)
- [ ] middleware.ts guarding /dashboard/* (auth) and /admin/* (role)
- [ ] Seed script (SEED_DEMO=true, realistic Arabic demo data)
- [ ] Update scripts/expected-routes.json with auth routes; gate + commit
## Next 3 actions (exact, concrete)
1. `pnpm add @supabase/supabase-js @supabase/ssr`; write src/lib/supabase helpers (browser client, server client with cookies, middleware session refresh).
2. Write migrations 001–00N per §6 order + RLS + buckets; write supabase/seed.sql behind SEED_DEMO.
3. Build auth pages + middleware.ts; add routes to manifest; run `pnpm check:deploy`; commit `V0.3.0: Supabase schema, RLS, auth, guards, seed`.
## Blockers / needs user input
- Brand assets missing in /public/brand (logo, portrait, florals, photos) — using branded SVG/CSS substitutes meanwhile.
- The 4 reference screenshots (S1–S4) were not attached; building from §2 written specs. Please attach them before V1.6.0 polish pass.
- Supabase project credentials (URL + anon key + service role) needed to run V0.3.0 against a live project — schema/migrations/auth UI proceed without them; end-to-end auth testing blocked until provided.
