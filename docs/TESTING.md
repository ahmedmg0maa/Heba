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
pnpm verify:newsletter-governance-local
pnpm verify:admin-security-center-local
pnpm verify:admin-read-integrity-local
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

`verify:newsletter-governance-local` executes the newsletter normalization contract and asserts explicit consent, approved-Privacy/configuration publication gating, browser-direct write revocation, service-only throttled intake, hashed unsubscribe tokens, read-only GET behavior, atomic permission/audit Admin lifecycle and the deliberate absence of Admin resubscribe. It does not claim provider persistence, distributed throttling or outbound-email evidence before controlled Staging.

`verify:admin-security-center-local` asserts that the Security Center cannot render hard-coded live success, cannot convert an unavailable session/event read into an empty result, and never selects request fingerprints or tokens. It verifies migration 056's `system.view` aggregate probes and `admin.access` own-session RPC, including current-session validation, service-only grants and atomic revocation/audit/security-event writes. Actual RLS, Storage, Auth and telemetry status remains unverified until the probe runs on authorized Staging.

`verify:admin-read-integrity-local` proves configured Admin query failures cross a sanitized error boundary, feature flags disable fail-closed, System preserves event/flag read state, and integration readiness examines only required variable names/pairs. It also checks `.env.example` remains value-free and the browser error boundary logs only an opaque digest. A configured badge is not live Resend/Sentry/Supabase evidence.

`verify:resend-outbox-local` proves migration 057's atomic operational-setting write, service-only outbox mutation, dual-permission claim/finalize lifecycle, row lease, bounded retries and privacy-minimized audit. It also asserts the Worker adapter uses the official Resend REST endpoint with a stable idempotency key, a bounded streamed response, timeout, plain text and allowlisted error taxonomy without logging credentials, recipient data or provider bodies. It does not send email; provider acceptance remains controlled Staging evidence.

`verify:customer-360-local` proves migration 058's `users.view`-checked, service-only and explicitly bounded customer directory/detail reads, privacy-minimized PII access audit, direct-write revocation and `users.manage` note/tag transactions. It rejects regression to interpolated PostgREST OR search, swallowed read errors, split mutation/audit, content-bearing audit metadata or fake lifecycle controls. Actual RLS, persisted access audits and concurrent tag behavior require controlled Staging.

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

## Privacy-safe Sentry monitoring contract

Run `pnpm verify:sentry-monitoring-local` whenever monitoring, Worker entry, instrumentation, dependency or isolated-build configuration changes. The executable verifier enforces matching pinned official Cloudflare/browser SDKs, the `withSentry` Worker wrapper, awaited Next server capture, optional browser initialization, disabled PII/tracing/log/breadcrumb defaults, an allowlisted event shape, and explicit shadowing of provider secrets during isolated commands. It also passes a deliberately sensitive synthetic event through the real scrubber and fails if customer email, request/token data, breadcrumbs, local variables, raw messages or non-allowlisted tags survive. This is local source/runtime evidence only; a controlled redacted Staging event and alert receipt are still required for provider acceptance.

## Governed Admin notification contract

`pnpm verify:admin-notifications-local` proves migration 059 rechecks `notifications.send` inside its service-only RPC, revokes direct browser delivery, validates the customer, bounds message content, allowlists kind/destination, serializes the request identity, and writes the notification plus content-free audit in one transaction. It also verifies that the Server Action cannot fall back to split table/audit writes and that both customer Admin surfaces render the bounded accessible control only after the real permission query. Database persistence, concurrent duplicate submission and customer RLS visibility still require controlled Staging.

## Atomic Admin role-governance contract

`pnpm verify:admin-role-governance-local` proves migration 060 makes the role matrix owner-only and auditable, narrows role/permission reads, revokes browser-direct mutations, and routes grant/revoke plus full permission replacement through owner-rechecked service-only transactions. It asserts self-role changes are denied, last-owner counting occurs after the shared transaction lock, delegated roles retain `admin.access` and cannot receive `roles.manage`, audit excludes email and full permission arrays, and the Admin page cannot render a partial/fake governance state. Fresh-MFA enforcement remains covered by `verify:fresh-admin-assurance`; concurrency, RLS and durable mutation evidence require controlled Staging.

## Atomic Admin booking and availability contract

`pnpm verify:booking-admin-governance-local` proves migration 061 replaces the 044 `auth.uid()`-derived Admin entry points with explicit-actor service-only transactions, rechecks `bookings.manage`/`availability.manage`, locks booking and availability targets, enforces the booking state machine and repeats slot validation under the advisory lock. It verifies that booking/reschedule/availability changes commit with customer notification where applicable and metadata-only event/audit evidence, customer-authored notes are immutable in Admin, duration comes from the service, invalid transitions are not offered, and no Server Action falls back to split direct table/audit writes. This source contract does not claim PostgreSQL execution: migration parsing/application, denial tests, duplicate/concurrent resolution, RLS and reload persistence require the controlled `STAGING EXTERNAL GATE`.

## Governed manual-payment and refund contract

`pnpm verify:commerce-admin-governance-local` proves migration 062 removes browser-direct commerce mutation grants, retires the older service-callable Admin entry points, and exposes explicit-actor transactions that recheck each action permission. It asserts that a payment can be approved only after the same administrator successfully requests and reviews the current customer/order-scoped proof, that queue data does not expose Storage paths, and that approval/rejection/cancellation couple state, notification, entitlement and metadata-only audit effects. It also verifies the truthful refund state machine: processing preserves access, completion requires an execution reference before entitlement revocation, failure restores paid state, and fresh MFA/action-specific permissions guard the UI and Server Actions. Source evidence does not claim provider execution; live SQL parsing, denial/RLS, concurrent retry, signed-URL, persistence and entitlement tests require the controlled `STAGING EXTERNAL GATE`.

## Governed checkout and payment-proof upload contract

`pnpm verify:checkout-upload-governance-local` proves migration 063 calculates price from governed product/variant/offer/coupon rows without a client price, checks public-domain readiness, uses a stable request UUID plus unique index/advisory lock, and rate-limits authenticated checkout attempts. It asserts that configured payment is required only for a positive total and that zero-total fulfillment reports the real paid state. The same verifier covers the private upload-intent ledger, actor/path authorization before privileged Storage access, direct signed upload rather than Worker buffering, exact MIME/size comparison, PNG/JPEG/WebP magic-byte detection, duplicate-proof serialization, rejected/superseded cleanup and retirement of the older browser-callable RPCs. Database compilation, RLS/denial, real Storage range responses, concurrent retries and durable customer visibility require the controlled `STAGING EXTERNAL GATE`.

## Atomic customer learning-state contract

`pnpm verify:customer-learning-governance-local` proves migration 064 revokes authenticated direct mutation of course progress, lesson progress and private notes, and replaces those paths with service-only enrollment-bound RPCs. It asserts per-customer/course serialization, idempotent lesson toggles, atomic aggregate recomputation plus metadata-only audit, content-bounded note create/update/delete, and the absence of note text from audit metadata. The verifier also requires course-scoped bounded reads, no curriculum/resource/note serialization before enrollment, fail-closed configured reads and UI state changes only after durable success. SQL compilation, RLS denial, concurrent calls and reload persistence require the controlled `STAGING EXTERNAL GATE`.

## Governed customer protected-delivery contract

`pnpm verify:customer-protected-delivery-local` proves migration 065 authorizes course resources, workshop resources and published workshop recordings only through a service-only enrollment/registration boundary. It requires slug binding, per-actor/item advisory serialization, explicit 24-hour mint limits, privacy-minimized admission evidence before operational path disclosure and no path/title/external URL in evidence. All three routes must send a hashed request fingerprint, fail closed, preserve 429 feedback, validate UUID/slug input, use HTTPS-only external resources and create only 60/90-second Signed URLs without logging provider data. SQL compilation, entitlement/RLS denial, concurrent counting and real Storage signatures require the controlled `STAGING EXTERNAL GATE`.

## Customer Dashboard read-integrity contract

`pnpm verify:customer-dashboard-read-integrity-local` proves configured authentication/query errors cross the shared customer error boundary rather than returning false empty states. It checks declared bounds on top-level and related reads, retirement of unbounded embedded curriculum/workshop/booking/order/payment relationships, HTTPS meeting URLs, internal-only notification destinations, complete order-state lookup and the authoritative pending-payment next action on `/dashboard`. It also verifies migration 066 contains exactly seven SELECT-only continuity policies for owned product/course/curriculum/book/workshop/service metadata and no business-data mutation. Live RLS, two-customer isolation, truncation behavior and reload persistence require the controlled `STAGING EXTERNAL GATE`.

## Atomic customer account-governance contract

`pnpm verify:customer-account-governance-local` proves migration 067 removes authenticated direct UPDATE access to profiles and notifications, then replaces those paths with service-only RPCs bound to the Server Action's verified user. It checks profile field normalization/bounds, per-customer serialization, idempotent outcomes, read-state ownership and metadata-only audit ordering. The verifier also rejects direct table writes in the account actions and requires matching form bounds plus accessible durable-result handling. SQL compilation, RLS denial, concurrent retry, persisted audit rows and reload behavior require the controlled `STAGING EXTERNAL GATE`.

## Governed customer password-lifecycle contract

`pnpm verify:customer-password-lifecycle-local` proves Dashboard changes pass `current_password` to the installed Supabase Auth contract, recovery completion requires the verified `recovery` AMR, both flows share bounded password/confirmation validation, and success closes all sessions before the customer logs in again. It also verifies the private SSR PKCE code exchange, fixed callback destinations, real recovery/update route, and migration 068's locked five-per-hour two-phase operation evidence without credential, token, email, network or device data. Provider email/code exchange, Auth redirect allowlists, session revocation and live PostgreSQL evidence require controlled Staging.

## Governed customer booking self-service contract

`pnpm verify:customer-booking-self-service-local` proves migration 069 retires browser-callable customer mutation RPCs and direct request/event writes, then enforces explicit ownership, row/advisory locks, current cancellation/reschedule policy, real slot validation, package-credit/order effects, idempotent pending requests and content-free event/audit ordering. It executes Cairo wall-time conversion across winter/daylight-saving offsets and rejects invalid dates. It also requires bounded accessible UI feedback and a UUID/ownership/error-validating private ICS response with tentative/confirmed status, escaping, UTF-8 octet folding and defensive headers. SQL execution, RLS denial, trigger/concurrency effects, persistence and import into real calendar clients remain controlled Staging evidence.

## Governed customer registration-bootstrap contract

`pnpm verify:customer-registration-bootstrap-local` proves migration 070 replaces the effective Auth trigger with a bounded, normalized, idempotent profile bootstrap, forward-safe row constraints and a metadata-minimized audit in the same trigger transaction. It rejects any Admin-role write or hardcoded owner identity in the effective function, requires execute revocation from browser roles, and verifies matching registration form bounds plus the fixed PKCE callback. Actual Auth trigger execution, confirmation delivery, historical constraint validation, rate limiting and persisted audit require controlled Staging.

## Governed account-deletion request contract

`pnpm verify:account-deletion-governance-local` proves migration 071 denies direct table writes and gives customers service-only, explicit-actor, serialized, rate-limited request/cancel/read operations. It verifies a permissioned and audited 200-row Admin queue, bounded review transitions, customer notifications, fresh-MFA approval/completion paths and the decisive no-fake-completion rule: the Auth foreign key must already be null before an execution reference can close the request. It also rejects review text/PII in audit metadata and requires truthful, accessible customer/Admin controls. Live Auth deletion, SQL/RLS/concurrency, notifications, retention policy and persisted completion evidence remain controlled external acceptance facts.
