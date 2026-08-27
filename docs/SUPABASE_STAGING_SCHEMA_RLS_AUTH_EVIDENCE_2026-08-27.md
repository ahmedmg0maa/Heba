# Supabase Staging schema, RLS and Auth evidence — 2026-08-27

## Decision

`ENVIRONMENT-BLOCKED — SUPABASE STAGING NOT ACCEPTED`

This record covers the current Code X worktree only. It does not convert historical Production or Staging notes into current acceptance evidence. No database, Auth, Storage, migration or provider setting was written during this programme.

## Environment identity and recovery gate

| Check | Result | Evidence boundary |
|---|---|---|
| Production project | known historically as masked ref `zfbw…jidc` | not queried in this execution |
| Separate empty Staging project | known historically as masked ref `uecv…cphp` | not configured in the current executor; no keys or database password are present |
| Production logical-backup source | `BLOCKED` | the executor variable `HEBA_LAUNCH_PRODUCTION_DATABASE_URL` is absent; its value was neither requested nor read |
| Full logical backup | `not-run-by-design` | fail-closed runner must not connect without the secure executor-only source |
| Isolated restore drill | `not-run-by-design` | cannot start before the logical backup source exists |
| Staging recovery point | `unverified` | no provider or restored target evidence in this execution |

## Source-level migration evidence

| Contract | Result | Command/evidence |
|---|---|---|
| Sequential source migrations 000–047 | `PASS-local` | `pnpm audit:db` |
| Mandatory booking order 044 → 045 → 046 → 047 | `PASS-local` | `pnpm verify:booking-staging-contract` |
| Sanitized pre/post contract fixtures | `PASS-local` | `pnpm verify:booking-staging-contract-fixtures` |
| 043 protected-delivery source contracts | `PASS-local` | `pnpm verify:delivery-local`, database/media/security audits |
| 044/045 hold, expiry, duplicate denial, cancellation/reschedule and Cairo-time contract | `PASS-local` | `pnpm verify:booking-local`, `pnpm verify:booking-permissions-local` |

Fixture success is not a live schema fingerprint. It proves the validator rejects the wrong grants/policies/order; it does not prove that the provider schema matches those fixtures.

## Required Staging probes not yet run

- fresh pre-043 and post-043 schema fingerprints against the separate Staging target;
- recovery checksum, restore integrity, RPO/RTO and named restore owner;
- 044 → 045 → 046 → 047 application on Staging only;
- real anonymous/authenticated/customer/Admin RLS matrix and RPC grant-denial probes;
- two disposable users for row isolation, booking race, checkout idempotency, proof review and entitlement revocation;
- private Storage upload/finalize/MIME/magic/range/signed-URL/device/concurrency tests;
- Staging Site URL and exact redirect allow-list;
- disposable Admin enrollment outside chat, AAL1 denial, TOTP AAL2/fresh assurance, session expiry and audit.

## Safety conclusion

Production remains untouched and 043 must not be reapplied. Migrations 044–047 remain unapplied in this execution. Migrations 048–050 are intentionally not authored or applied before the ordered Staging gate succeeds.

## Exact unblock

The next external action is to configure `HEBA_LAUNCH_PRODUCTION_DATABASE_URL` in the secure executor environment only—not in chat, `.env`, GitHub or a report. Once present, `scripts/run-launch-recovery-drill.ps1` can create an isolated disposable restore target, record sanitized evidence and clean the temporary target/artifacts before any Staging migration request proceeds.
