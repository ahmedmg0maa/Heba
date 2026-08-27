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
pnpm verify:report-export-local
pnpm verify:home-cms-local
pnpm verify:public-search-local
pnpm verify:start-here-cms-local
pnpm verify:guided-assessment-local
pnpm verify:catalog-publication-local
pnpm verify:program-catalog-local
pnpm verify:media-lifecycle-local
pnpm verify:revision-recovery-local
pnpm verify:admin-operations-ux-local
pnpm verify:contact-governance-local
pnpm verify:testimonial-governance-local
pnpm verify:press-governance-local
pnpm verify:resource-hub-local
pnpm verify:recovery-runner-local
```

`verify:permissions` proves that a disposable role-bearing AAL1 password session cannot invoke permissions or perform administrative writes; it deliberately uses the server secret only for the controlled role/mapping setup. Before release, perform the owner-only browser exercise for two independent TOTP enrollments, an AAL2 challenge, and access to an authorized admin page.

`verify:fresh-admin-assurance` is a no-network source contract for the high-impact step-up rule. It proves that the ten-minute AMR check remains in the server path for payment approval/rejection, refunds, role changes, and operational payment settings, and that `reauth=1` cannot auto-skip a pre-existing AAL2 session. Browser/session-token verification remains a controlled staging exercise.

The booking/CMS local checks never load `.env` or contact Supabase. They cover hold expiry/release, duplicate denial, cancellation/reschedule, Cairo DST, static least-privilege grants/revokes, fixed CMS section types, link validation, revisions and permission boundaries. They do not replace staging persistence/RLS tests.

`verify:report-export-local` proves the source contract for the fixed report datasets, POST/same-origin boundary, fresh-AAL2 step-up, dataset permission, date/row limits, CSV formula neutralization, private response, and fail-closed audit. `verify:home-cms-local` proves the typed homepage registry, structured Admin actions, required-section publication gate, revision/audit integration, safe internal links, public renderer, and preview parity. Both are credential-free source-contract checks; persistence and session behavior still require controlled Staging evidence.

`verify:public-search-local` covers Arabic normalization, published-only sources, bounded results, an accessible public entry and search-page `noindex`. `verify:start-here-cms-local` covers the governed page shell, safe internal links, revision/audit and the formal-assessment handoff. `verify:guided-assessment-local` executes the structured validator and asserts immutable published versions, public-pointer RLS, service-only atomic publish/delete, Admin question/option/result mapping, catalog-root allowlisting, progress/edit accessibility and the deliberate absence of answer persistence or network calls. `verify:catalog-publication-local` covers domain/product publication parity, 046 rights fail-closed behavior, course/book/workshop/service completeness and unavailable checkout denial. `verify:program-catalog-local` covers programme-type-only Admin writes, reset-to-draft edits, service-only atomic publication/composition, published child/plan/resource parity, free-resource checkout denial and the published-only public/search/services consumers. These do not claim Staging persistence, RLS, cron or authenticated browser evidence.

`verify:revision-recovery-local` proves that only page/page-section/article allowlisted fields can be restored, always to draft/hidden state, behind fresh AAL2, with a current-state checkpoint and audit rollback. `verify:admin-operations-ux-local` proves the booking saved view omits customer search/PII and the catalog checklist remains subordinate to server-authoritative publication. Both are source contracts; reload persistence and audit rows still require controlled Staging.

`verify:contact-governance-local` executes the real Contact normalization contract and asserts the source boundary: no anonymous/authenticated direct insert, service-role-only RPC execution, durable device/email throttling, explicit consent, PII-minimized submission/Admin audit and an Inbox consumer wired to the atomic permission-checked RPC. It makes no claim about provider persistence, RLS or distributed concurrency until controlled Staging tests run.

`verify:testimonial-governance-local` executes the real review normalization contract and asserts paid-order entitlement verification, separate text-publication/first-name consent, public RLS/query filters, an atomic permission-checked moderation RPC, privacy-minimized audit and both public/Home/Admin consumers. It does not relabel source inspection as live RLS or persistence evidence.

`verify:press-governance-local` executes the real Press input validator and asserts HTTPS/date/classification limits, the `press.manage` role mapping, service-only atomic CRUD, schedule job, 046 media-rights gate, metadata-only audit and public/Admin/Home consumers with preview. It cannot prove provider cron, RLS or Storage delivery until migration 050 is accepted on controlled Staging.

`verify:resource-hub-local` executes the real Resource input validator and covers incomplete-private versus complete-public state, article/media readiness, transcript/captions, 046 media rights, published related offers, `resources.manage`, service-only atomic CRUD/scheduling, content-free audit and public/detail/Admin/Home/search consumers. Live media playback, RLS and cron remain external Staging evidence.

`verify:media-lifecycle-local` asserts migration 054's soft archive/restore and compatible replacement contract, in-database permission recheck, atomic transfer of media usages and Press/Resource references, service-only grants, minimized audit and storage-object preservation. It also prevents regression to the nonexistent `deleted_at` publication query and proves pickers plus public Press/Resource consumers deny archived media. Provider RLS, Storage and concurrent replacement still require controlled Staging evidence.

`verify:recovery-runner-local` proves that recovery accepts only the Supabase Session pooler on port 5432 with the tenant-qualified Production user, routes the isolated target through the same pooler host, URL-encodes the hidden password, and clears process/unmanaged secret memory. It never opens a database connection. The actual drill is started manually with `powershell -ExecutionPolicy Bypass -File scripts/run-launch-recovery-drill-interactive.ps1` only after a disclosed password has been rotated.

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

`pnpm test:e2e:cloudflare` first performs an isolated vinext build, then runs the same public desktop/mobile contract against local Wrangler with retries disabled. Interactive keyboard tests wait for a client-effect hydration marker rather than a fixed delay; this distinguishes rendered server HTML from an actually interactive Worker client.

- Verify desktop and 390px mobile layouts in Arabic RTL, light and dark themes.
- Test keyboard navigation, focus visibility, labels, errors, empty/loading/success states, and horizontal overflow.
- For each admin mutation, verify persistence after reload, permission denial for an unauthorized role, audit-log entry, and clear success/failure feedback.
- Commerce and booking tests must cover retries, duplicate submissions, stale state, overlapping slots, partial failures, and concurrent requests.
- `verify:commerce` exercises simultaneous checkout, proof submission, approval, rejection, and refund calls against disposable live data and proves single audit/access effects plus RPC isolation.
- Run authenticated Playwright projects only against controlled test data; never package reports or saved auth state.
