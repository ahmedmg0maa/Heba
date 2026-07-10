# DEPLOYMENT

The platform is a single Next.js app backed by a Supabase project. Production = Vercel + Supabase.

## Current state (V1.8.0)
- **Supabase project:** `HebaElSherif` (`azuvwkzpgtyxwxmvedmp`, eu-central-1) — live, all 15 migrations applied (000–014), buckets created, hourly order-expiry cron scheduled, real services/payment settings ported.
- **App:** builds green via `pnpm check:deploy`; demo-mode fallbacks activate only when env vars are absent.

## 1. Backend (already done — for reference/re-provisioning)
Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md). Summary: `supabase link --project-ref <ref>` then `supabase db push` applies `supabase/migrations/` in order.

## 2. Frontend → Vercel
See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for the click-by-click guide.

## 3. Post-deploy checklist
- [ ] Supabase Auth → URL Configuration: set **Site URL** to the production domain; add it to redirect allow-list (keep `http://localhost:3000` for dev).
- [ ] Supabase Auth → Providers → Email: **Confirm email = ON**.
- [ ] Owner signs up at `/auth/register` with `heba0elsherif@gmail.com` → owner role is granted automatically (migration 013 trigger). Verify at `/admin/overview`.
- [ ] Update `NEXT_PUBLIC_SITE_URL` in Vercel to the production domain.
- [ ] Add bank transfer details in `/admin/settings` (`payment_bank`: `{"bank":"…","iban":"…","name":"…"}`) if bank transfers should be offered — the method is hidden until configured.
- [ ] Create first course/book content via `/admin` + upload files to the protected buckets.
- [ ] Smoke test: register a test customer → buy a session → upload proof → approve from `/admin/payments` → verify access + notification.

## Rollback
Vercel: promote the previous deployment. Database: migrations are forward-only — restore from Supabase PITR/backups if needed. The pre-existing schema from the earlier attempt is preserved untouched in the `legacy` schema.
