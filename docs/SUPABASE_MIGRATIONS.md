# SUPABASE MIGRATIONS

Ordered SQL in `supabase/migrations/` — applied via `supabase db push` (all applied to the live project).

| # | File | Contents |
|---|---|---|
| 000 | relocate_legacy | Moves the pre-existing schema (earlier project attempt, real data) untouched into the `legacy` schema; clears legacy auth triggers + storage policies |
| 001 | extensions_helpers | pgcrypto; `set_updated_at`, `is_admin`, `has_role` (SECURITY DEFINER); `check_function_bodies=off` |
| 002 | users_auth | profiles (+signup trigger), admin_roles/permissions, audit_logs, notifications, user_notes/tags + RLS |
| 003 | commerce | products/variants/bundles, coupons(+redemptions), offers(+targets), orders/items, payments(+proofs), content_access, checkout_sessions + RLS (coupons: no public SELECT) |
| 004 | lms | courses/modules/lessons/resources, enrollments, course/lesson progress, notes, reviews, certificates, `is_enrolled` + RLS |
| 005 | books | books, versions, files, access, download logs + RLS |
| 006 | booking | services, availability rules/exceptions, bookings(+events), reschedule requests + RLS |
| 007 | workshops | workshops, registrations, attendance, resources, recordings + RLS |
| 008 | cms | pages(+sections), navigation, articles(+tags), media_assets, site_settings (is_public flag), feature_flags, reviews, contact_messages, newsletter + RLS |
| 009 | reports | report_snapshots, analytics_events (anon insert), system_events + RLS |
| 010 | storage | 7 buckets + object policies (proofs path-scoped to uid; protected buckets admin-write, signed-URL delivery) |
| 011 | order_expiry | `expire_stale_orders()` (SECURITY DEFINER, audit-logged) |
| 012 | rls_hardening | payments.amount = order total; orders total consistency; notification update trigger guard; anon payload size caps |
| 013 | port_legacy_data | Ports real data from `legacy.*` (2 sessions, payment/brand/booking settings); default flags; owner auto-grant for heba0elsherif@gmail.com in signup trigger |
| 014 | schedule_expiry | pg_cron: `expire-stale-orders` hourly |
| 015 | booking_integrity | GiST exclusion constraint and overlap integrity for active bookings |
| 016 | atomic_booking | Advisory-locked RPC creates the validated order, item, booking and events atomically |
| 017 | durable_rate_limits | PostgreSQL-backed rate-limit buckets and authenticated consume RPC |
| 018 | admin_control_center | Membership plans/subscriptions, content revisions, booking admin notes, and unique per-day availability/exception constraints |

## Conventions
- New migrations: next 3-digit prefix + snake_case name (`audit:db` enforces).
- Table + its RLS policies live in the same file. Helpers used by policies are SECURITY DEFINER.
- Data ports read from source tables at runtime (no secrets/values hardcoded).
- Never edit an applied migration — add a new one.
