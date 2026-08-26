# Testing and quality gates

## Fast checks during implementation

```powershell
pnpm type-check
pnpm lint
pnpm audit:security
pnpm verify:booking-local
pnpm verify:booking-permissions-local
pnpm verify:fresh-admin-assurance
pnpm audit:cms-local
pnpm verify:permissions
pnpm verify:admin-controls
pnpm verify:media
pnpm verify:commerce
```

`verify:permissions` proves that a disposable role-bearing AAL1 password session cannot invoke permissions or perform administrative writes; it deliberately uses the server secret only for the controlled role/mapping setup. Before release, perform the owner-only browser exercise for two independent TOTP enrollments, an AAL2 challenge, and access to an authorized admin page.

`verify:fresh-admin-assurance` is a no-network source contract for the high-impact step-up rule. It proves that the ten-minute AMR check remains in the server path for payment approval/rejection, refunds, role changes, and operational payment settings, and that `reauth=1` cannot auto-skip a pre-existing AAL2 session. Browser/session-token verification remains a controlled staging exercise.

The booking/CMS local checks never load `.env` or contact Supabase. They cover hold expiry/release, duplicate denial, cancellation/reschedule, Cairo DST, static least-privilege grants/revokes, fixed CMS section types, link validation, revisions and permission boundaries. They do not replace staging persistence/RLS tests.

`verify:delivery` requires migration 043. It uses disposable users and content to prove five concurrent book downloads are admitted while the sixth is rate-limited, only two recent devices are admitted, a newer video session revokes the prior session, browser roles cannot call admission RPCs, and workshop delivery/seat/attendance invariants still hold. Do not run it until the target project identity and migration history are confirmed.

`pnpm verify:delivery-local` requires no Supabase connection. It executes the finalization validation shared with the server action and covers accepted/rejected PDF magic bytes, observed MIME mismatch, validation-before-bind ordering, and raw-token/storage-path exclusions in delivery log schemas and upload audit metadata. The deferred live `verify:delivery` additionally removes entitlement and proves denial, validates real Storage range responses for good/bad magic bytes, and inspects persisted security rows; its success must not be claimed until actually run.

`pnpm verify:archive-security` builds disposable nested archives locally and proves that forbidden paths and secret-like content are detected recursively. `package:release` excludes source archives/dumps and then inspects the generated TGZ itself; `audit:security` repeats that archive-content gate.

## Phase boundary

```powershell
pnpm check:deploy
pnpm package:release
pnpm audit:security
```

Inspect `release/manifest.json`; the archive must not contain `.env`, `supabase/.temp`, `.next`, dependencies, test evidence, private reports, or credential-like values.

## Browser and functional QA

- Verify desktop and 390px mobile layouts in Arabic RTL, light and dark themes.
- Test keyboard navigation, focus visibility, labels, errors, empty/loading/success states, and horizontal overflow.
- For each admin mutation, verify persistence after reload, permission denial for an unauthorized role, audit-log entry, and clear success/failure feedback.
- Commerce and booking tests must cover retries, duplicate submissions, stale state, overlapping slots, partial failures, and concurrent requests.
- `verify:commerce` exercises simultaneous checkout, proof submission, approval, rejection, and refund calls against disposable live data and proves single audit/access effects plus RPC isolation.
- Run authenticated Playwright projects only against controlled test data; never package reports or saved auth state.
