# CODEX CONTINUATION & COMPLETION PROMPT
## Heba ElSherif Platform — Complete Every Remaining Requirement After Full Review

**Execution mode:** implementation, migration, verification, and launch hardening  
**Repository:** the currently opened `hebaelsherif` repository  
**Primary authority:** `HEBA_ELSherif_CODEX_MASTER_EXECUTION_PROMPT.md`  
**Review authority:** `HEBA_ELSherif_FULL_CODE_REVIEW_2026-07-12.md`  
**Continuation checkpoint:** `docs/PROJECT_STATE.md`  
**Target result:** complete Phases 5–10 and close every P0/P1 issue found in the full review

---

# 0. Read this first

Read, in this order:

1. `HEBA_ELSherif_CODEX_MASTER_EXECUTION_PROMPT.md`
2. `HEBA_ELSherif_FULL_CODE_REVIEW_2026-07-12.md`
3. `docs/PROJECT_STATE.md`
4. `docs/DECISIONS.md`
5. `docs/KNOWN_ISSUES.md`
6. all migrations from `019` through the current latest migration
7. the current implementation files related to the exact phase you are working on

Treat the Master Execution Prompt as the product specification.

Treat the Full Code Review as a **mandatory defect and incompleteness list**. Do not dispute it by referring to old progress reports. Verify the current code and close each issue with code, migrations, tests, and user-visible behavior.

This is **not a planning task**. Do not return another plan. Implement.

---

# 1. Mandatory execution behavior

1. Continue from the existing repository. Do not start a replacement app.
2. Preserve working code and existing valid data.
3. Add migrations after the latest migration. Never rewrite applied migrations.
4. Do not ask the owner routine technical or product questions.
5. Do not stop between phases for approval.
6. When a detail is not stated, choose the safest, most reversible, maintainable option and record it in `docs/DECISIONS.md`.
7. Do not declare a phase complete because an admin screen exists. It is complete only when:
   - the mutation is connected to Supabase;
   - permissions are enforced;
   - public/customer behavior reflects it;
   - audit/revisions exist where required;
   - relevant tests pass.
8. No fake testimonials, ratings, sales counters, urgency, reviews, or fallback production data.
9. No raw JSON editor for normal owner settings.
10. No manual Storage path or internal asset URL when a Media Library workflow should exist.
11. No hard deletion of financial records, credit-ledger history, paid access history, bookings with history, or audit evidence.
12. Do not expose secrets, service-role keys, payment proofs, private notes, protected files, workshop meeting links, or private customer data.
13. Do not hide database errors by silently returning empty arrays or zero values in admin/reporting paths.
14. Do not print secret values in logs, documentation, output, or admin.
15. Use `docs/PROJECT_STATE.md` as the exact continuation checkpoint and update it after every completed vertical slice.
16. Keep updates concise. Do not narrate every file read.
17. Continue automatically until:
   - all P0 issues are closed;
   - Phases 5–10 are complete;
   - the final quality gate passes;
   - only genuine external credential/manual dashboard actions remain.

---

# 2. Current factual status

The current implementation contains meaningful work in:

- repository security and release packaging;
- granular admin roles and permissions;
- an initial Media Library;
- atomic checkout and payment review;
- variants and bundles;
- multiple booking availability windows;
- subscription credit ledger;
- booking by package credit.

However:

- Phase 5 is not yet formally complete;
- Phases 6–10 are incomplete;
- the admin is not yet a complete Admin Operating System;
- CMS, brand implementation, Customer 360, complete delivery systems, reports, and final E2E coverage remain incomplete;
- the uploaded workspace contained `.env`, even though a clean release archive exists.

Do not treat old “completed” claims as proof. Test the current state.

---

# 3. P0 — Secret safety and delivery hygiene

Complete this before any launch claim.

## 3.1 Repository and archive safety

1. Ensure `.env`, `.env.*` except `.env.example`, `supabase/.temp`, linked-project metadata, private reports, and local credentials are excluded from:
   - Git;
   - release archives;
   - CI artifacts;
   - review packages.
2. Make the security audit work in:
   - a Git checkout;
   - an extracted source archive without `.git`;
   - CI.
3. Add one obvious owner command:

```bash
pnpm deliver
```

It must:

- run secret/security audit;
- run the required quality gate;
- create the clean source archive;
- inspect the archive for forbidden files;
- print the one exact safe file path to send;
- print a warning not to zip the workspace manually.

4. Add a visible root file or owner documentation warning:
   - do not zip the workspace;
   - use only the generated release package.
5. Update `docs/SECURITY_RUNBOOK.md` and `docs/DEPLOYMENT.md`.
6. State in the final report that the existing `SUPABASE_SERVICE_ROLE_KEY` must be rotated manually in Supabase because it was present in a shared archive.
7. Never print the current key.

## Acceptance

- `pnpm audit:security` passes both with and without `.git`.
- `pnpm deliver` creates a clean package.
- an automated inspection proves the package contains no `.env`, `.temp`, secret value, payment evidence, or local project metadata.

---

# 4. Unify Supabase public configuration

The project currently mixes direct checks for:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Fix this globally.

1. Create or retain one helper as the only source of truth for public Supabase configuration.
2. Support the configured modern publishable key and the legacy anon key.
3. Remove direct key-existence checks from actions, components, permissions, data modules, and pages.
4. Add an audit script that fails when new direct checks appear outside the approved config module.
5. Production must fail clearly when configuration is invalid; it must not silently enter demo mode.
6. Demo/fallback behavior must be explicitly enabled, never inferred from a transient database error.

## Acceptance

- repository search shows no unauthorized direct checks;
- publishable-key-only configuration is tested;
- permission and admin flows work with the unified helper.

---

# 5. Complete Phase 5 — bookings, availability, packages, and credit integrity

Do not begin Phase 6 before closing this phase.

## 5.1 Idempotency correctness

The existing advisory lock is not enough if the same key can be reused for a different operation.

Implement:

- a stored operation fingerprint or canonical request hash;
- comparison of:
  - user;
  - operation type;
  - subscription;
  - booking/source;
  - delta;
  - relevant parameters;
- same key + same fingerprint returns the original result;
- same key + different fingerprint returns a clear conflict error;
- advisory transaction lock remains narrowly scoped by user + operation + idempotency key.

Test:

1. same user, same key, same request, concurrent;
2. same user, same key, different delta;
3. same user, same key, different subscription;
4. same textual key, different users;
5. retry after success;
6. rollback/failure then retry;
7. last-credit contention;
8. repeated reversal.

## 5.2 Immutable credit ledger

1. Remove destructive cascade behavior that can erase ledger history.
2. Subscription/package records must be archived/cancelled, not hard-deleted once financial or credit history exists.
3. Every credit movement records:
   - grant;
   - consume;
   - reverse;
   - expire;
   - adjustment;
   - source type/id;
   - actor;
   - reason;
   - idempotency key;
   - request fingerprint;
   - timestamp.
4. Add meaningful uniqueness so the same booking cannot consume a credit twice.
5. Remove useless uniqueness that includes an already unique primary key.
6. Add database integrity tests.

## 5.3 Package lifecycle and eligibility

Admin must control:

- draft/scheduled/published/archived status;
- billing label;
- duration;
- included credits;
- eligible services;
- credit reset;
- rollover;
- expiry;
- maximum active subscribers;
- per-customer purchase limit;
- start/end;
- features;
- media;
- terms.

Implement:

- activation;
- pause;
- resume;
- extend;
- cancel;
- expire;
- manual assignment;
- manual credit adjustment with reason;
- automatic opening credits on activation;
- no misleading automatic renewal before a recurring gateway exists;
- version-safe behavior when a plan is edited after sale.

A sold subscription must preserve a snapshot of the relevant plan terms.

## 5.4 Package-backed booking

1. Booking validates that the package is active and the service is eligible.
2. Booking and credit consumption are one transaction.
3. Cancellation/reversal follows the configured policy.
4. Repeated cancellation cannot restore the same credit twice.
5. Reschedule preserves or adjusts the credit correctly.
6. Customer and admin timelines show the credit event.

## 5.5 Availability correctness

Support:

- multiple intervals per weekday;
- breaks;
- multiple service-specific intervals;
- date override;
- closed date;
- multiple custom intervals on an exception date;
- holidays/blackout ranges;
- temporary pause;
- service duration;
- slot interval;
- buffer before;
- buffer after;
- minimum notice;
- booking horizon;
- maximum bookings per day;
- explicit timezone.

Replace race-prone overlap checking with a database-safe constraint or locking design that prevents two concurrent overlapping rule inserts.

## 5.6 Booking operations

Admin must be able to:

- create a manual booking;
- confirm;
- edit;
- reschedule;
- cancel;
- complete;
- mark no-show;
- add internal note;
- change meeting link;
- perform controlled price adjustment;
- send notification;
- view order/payment/package/credit links;
- view full timeline.

Every time change must revalidate availability and conflicts.

Customer must be able to:

- request/reschedule within policy;
- cancel within policy;
- see fee/refund/credit effect;
- see confirmed meeting details;
- see booking timeline.

Policies must come from typed settings, not hardcoded text.

## 5.7 Admin calendar

Implement:

- day view;
- week view;
- month view;
- agenda view;
- filters;
- status colors;
- open booking detail;
- safe drag/reschedule with server validation;
- daily print/export.

## Phase 5 acceptance

- all concurrency tests pass;
- package credit cannot drift;
- cancelling/rescheduling cannot double-reverse credit;
- availability rules cannot overlap concurrently;
- the admin and customer flows work in desktop and mobile E2E;
- `docs/PROJECT_STATE.md` changes Phase 5 to complete only after the full gate passes.

---

# 6. Fix remaining P0 commerce defects

## 6.1 Workshop capacity

Implement atomic seat reservation and release.

On checkout/approval according to the chosen reservation policy:

- lock workshop;
- verify registration window;
- verify capacity;
- reserve/confirm one seat;
- prevent overbooking;
- support waitlist when enabled;
- release seat on cancellation/refund;
- prevent duplicate registration;
- ensure idempotency.

Add a concurrent last-seat test.

## 6.2 Protect workshop meeting details

Do not leave `meeting_url` readable through the public workshop row.

Use one safe design:

- private workshop delivery/details table linked to registrations; or
- restricted column access plus a public-safe view.

Public/anonymous and ordinary non-registered users must not be able to query:

- meeting URL;
- private resources;
- recording URL;
- private participant data.

Entitled registrants may receive short-lived/access-checked data.

## 6.3 Payment methods

Server and RPC must verify that the selected payment method is:

- enabled;
- configured;
- allowed for the order/product/currency when restrictions exist.

A direct client request must not use a disabled method.

## 6.4 Coupons and offers

Implement transactional validation at both checkout and approval/fulfillment:

- active window;
- maximum total uses;
- per-user uses;
- product/type/category scope;
- exclusions;
- minimum order;
- first purchase when supported;
- stack policy;
- deterministic best-offer logic.

Lock/recheck limits during approval so multiple pending orders cannot exceed the coupon limit.

## 6.5 Free products

A free product must:

- create a valid order/access record if needed;
- grant entitlement atomically;
- not require a fake payment proof.

## 6.6 Entitlement grant ledger

Do not overwrite one source order on a shared access row.

Add an entitlement-grant model that records each independent source:

- order;
- manual admin grant;
- package;
- promotion;
- replacement;
- refund/revoke.

Refunding one purchase must not remove access if another valid grant remains.

## 6.7 Refund accounting

Implement real refund records:

- full or partial;
- amount;
- currency;
- method;
- reference;
- status;
- reason;
- processed_by;
- processed_at;
- source payment/order;
- entitlement effect;
- workshop-seat effect;
- package-credit effect.

Do not delete historical access/registration evidence. Mark it revoked/cancelled with reason and timeline.

## 6.8 Order/payment consistency

- cancelling an order updates or closes pending payment proofs consistently;
- refund and payment status are not contradictory;
- all transitions are controlled, audited, and idempotent;
- historical product/price snapshots remain unchanged.

---

# 7. Complete the Media Library

The existing Media Library is a foundation, not complete.

Implement:

## 7.1 Asset model

Add/complete:

- folders;
- extension;
- duration;
- checksum;
- caption;
- status;
- archived/trashed/deleted timestamps;
- focal point;
- replacement history;
- optional thumbnail/variant metadata;
- protected/public/private purpose.

## 7.2 Owner experience

Admin must support:

- drag/drop;
- multi-file upload;
- progress;
- retry;
- folders;
- search across full library;
- server pagination;
- filters;
- sort;
- tags;
- bulk move/tag/archive;
- archive;
- trash;
- restore;
- permanent delete only when unused and authorized;
- usage list with real entity links;
- replace file while preserving references;
- image dimensions;
- file size/type;
- meaningful Arabic errors.

## 7.3 Picker

The shared picker must support:

- choose existing;
- upload new without leaving the form;
- public and protected assets according to purpose;
- single/multiple selection;
- server-side search;
- preview;
- remove selection;
- focal point/crop preference;
- return asset IDs.

Replace routine internal URL/storage-path fields with media IDs.

External URL fields may remain only where the resource is genuinely external.

## 7.4 Large files

Do not route 500MB video uploads through a server action memory buffer.

Implement:

- authenticated admin upload authorization;
- direct/resumable upload to Supabase Storage;
- progress;
- retry;
- validation;
- post-upload metadata finalization.

## 7.5 Safety

- sanitize or safely serve SVG;
- prevent Storage/DB orphan states;
- protected assets require signed access;
- public assets may use public URLs;
- deletion is recoverable before permanent purge.

---

# 8. Complete Phase 6 — courses, books, workshops, protected delivery

## 8.1 Courses

Build a full course admin editor with:

- lifecycle;
- pricing/product fields;
- cover/gallery;
- instructor;
- outcomes;
- prerequisites;
- access duration;
- drip;
- completion rules;
- certificate settings;
- SEO.

### Curriculum builder

Implement:

- modules;
- lessons;
- edit;
- delete/archive;
- duplicate;
- drag/drop reorder;
- preview;
- publish state.

Lesson types:

- video;
- audio;
- rich text;
- downloadable file;
- external live session;
- mixed.

Use Media Picker for course media and resources. No manual internal Storage path.

### Enrollment operations

Admin can:

- enroll;
- revoke/expire;
- extend;
- reset progress;
- mark complete;
- issue/revoke certificate;
- view progress;
- export;
- message learners.

Protected course resources require entitlement checks and short-lived signed access.

## 8.2 Books

Admin must control:

- book product fields;
- author;
- edition;
- publication date;
- ISBN;
- page count;
- language;
- formats;
- cover/gallery;
- sample;
- SEO;
- download policy.

Implement book versions:

- PDF/EPUB upload through Media Library;
- current version;
- publish/unpublish;
- release notes;
- checksum/size;
- access period if configured;
- download logs;
- grant/revoke access.

### Customer download

The download button must:

1. verify authenticated user;
2. verify at least one valid entitlement grant;
3. resolve allowed current version;
4. create short-lived signed URL;
5. write download log;
6. return/redirect safely.

It must never route back to the public product page as a substitute for download.

## 8.3 Workshops

Create a real workshop editor and operations module.

Fields:

- lifecycle;
- date/time/timezone;
- registration open/close;
- capacity;
- waitlist;
- mode;
- address;
- private meeting details;
- host;
- agenda;
- requirements;
- recording/resources;
- reminders;
- status.

Admin can:

- view/filter/export registrations;
- add participant;
- confirm/cancel;
- move from waitlist;
- mark attendance/no-show;
- send message;
- resend meeting details;
- refund/cancel through controlled commerce actions;
- see order/payment/timeline.

Resources/recordings:

- select/upload through Media Library;
- control audience;
- available from/until;
- show in customer dashboard only when entitled.

### Workshop detail route

Fix `/workshops/[slug]`:

- load the requested workshop;
- show real details;
- respect lifecycle/publication;
- provide preview for admin;
- handle not found;
- lead to the correct checkout;
- never expose private meeting data.

---

# 9. Complete Phase 7 — CMS, public pages, brand, and “باب الخروج”

## 9.1 Apply the approved brand

Use:

- `#2F6173`
- `#5CB7B4`
- `#D8C3A5`
- `#EADBC2`
- `#F5F0E7`

Requirements:

- matte;
- warm;
- calm;
- premium;
- no dominant burgundy;
- no dominant cobalt;
- no glossy gold;
- no 3D;
- no generic botanical decoration dominating the identity.

Do not generate or redraw a logo. Use owner-uploaded/approved assets.

Make configurable through Media Library:

- full logo;
- compact mark;
- favicon;
- monochrome logo;
- owner portrait;
- default social image;
- default product artwork.

Audit all public and admin colors for semantic use and contrast.

## 9.2 Structured CMS

Extend/connect the existing page model so the owner can control:

- home;
- about;
- start here;
- services;
- books;
- courses;
- workshops;
- articles;
- contact;
- FAQ;
- terms;
- privacy;
- cancellation/refund;
- disclaimer.

Implement typed structured sections:

- hero;
- rich text;
- image/text;
- owner profile;
- proof strip;
- problem recognition;
- method/steps;
- “باب الخروج” feature;
- product/service grid;
- offer;
- verified testimonials;
- articles;
- FAQ;
- CTA;
- newsletter;
- contact;
- divider/spacer.

Admin can:

- add;
- edit;
- duplicate;
- reorder;
- show/hide;
- preview;
- schedule;
- publish;
- unpublish;
- archive;
- trash;
- restore;
- view revision history;
- restore revision.

No arbitrary executable code.

## 9.3 Home page

Build the approved structure:

1. specific hero about lost voice/choice;
2. “ابدئي من هنا” primary CTA;
3. “باب الخروج” secondary CTA;
4. recognition block;
5. Heba’s method;
6. “باب الخروج” as the primary intellectual/product world;
7. choose your doorway:
   - read;
   - learn;
   - attend;
   - personal accompaniment;
8. About Heba and trust;
9. verified transformations only;
10. selected content;
11. newsletter;
12. final CTA.

Remove generic repeated sections that dilute the message.

## 9.4 About Heba

Create a fully editable profile with:

- public name;
- title;
- short bio;
- long story;
- selected qualifications;
- years of experience;
- method;
- audience;
- exclusions/boundaries;
- ethical disclaimer;
- portrait;
- social links;
- media appearances;
- CTA;
- relationship to “باب الخروج”.

Do not invent credentials, numbers, or claims.

## 9.5 Navigation and footer

Admin controls:

- internal/external links;
- nesting;
- order;
- visibility;
- header/footer location;
- CTA;
- social;
- legal;
- contact.

Validate broken internal links.

---

# 10. Complete the catalog and publish lifecycle

All publishable entities must use:

- draft;
- scheduled;
- published;
- archived.

Implement:

- preview;
- scheduled publication;
- publish now;
- unpublish;
- archive;
- trash/restore where appropriate;
- duplicate;
- revision history;
- restore revision;
- owner-friendly detail/editor routes;
- unsaved-change warnings;
- sticky action bar.

Complete product fields:

- title;
- slug;
- subtitle;
- short/long description;
- benefits;
- audience;
- included content;
- prerequisites;
- FAQ;
- cover/gallery;
- price;
- compare-at;
- currency from controlled options;
- sale window;
- featured/sort;
- categories/tags;
- SEO/social image;
- related/cross-sell;
- variants;
- bundles;
- purchase limits;
- terms.

Maintain price history and historical order snapshots.

No hard delete after financial use.

---

# 11. Complete Phase 8 — Customer 360, inbox, communications, reviews

## 11.1 Customer 360

Create `/admin/customers/[id]` with tabs:

- overview;
- profile;
- orders;
- payments;
- bookings;
- packages/credits;
- courses/progress;
- books/downloads;
- workshops/attendance;
- entitlements;
- notes/tags;
- notifications/activity.

Authorized actions:

- edit safe profile fields;
- notes/tags;
- in-app notification;
- configured email;
- manual booking;
- assign/extend/pause/cancel package;
- adjust credits with reason;
- grant/revoke content with reason;
- resend access;
- password reset link;
- controlled suspension/archive;
- privacy export/anonymization workflow.

Show one chronological timeline.

## 11.2 Inbox

Implement:

- detail view;
- status;
- assignment;
- internal notes;
- linked customer;
- spam flag;
- reply status/log;
- archive;
- retention controls;
- permission-aware export.

## 11.3 Communications

Add:

- in-app notification log;
- email outbox;
- provider adapter;
- safe template variables;
- delivery status;
- retries;
- disabled/provider-not-configured state.

Provide templates for:

- payment received;
- approved/rejected;
- booking confirmed/rescheduled/cancelled;
- workshop reminder;
- access granted;
- package expiry.

Newsletter:

- validation;
- consent timestamp;
- unsubscribe token/route;
- resubscribe;
- suppression status;
- double-opt-in-ready model.

## 11.4 Reviews

Customer review submission requires eligible purchase/access.

Store and moderate:

- user;
- product;
- rating;
- comment;
- verified flag;
- moderation status;
- consent for display name;
- owner response;
- audit.

No public fallback reviews or fake counts.

---

# 12. Complete Phase 9 — reports, marketing, offers, coupons

## 12.1 Shared report controls

All report pages require:

- date range;
- comparison period;
- filters;
- timezone;
- clear errors;
- CSV export;
- print;
- permission checks;
- server pagination where relevant.

## 12.2 Required reports

Commerce:

- collected;
- refunded;
- net;
- pending;
- AOV;
- status;
- product/type;
- discounts;
- coupon performance;
- expired/abandoned orders.

Bookings:

- service/status;
- confirmation;
- cancellation;
- no-show;
- weekday/time utilization;
- package-credit usage;
- upcoming load.

Packages:

- active/paused/expired/cancelled;
- plan sales;
- active plan value;
- credits granted/used/reversed/expired;
- renewal/repurchase;
- capacity.

Courses:

- enrollments;
- active learners;
- progress;
- completion;
- drop-off;
- certificates;
- reviews.

Books:

- sales/access;
- downloads;
- unique downloaders;
- version usage.

Workshops:

- registrations;
- capacity;
- waitlist;
- attendance;
- no-show;
- revenue;
- recording access.

Customers:

- new;
- buyers;
- repeat buyers;
- lifetime collected value;
- segment;
- inactivity.

Marketing/content:

- CTA events;
- article views with consent;
- subscriptions/unsubscribes;
- offer/coupon performance;
- checkout funnel.

## 12.3 Snapshots

A report snapshot must preserve:

- period;
- filters;
- payload;
- creator;
- timestamp.

Admin can view and export it.

## 12.4 Offers and coupons admin

Complete create/edit/schedule/publish/archive/report flows.

Never create rolling fake countdowns.

---

# 13. Admin OS completion

The admin must become a coherent operational product.

## 13.1 Shell

Complete:

- collapsible grouped sidebar;
- permission badges/counts;
- breadcrumbs;
- global search/command palette;
- quick-create;
- attention center;
- environment indicator;
- mobile behavior.

## 13.2 Global search

Search:

- customers;
- orders;
- payments;
- bookings;
- products;
- courses;
- books;
- workshops;
- articles;
- subscriptions;
- contact messages.

Link to real detail pages.

## 13.3 Shared data table

Use a shared server-driven table across modules:

- search;
- pagination;
- sort;
- filters;
- date range;
- status;
- columns;
- selection;
- safe bulk actions;
- CSV;
- URL-saved views;
- mobile fallback.

## 13.4 Detail editors

Replace compressed accordions for complex entities with professional detail routes.

Use:

- tabs/sections;
- sticky actions;
- save draft;
- preview;
- publish/schedule;
- archive;
- duplicate;
- public link;
- revisions;
- inline validation;
- unsaved changes;
- clear Arabic errors.

## 13.5 Permissions editor

Owner must be able to:

- view effective permissions;
- compare roles;
- modify role permissions safely;
- create a custom role if supported;
- preview effect;
- save with audit;
- never remove the last owner;
- never grant a permission the acting user cannot manage.

Use the database as the effective permission source. Remove production fallback that silently masks RPC/migration failure. Fail closed.

Also change public permission querying so ordinary users cannot query arbitrary other user IDs.

---

# 14. Typed settings completion

Replace remaining owner-facing JSON settings with typed validated forms:

- general;
- brand;
- Heba profile;
- contact;
- social;
- SEO;
- analytics/consent;
- payment methods;
- booking;
- cancellation/refund;
- order expiry;
- currencies;
- locale/timezone;
- email;
- notifications;
- legal;
- feature visibility;
- default media;
- maintenance.

Use shared Zod schemas.

Public/customer/admin text for prices and policies must come from the same source.

---

# 15. Complete Phase 10 — tests, accessibility, performance, launch

## 15.1 Dependencies and validation

Add and use where appropriate:

- Zod;
- React Hook Form;
- DnD Kit;
- TipTap or another approved React 19-compatible structured editor;
- server-side HTML sanitizer;
- Vitest;
- Axe Playwright.

Do not add dependencies without using them.

## 15.2 Unit/business tests

Test:

- price calculation;
- variants;
- bundles;
- offers/coupons;
- lifecycle transitions;
- permissions;
- booking slot generation;
- availability overlap;
- cancellation/refund calculation;
- credit ledger;
- entitlement grants;
- workshop capacity;
- validation schemas.

## 15.3 Database/security tests

Test as:

- anonymous;
- customer;
- support;
- editor/content;
- finance;
- operations;
- owner.

Prove customers cannot:

- lower price;
- alter totals;
- approve payment;
- grant access;
- use disabled payment method;
- exceed coupon limit;
- read another customer’s data;
- read meeting URL without registration;
- download protected content without entitlement;
- overbook workshop;
- consume the same credit twice;
- book unavailable/conflicting time.

## 15.4 E2E

Automate:

1. browse → account → checkout → proof;
2. admin approve → access;
3. reject → resubmit;
4. booking → payment/package → confirm;
5. reschedule/cancel;
6. credit reverse;
7. book purchase/download;
8. course purchase/protected lesson;
9. workshop last seat/meeting/resources;
10. CMS upload/preview/publish;
11. Customer 360 actions;
12. role denial;
13. refund and remaining entitlement;
14. newsletter unsubscribe;
15. review submission/moderation;
16. mobile navigation;
17. accessibility.

## 15.5 `check:deploy`

The final deploy gate must include:

- type check;
- lint;
- production build;
- unit tests;
- integration verification;
- permissions verification;
- media verification;
- commerce verification;
- booking/credits verification;
- workshop capacity verification;
- route audit;
- UX audit;
- brand/color audit;
- security/secret audit;
- admin audit;
- migration audit;
- docs/launch audit;
- Playwright E2E;
- Axe smoke.

The deploy gate must not pass if these tests are skipped silently.

## 15.6 Performance and accessibility

Verify:

- mobile RTL;
- no horizontal overflow;
- keyboard use;
- focus states;
- labels;
- contrast;
- reduced motion;
- image sizes;
- server pagination;
- large-upload behavior;
- no private asset leakage;
- no unnecessary client rendering;
- production errors are observable.

---

# 16. Documentation truth

Update and keep synchronized:

- `docs/MASTER_PLAN.md`
- `docs/PROJECT_STATE.md`
- `docs/DECISIONS.md`
- `docs/KNOWN_ISSUES.md`
- `docs/ADMIN_GUIDE.md`
- `docs/PERMISSIONS_MATRIX.md`
- `docs/DATA_DICTIONARY.md`
- `docs/SUPABASE_SETUP.md`
- `docs/STORAGE_AND_MEDIA.md`
- `docs/SECURITY_RUNBOOK.md`
- `docs/DEPLOYMENT.md`
- `docs/TESTING.md`
- `docs/LAUNCH_CHECKLIST.md`
- `FINAL_DELIVERY_REPORT.md`

Remove or clearly mark obsolete reports.

No document may say “no blockers” while P0/P1 launch blockers remain.

---

# 17. Phase completion discipline

At the end of each phase:

1. run focused tests;
2. run the phase quality gate;
3. inspect desktop and mobile with browser automation;
4. update `PROJECT_STATE.md`;
5. update `DECISIONS.md`;
6. update `KNOWN_ISSUES.md`;
7. create a coherent commit if Git is available;
8. continue automatically.

Do not stop after writing migrations or admin pages.

---

# 18. Final acceptance criteria

The final result may be marked `READY` only if all of the following are true:

- no secret in source/release artifacts;
- clean delivery command exists and passes;
- service-role rotation is the only remaining manual secret action;
- Phase 5 is complete;
- workshop capacity cannot overbook;
- private workshop details cannot be queried publicly;
- package credits are immutable, reversible once, and service-eligible;
- checkout/payment/refund/entitlements are atomic and historically correct;
- free products work;
- coupon limits cannot be exceeded through pending orders;
- Media Library supports full owner workflow and large uploads;
- books download securely;
- course resources work securely;
- workshop recordings/resources work securely;
- customer cancellation/reschedule works;
- CMS controls public pages;
- approved brand is applied;
- “باب الخروج” is central;
- About Heba is real and editable;
- Customer 360 works;
- reports are filterable/exportable and financially accurate;
- admin permissions are manageable and enforced;
- revision/archive/restore works;
- all public claims correspond to real functions;
- all tests and `check:deploy` pass;
- documentation is current.

If any P0 remains, final status must not be `READY`.

---

# 19. Required final Codex response

At the end, provide:

1. status:
   - `READY`
   - `PARTIALLY READY`
   - `NOT READY`
2. phases completed;
3. migrations added and order;
4. major admin capabilities now working;
5. public/customer flows now working;
6. tests run and exact results;
7. P0 open items;
8. P1 open items;
9. P2 deferred items;
10. required manual Supabase secret rotation/configuration;
11. exact safe release package path;
12. launch recommendation.

Do not claim completion based only on file existence or old test reports.

---

# 20. Start now

Start from the exact current Phase 5 checkpoint.

First:

1. inspect the latest migration and current `PROJECT_STATE.md`;
2. fix the idempotency fingerprint and credit-ledger integrity;
3. complete and verify Phase 5;
4. close the remaining P0 commerce and workshop issues;
5. continue through Phases 6–10;
6. do not ask for approval between phases;
7. do not stop after producing another report;
8. implement until the final acceptance gate is reached.
