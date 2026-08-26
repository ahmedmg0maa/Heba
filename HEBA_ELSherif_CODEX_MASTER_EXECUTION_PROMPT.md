# MASTER EXECUTION PROMPT
## Heba ElSherif Platform — Full Product Rebuild, Admin OS, Security, Brand, Commerce, CMS & Operations

**Document version:** 1.0  
**Prepared:** 2026-07-12  
**Target repository:** `hebaelsherif`  
**Current stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, Supabase Postgres/Auth/Storage/RLS, pnpm 10, Node 24  
**Primary language:** Arabic RTL  
**Primary market at launch:** Egypt and Arabic-speaking customers  
**Project owner:** Heba ElSherif  

---

# 0. Your role and execution mode

You are the principal product engineer, software architect, Supabase/Postgres security engineer, UX lead, and QA owner for this repository.

This is **not a request for another plan**. The requirements below are the approved implementation specification. Inspect the existing repository, preserve what is sound, and execute the work in the repository.

## Mandatory operating rules

1. **Do not ask the project owner routine technical or product questions.**
2. Use the explicit decisions in this document. When a minor detail is not stated:
   - choose the safest;
   - most reversible;
   - least surprising;
   - most maintainable;
   - least token-wasteful implementation;
   - record the decision briefly in `docs/DECISIONS.md`;
   - continue working.
3. Do not pause merely because an external credential, production database, email provider, domain, or approved photo is unavailable.
   - Build the adapter and configuration.
   - Add the environment variable to `.env.example`.
   - show a clear disabled state.
   - write setup documentation.
   - continue with everything that can be completed locally.
4. Do not replace the current stack or start a new application.
5. Do not rewrite old applied migrations. Add ordered migrations beginning after the latest migration in the repository.
6. Do not destroy existing production-shaped data. Use additive migrations, backfills, compatibility layers, and reversible transitions.
7. Never expose `SUPABASE_SERVICE_ROLE_KEY`, secrets, payment evidence, protected book files, course videos, workshop recordings, or private customer data to the browser.
8. No fake reviews, fake ratings, fake urgency, fake counters, or public demo testimonials.
9. No placeholder admin screens. An admin page is complete only when its create/read/update/archive/publish workflow is connected to Supabase and reflected in the public or customer-facing product where applicable.
10. Do not use raw JSON editors for normal owner-facing settings.
11. Do not require the owner to paste image/file URLs for assets that belong to the platform. Use the internal Media Library.
12. Use links only where links are intrinsically external, such as a Zoom/Google Meet URL, social account URL, or external reference.
13. Do not narrate every tool call. Give only brief phase updates and a concise final report.
14. Do not repeatedly scan the entire repository. Read targeted files, maintain `docs/PROJECT_STATE.md`, and use it as the continuation checkpoint.
15. Run focused tests during implementation and the full quality gate at phase boundaries.
16. If Git is available, create small coherent commits by phase. If Git metadata is absent, continue without blocking.
17. Do not declare the project complete while any P0 item or acceptance test remains open.
18. When a requested “full control” action could corrupt accounting, entitlements, or historical records, implement a controlled admin operation with a reason, audit trail, before/after values, and compensating action instead of unsafe arbitrary editing.

---

# 1. Current repository facts to preserve and improve

The current project already contains useful foundations:

- public website;
- customer dashboard;
- course LMS;
- books;
- workshops;
- services and booking;
- products, orders, coupons, offers, payments, payment proofs;
- Supabase RLS;
- protected Storage buckets;
- admin routes for overview, payments, orders, bookings, memberships, users, inbox, products, courses, books, workshops, articles, pages, media, reviews, offers, coupons, reports, roles, audit logs, security, settings, and system status;
- an atomic booking RPC;
- audit logs;
- content revisions;
- basic media upload;
- basic monthly/subscription plan records;
- Playwright smoke tests.

Do not throw away those foundations. Rework and connect them.

## Known structural weaknesses that must be corrected

1. Admin functions are distributed across several files and permissions often reduce to “is any admin”.
2. `admin_permissions` exists but is not a fully enforced permission system.
3. Several forms still use `cover_url` or storage paths instead of an integrated asset picker.
4. Basic media upload exists but lacks folders, search, reuse, reference tracking, replacement, previews, bulk upload, protected delivery, and safe deletion.
5. Home copy editing is only a small settings object; most public sections remain hardcoded.
6. Pages CMS controls SEO/publish state but not the actual built-in page content.
7. Product/course/book/workshop editing is basic and compressed into accordions, not a professional entity editor.
8. Customer administration is a table, not a Customer 360 record.
9. Reports are limited and mostly fixed to the last 12 months.
10. Subscription plans exist but are not a complete operational package/credit system.
11. Availability is limited to one window per service/day because migration 018 introduced a unique service/day rule. This must be redesigned to support multiple windows and breaks.
12. Payment approval consists of multiple non-atomic application calls and can leave partial state.
13. General product checkout must not trust browser-created orders, line prices, coupon values, or payment amounts.
14. Workshop capacity must be reserved atomically.
15. Some public promises are not fully implemented: book delivery, workshop recordings/resources, rescheduling/cancellation, newsletter unsubscribe, and customer-submitted verified reviews.
16. The workshop `[slug]` detail route must be a real detail page.
17. The repository package contains `.env` and Supabase temporary link data. Treat current secrets as compromised and remove sensitive artifacts from distributable packages.
18. Demo/fallback content must never masquerade as real production content.
19. Current branding is visually mixed and does not consistently reflect the approved Heba ElSherif identity.
20. Public-site content does not yet communicate Heba’s distinctive method, experience, “باب الخروج”, or the core transformation clearly enough.

---

# 2. Product vision

Build a premium Arabic-first platform that functions as:

1. Heba ElSherif’s personal brand home.
2. The digital home of the “باب الخروج” method and book.
3. A secure commerce system for books, courses, workshops, sessions, packages, bundles, VIP products, and free resources.
4. A customer portal for access, bookings, files, progress, purchases, recordings, and notifications.
5. A genuine **Admin Operating System** from which the owner and authorized team can operate the whole business without touching Supabase tables manually.

The public site must not feel like a generic self-development store. It must feel like one coherent intellectual and human home:

> A woman arrives because she feels she disappeared while trying to survive or keep relationships intact. She finds language that names what happened, a trustworthy method that restores voice, choice, and a sound relationship with God, then chooses the right doorway: reading, learning, attending, or personal accompaniment.

---

# 3. Approved brand direction

## 3.1 Brand identity

Use the approved identity:

- Core concept: **seed / beginning of awareness from within**.
- Primary deep teal: `#2F6173`
- Soft teal: `#5CB7B4`
- Champagne: `#D8C3A5`
- Inner light champagne: `#EADBC2`
- Warm off-white: `#F5F0E7`
- Finish: matte, calm, warm, premium, human.
- No glossy gold.
- No 3D effects.
- No generic botanical sprays dominating the composition.
- Do not use burgundy or cobalt as major brand colors.
- Red may exist only as a semantic danger/error color.
- Public launch uses one coherent approved light appearance. The admin may retain an accessible dark appearance if it is adapted and fully tested.
- Do not redraw or generate a new logo. Preserve the current approved asset until an approved replacement is uploaded.
- Make logo, favicon, social image, owner portrait, and default product artwork configurable through the Media Library.
- Implement responsive logo variants when assets exist: full logo, compact mark, favicon, monochrome.

## 3.2 Brand content principles

The public message must be specific rather than generic. Emphasize:

- women who lost their voice while trying to remain safe or loved;
- naming pressure and its hidden rules;
- seeing the internal effect;
- restoring self-trust without making emotion the only judge;
- the right to choose;
- a safe step, not a battle;
- returning to God without viewing Him through human wounds;
- Heba as a companion and experienced practitioner, not a lecturer;
- “باب الخروج” as the primary intellectual world, not a side product.

## 3.3 Owner profile

Create a fully editable “About Heba” profile in admin with structured fields:

- full public name;
- professional title;
- short bio;
- full story;
- selected qualifications;
- years of experience;
- number/range of certifications only if the owner enters and publishes it;
- working method;
- who the work is for;
- who the work is not for;
- ethical boundaries and disclaimer;
- portrait;
- signature image if supplied;
- featured quote;
- social links;
- media/press appearances;
- CTA;
- relationship to “باب الخروج”.

Do not invent any credentials or statistics.

---

# 4. Architectural decisions

## 4.1 Keep the stack

Keep:

- Next.js App Router;
- server components by default;
- server actions for trusted admin mutations;
- Supabase Auth/Postgres/Storage;
- strict TypeScript;
- Tailwind;
- pnpm;
- Node 24;
- Vercel-compatible deployment.

## 4.2 Add only justified dependencies

Use these where needed:

- `zod` for shared validation schemas;
- `react-hook-form` and `@hookform/resolvers` for complex admin forms;
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` for accessible reordering;
- TipTap packages compatible with React 19 for rich content editing:
  - `@tiptap/react`
  - `@tiptap/starter-kit`
  - `@tiptap/extension-link`
  - `@tiptap/extension-placeholder`
- an HTML sanitizer suitable for server use, such as `sanitize-html`;
- `vitest` for business logic and validation tests;
- `@axe-core/playwright` for accessibility E2E checks.

Do not add a heavyweight state-management system unless a real need appears.

## 4.3 Centralize domain logic

Create clear layers:

- `src/lib/validation/*`
- `src/lib/auth/permissions.ts`
- `src/lib/admin/actions/*`
- `src/lib/admin/queries/*`
- `src/lib/domain/commerce/*`
- `src/lib/domain/booking/*`
- `src/lib/domain/content/*`
- `src/lib/domain/access/*`
- `src/lib/media/*`
- `src/components/admin/data-table/*`
- `src/components/admin/forms/*`
- `src/components/admin/media/*`

Do not keep one giant action file.

## 4.4 Typed settings

Replace routine JSON editing with typed settings forms. Keep JSONB in the database where useful, but validate it with Zod and expose owner-friendly fields.

Create typed settings groups:

- brand;
- owner profile;
- contact;
- social;
- SEO;
- analytics/consent;
- payment methods;
- booking policy;
- cancellation/refund policy;
- order expiry;
- currencies;
- locale/timezone;
- email;
- notifications;
- legal footer;
- public feature visibility;
- default media;
- maintenance mode.

## 4.5 Status model

For editable business/content entities, use explicit lifecycle states:

- `draft`
- `scheduled`
- `published`
- `archived`

Keep old booleans during migration if needed, backfill status, update public queries to use lifecycle state, then deprecate the booleans without breaking existing data.

Use soft archive/trash for content. Never hard-delete financial history.

## 4.6 Revision and audit model

Every meaningful admin mutation must create:

- actor;
- permission used;
- action;
- entity type/id;
- request/correlation ID;
- timestamp;
- reason where required;
- before snapshot or meaningful diff;
- after snapshot or meaningful diff;
- source metadata without storing secrets.

Extend/fix `content_revisions` so it can version settings keys as well as UUID entities. Add:

- version number;
- action;
- label;
- restored-from revision;
- created_by;
- created_at.

Implement “view history” and “restore this version” for:

- pages/sections;
- articles;
- home copy;
- product copy;
- course/book/workshop copy;
- settings groups.

---

# 5. Security and secret hygiene — P0

## 5.1 Repository hygiene

Immediately:

1. Remove `.env` and Supabase `.temp` data from release artifacts and source tracking.
2. Ensure `.gitignore` covers:
   - `.env`
   - `.env.*` except `.env.example`
   - `supabase/.temp`
   - local test data
   - generated reports containing private data.
3. Add a release-packaging script that produces a clean archive and explicitly excludes secrets, caches, `.next`, test evidence, and Supabase linked-project metadata.
4. Extend `audit:security` to fail when sensitive files or secret-looking values are present.
5. Add a documented manual launch step stating that the existing service-role key must be rotated in Supabase because it was included in a shared archive.
6. Never print secret values in the admin “system” page. Show only configured/missing.

## 5.2 Permission enforcement

Replace broad `is_admin()` authorization for sensitive actions with granular permissions.

Retain roles but expand them to:

- `owner`
- `admin`
- `operations`
- `finance`
- `content`
- `marketing`
- `support`
- `editor`

Implement `public.has_permission(permission_name text, uid uuid default auth.uid())`.

Seed a documented permission matrix, including:

- `dashboard.view`
- `customers.view`
- `customers.edit`
- `customers.notes`
- `customers.entitlements`
- `orders.view`
- `orders.adjust`
- `orders.cancel`
- `payments.view`
- `payments.approve`
- `payments.reject`
- `payments.refund`
- `bookings.view`
- `bookings.create`
- `bookings.edit`
- `bookings.cancel`
- `availability.manage`
- `products.view`
- `products.edit`
- `products.publish`
- `courses.manage`
- `books.manage`
- `workshops.manage`
- `memberships.manage`
- `articles.manage`
- `pages.manage`
- `media.manage`
- `reviews.moderate`
- `offers.manage`
- `coupons.manage`
- `newsletter.manage`
- `reports.view`
- `reports.export`
- `roles.manage`
- `settings.manage`
- `security.view`
- `audit.view`
- `system.manage`.

Rules:

- owner has all permissions;
- only owner can grant/revoke roles, manage sensitive settings, or remove another owner;
- never allow deletion/demotion of the last owner;
- every server action calls a centralized `requirePermission`;
- UI hides unavailable actions, but server/database remain authoritative;
- RLS uses permissions for direct table access where appropriate;
- service-role admin actions must perform permission checks before obtaining/using the service client.

## 5.3 Input and file validation

- Use Zod on server for every public and admin mutation.
- Do not accept record table/field names from arbitrary client input.
- Replace generic `adminSetField(table, field...)` patterns with allowlisted typed actions.
- Validate upload extension, MIME, file signature where practical, size, bucket, and purpose.
- Sanitize rich HTML on write and render.
- Add rate limits to:
  - login-sensitive flows where possible;
  - contact form;
  - newsletter;
  - payment proof upload;
  - reviews;
  - public analytics;
  - checkout/order creation.
- Add honeypot and optional CAPTCHA adapter to public forms.
- Add security headers/CSP compatible with Supabase and required embeds.
- Do not log full payment evidence URLs or sensitive customer notes.

---

# 6. Atomic commerce and entitlement system — P0

## 6.1 Never trust browser pricing

Customers must not directly insert arbitrary:

- orders;
- order items;
- prices;
- discounts;
- coupon redemptions;
- payment amounts;
- access grants.

Revoke or restrict customer insert policies and use RPCs/server-only transactions.

## 6.2 Unified atomic checkout RPC

Create one idempotent transaction for non-booking products, for example:

`public.create_checkout_order(p_product_id, p_variant_id, p_coupon_code, p_idempotency_key)`

It must:

1. require authenticated user when product requires an account;
2. lock/read the current product/variant;
3. verify status, sale dates, visibility, inventory/capacity, eligibility;
4. calculate canonical price from database;
5. calculate the best valid offer according to documented deterministic rules;
6. validate coupon:
   - active window;
   - total use limit;
   - per-user limit;
   - product/type/category target;
   - minimum spend if added;
7. prevent invalid offer/coupon stacking;
8. create order;
9. create correct line item snapshots;
10. reserve capacity where applicable;
11. set expiry;
12. write timeline/audit;
13. return only safe checkout data.

Support:

- course;
- book;
- workshop;
- package/subscription plan;
- bundle;
- VIP;
- free resource.

Free resources must still create a safe entitlement flow without fake payment.

## 6.3 Payment submission

Create a controlled payment submission flow:

- payment method selected from admin-managed enabled methods;
- amount is derived from order balance, never a user-entered canonical amount;
- proof stored privately;
- duplicate/expired/cancelled order checks;
- optional sender name/reference/time fields;
- proof status timeline;
- user receives confirmation that it is pending review.

## 6.4 Atomic approval RPC

Create an idempotent database transaction, e.g. `approve_payment_and_fulfill`, that:

1. checks `payments.approve`;
2. locks payment/order;
3. returns success without duplicating work if already approved;
4. verifies order state and amount/balance;
5. approves payment;
6. marks order paid when fully settled;
7. redeems coupon once;
8. grants entitlements;
9. enrolls courses;
10. grants books;
11. registers workshops and atomically consumes a seat;
12. activates package/subscription;
13. confirms associated booking where policy requires;
14. creates notifications;
15. creates booking/workshop/order events;
16. writes audit data;
17. commits all or none.

## 6.5 Rejection, cancellation, adjustment, refund

Implement controlled operations:

- reject proof with required reason;
- allow resubmission;
- expire order;
- cancel unpaid order;
- administrative order adjustment with:
  - allowed states;
  - reason;
  - old/new totals;
  - recalculated balance;
  - audit;
- refund record with amount, reason, method, reference, date;
- full or partial refund only if data model supports it consistently;
- revoke or shorten entitlement according to refund policy;
- release workshop seat;
- cancel linked booking when required;
- never erase original payment/order history.

Create order/payment timelines visible in admin and customer dashboard.

## 6.6 Financial truth

Reports must distinguish:

- pending;
- approved/collected;
- rejected;
- refunded;
- net revenue;
- discounts;
- outstanding balance.

Do not call an active manual plan “automatic recurring revenue” unless an actual recurring payment gateway exists. It may be reported as active subscription value or monthly equivalent, clearly labeled.

---

# 7. Media Library — required foundation

The owner must not be forced to create or paste URLs for platform-owned images/files.

## 7.1 Data model

Extend `media_assets` with:

- `title`
- `original_name`
- `mime_type`
- `extension`
- `width`
- `height`
- `duration_seconds`
- `size_bytes`
- `checksum`
- `folder_id`
- `caption`
- `alt`
- `tags`
- `visibility` (`public`, `protected`, `private`)
- `status` (`active`, `archived`, `trashed`)
- `uploaded_by`
- `created_at`
- `updated_at`
- `deleted_at`.

Add:

- `media_folders`
- `media_usages` with asset, entity type, entity id, field/purpose
- optional `media_variants` for thumbnail/optimized renditions if generated.

## 7.2 Storage

Use clear buckets/purposes:

- public brand/content images;
- avatars;
- payment proofs;
- protected books;
- course videos;
- course resources;
- workshop recordings;
- workshop resources;
- optional private admin attachments.

Public assets may use public URLs. Protected assets must use short-lived signed URLs after entitlement checks.

For large videos/recordings, use resumable direct-to-Supabase uploads rather than sending large binary bodies through a Next.js server action. Create signed/upload authorization after an admin permission check.

## 7.3 Admin experience

Implement:

- drag and drop;
- multi-file upload;
- progress and retry;
- preview;
- image dimensions;
- file size and type;
- folders;
- search;
- filters;
- sort;
- tags;
- copy public URL only as a secondary tool;
- edit title, alt, caption, tags;
- replace file while preserving references;
- archive;
- trash;
- restore;
- permanent delete only when unused and authorized;
- usage list: “used by product X / article Y / home hero”;
- bulk move/tag/archive;
- protected-file badge;
- meaningful Arabic error messages.

## 7.4 Reusable Media Picker

Create a standard `MediaPicker` modal/drawer used by every admin form.

It must support:

- choose existing asset;
- upload new asset without leaving the form;
- allowed media type/purpose;
- preview selected media;
- remove selection;
- focal point/position for image crops where relevant;
- select one or multiple assets;
- return asset IDs, not manually typed storage URLs.

Replace routine `cover_url` fields with `cover_media_id`, while preserving and migrating legacy URLs.

---

# 8. Admin OS experience

The admin must feel like a professional operational product, not a set of database forms.

## 8.1 Shell

Implement:

- responsive collapsible sidebar;
- grouped navigation;
- badges for pending work;
- breadcrumbs;
- global command/search palette;
- quick-create menu;
- notifications/attention center;
- owner profile menu;
- clear environment indicator for non-production;
- no secret values.

## 8.2 Global search

Search across:

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

Results must link to real detail pages, not only list filters.

## 8.3 Standard data table

Build a shared server-driven admin table with:

- search;
- pagination;
- sorting;
- filters;
- date range;
- status filters;
- column visibility;
- row selection;
- safe bulk actions;
- CSV export where permitted;
- saved view/query in URL;
- empty/loading/error states;
- mobile-readable fallback.

Do not fetch arbitrary thousands of records into the browser.

## 8.4 Entity editors

Use full create/edit/detail routes, for example:

- `/admin/products/new`
- `/admin/products/[id]`
- `/admin/customers/[id]`
- `/admin/orders/[id]`
- `/admin/bookings/[id]`

Complex forms must use tabs/sections, not compressed nested accordions.

Provide a sticky action bar:

- Save draft;
- Preview;
- Publish/schedule;
- Archive;
- Duplicate where relevant;
- View public page;
- Revision history.

Implement:

- inline validation;
- unsaved-changes warning;
- disabled/busy states;
- optimistic UI only where safe;
- owner-friendly Arabic;
- no raw PostgreSQL errors;
- clear confirmations for destructive actions.

## 8.5 Lifecycle behavior

For publishable content:

- save draft without public visibility;
- preview with a secure preview token;
- schedule future publication;
- publish now;
- unpublish;
- archive;
- restore;
- view history;
- restore revision.

---

# 9. Dashboard and attention center

Rebuild `/admin/overview` as an operational cockpit.

Show configurable date ranges and actionable cards:

- payments awaiting review;
- orders expiring soon;
- upcoming sessions today/this week;
- unconfirmed bookings;
- workshop capacity alerts;
- unread contact messages;
- unpublished/scheduled content;
- failed jobs/emails;
- active packages;
- package credits near expiry;
- recent sales;
- recent customers;
- revenue today/week/month;
- refunds;
- top products;
- conversion indicators when enough event data exists.

Every card must link to a filtered operational list.

Add “Today” timeline:

- sessions;
- workshop events;
- deadlines;
- scheduled publications;
- package expiries.

---

# 10. Customer 360 / CRM

Create a real customer detail page.

## 10.1 Customer record

Tabs:

1. Overview
2. Profile
3. Orders
4. Payments
5. Bookings
6. Packages/subscriptions
7. Courses/progress
8. Books/downloads
9. Workshops/attendance
10. Access/entitlements
11. Notes/tags
12. Notifications/activity

## 10.2 Actions

Authorized admin can:

- edit name/phone and permitted profile fields;
- add private notes;
- add/remove tags;
- send in-app notification;
- send configured email;
- create a manual booking;
- assign/extend/pause/cancel a package;
- adjust session credits with reason;
- grant/revoke content access with reason;
- resend access instructions;
- send password reset link; never view or set the user’s password directly;
- archive/suspend application access if implemented;
- export the customer record where lawful;
- anonymize/delete through a controlled privacy workflow, preserving financial records as required.

Show one chronological activity timeline.

---

# 11. Products and catalog

Create one coherent catalog architecture while retaining type-specific records.

## 11.1 Product fields

Admin must control:

- type;
- lifecycle status;
- title;
- slug with auto-generation and uniqueness check;
- subtitle;
- short description;
- rich long description;
- benefits;
- target audience;
- what is included;
- prerequisites;
- FAQ;
- cover media;
- gallery media;
- price;
- compare-at price;
- currency;
- sale start/end;
- featured flag;
- catalog sort;
- categories/tags;
- SEO title/description/social image;
- visibility;
- related products;
- cross-sell;
- variants;
- bundles;
- purchase limits;
- terms acknowledgment where needed.

## 11.2 Operations

Admin can:

- create;
- edit;
- save draft;
- preview;
- schedule;
- publish/unpublish;
- archive/restore;
- duplicate;
- reorder;
- add/remove bundle children;
- view orders/revenue/access records;
- see revision history.

Maintain price history and do not silently rewrite historical order line prices when product price changes.

---

# 12. Services, availability, bookings, and calendar

This area must become one of the strongest parts of the platform.

## 12.1 Service configuration

Admin controls:

- title/copy/media;
- price and compare-at price;
- currency;
- session duration;
- slot interval;
- buffer before;
- buffer after;
- minimum booking notice;
- maximum booking horizon;
- maximum bookings per day;
- allowed customer type/package;
- confirmation mode;
- meeting mode;
- cancellation/reschedule rules;
- active/published state;
- intake questions;
- reminder schedule.

## 12.2 Availability redesign

Remove the one-window-per-service/day limitation.

Support:

- multiple working intervals per weekday;
- breaks;
- different intervals by service;
- recurring weekly schedule;
- date-specific override;
- closed date;
- custom open hours for a date;
- holidays/blackout ranges;
- temporary pause;
- timezone stored explicitly;
- slot generation using service duration and buffers;
- availability preview calendar;
- copy schedule to another service;
- apply schedule to a date range;
- prevent conflicts at database level.

## 12.3 Booking calendar

Provide:

- day/week/month/agenda views;
- filters by service/status/customer;
- color-coded statuses;
- drag-to-reschedule only with server conflict validation;
- create manual booking;
- open booking detail;
- export/print daily schedule.

## 12.4 Booking detail and actions

Admin controls:

- customer;
- service;
- start/end;
- status;
- meeting link;
- customer notes;
- private admin notes;
- order/payment link;
- price override or adjustment with reason;
- confirm;
- reschedule;
- cancel;
- complete;
- mark no-show;
- restore when safe;
- send notification/reminder;
- view timeline.

All changes must:

- validate conflicts;
- update linked order/credits when relevant;
- create booking events;
- write audit logs;
- notify customer as configured.

## 12.5 Customer self-service

Complete customer flows:

- request reschedule;
- cancel according to policy;
- display applicable fee/refund implication;
- show confirmed meeting information;
- show event history;
- prevent unauthorized changes.

Policies must come from typed admin settings, not duplicated hardcoded text.

---

# 13. Packages and subscriptions

The owner must be able to create any number of packages and manage them fully.

## 13.1 Plan configuration

Fields:

- title;
- slug;
- description;
- media;
- status;
- price;
- currency;
- billing label:
  - monthly;
  - quarterly;
  - yearly;
  - one-time period;
- duration days/months;
- included session credits;
- eligible service types;
- credit reset rule;
- rollover rule;
- expiry behavior;
- maximum active subscribers;
- per-customer purchase limit;
- sale start/end;
- plan start/end;
- trial/grace fields only if genuinely supported;
- features;
- FAQ;
- featured/sort;
- terms;
- SEO.

## 13.2 Subscription/customer package management

Admin can:

- create from a paid order;
- assign manually;
- activate;
- pause;
- resume;
- extend;
- cancel;
- expire;
- add/remove credits with required reason;
- consume/reverse credits;
- correct start/end date;
- transfer only if explicitly supported;
- see bookings paid by package;
- see credit ledger;
- see complete timeline.

Do not rely only on `sessions_used`. Add a proper immutable credit ledger:

- grant;
- consume;
- reverse;
- expire;
- adjustment;
- source booking/order/admin;
- actor;
- reason;
- timestamp.

Booking RPC must atomically consume a valid package credit when selected and reverse it when cancellation policy permits.

## 13.3 Public/customer package experience

- published plans appear from database;
- checkout works through the atomic order flow;
- customer dashboard shows:
  - active plan;
  - start/end;
  - available/used credits;
  - eligible services;
  - upcoming expiry;
  - related bookings;
  - renewal/purchase action;
- no claim of automatic renewal until a recurring gateway is implemented.

---

# 14. Courses and LMS administration

## 14.1 Course editor

Admin controls:

- all product fields;
- course level;
- estimated duration;
- instructor;
- outcomes;
- prerequisites;
- cover/gallery;
- certificate configuration;
- access duration;
- drip settings;
- completion rules;
- visibility.

## 14.2 Curriculum builder

Implement an accessible drag-and-drop builder:

- modules;
- lessons;
- reorder;
- duplicate;
- archive;
- preview;
- publish state.

Lesson types:

- video;
- audio;
- rich text;
- downloadable file;
- external live session;
- mixed lesson.

Lesson controls:

- title;
- description;
- content;
- media/file picker;
- duration;
- free preview;
- completion rule;
- resources;
- sort;
- status.

Protected files use entitlement checks and signed URLs.

## 14.3 Enrollment management

Admin can:

- enroll user;
- revoke/expire access with reason;
- set access end date;
- reset progress;
- mark lesson/course complete;
- view progress;
- issue/revoke certificate;
- export enrollments;
- message students.

Public/customer behavior must match these records.

Quizzes, assignments, discussions, and community are P2 unless already required by an existing product. Do not invent a “community” promise before it exists.

---

# 15. Books administration and protected delivery

## 15.1 Book editor

Admin controls:

- all product fields;
- author;
- edition;
- publication date;
- ISBN if applicable;
- page count;
- language;
- formats;
- cover/gallery;
- sample media/file;
- description/contents;
- download policy;
- SEO.

## 15.2 Versions and files

Admin can:

- create versions/editions;
- upload PDF/EPUB through Media Library;
- set current version;
- replace file without invalidating historical metadata;
- publish/unpublish a version;
- add release notes;
- view file size/checksum;
- configure download limit if used;
- see download logs;
- grant/revoke access.

## 15.3 Customer delivery

Complete real download flow:

1. verify authentication;
2. verify book access;
3. resolve current permitted file;
4. create short-lived signed URL;
5. write download log;
6. return/redirect safely.

The customer book button must never simply link back to the public product page.

---

# 16. Workshops

## 16.1 Workshop editor

Admin controls:

- all product fields;
- date/time/timezone;
- registration open/close;
- capacity;
- waitlist;
- online/in-person/hybrid;
- address;
- meeting link;
- host;
- agenda;
- requirements;
- recording availability;
- resource availability;
- reminder schedule;
- status:
  - draft;
  - open;
  - full;
  - closed;
  - completed;
  - cancelled;
  - postponed;
  - archived.

## 16.2 Registrations

Admin can:

- view/filter/export registrations;
- add participant manually;
- approve/cancel registration;
- move waitlist to confirmed;
- mark attendance/no-show;
- send message;
- resend meeting link;
- issue refund/cancel through controlled order operation;
- view payment/order;
- view timeline.

Capacity must be reserved/released atomically.

## 16.3 Recordings/resources

Admin uploads or selects:

- recording;
- slides;
- worksheets;
- audio;
- links.

Configure:

- who can access;
- available from/until;
- visibility in customer dashboard.

Complete the customer workshop dashboard to show valid links, recordings, and resources.

## 16.4 Detail route

Fix `/workshops/[slug]` to load the requested workshop and render a genuine details/checkout page. Add not-found handling and draft preview.

---

# 17. CMS and complete page control

The owner must control public pages without editing source code, but the CMS must remain structured and safe.

## 17.1 Structured page builder

Use existing `pages` and `page_sections`, extend them with:

- stable key;
- lifecycle status;
- scheduled publish time;
- section schema version;
- style variant;
- background/media IDs;
- created/updated metadata.

Supported section types must have typed Zod schemas and owner-friendly forms. Do not allow arbitrary executable code.

Core section types:

- hero;
- rich text;
- image + text;
- owner profile;
- trust/proof strip;
- problem/recognition block;
- method/steps;
- “باب الخروج” feature;
- products/services grid;
- featured offer;
- testimonials;
- articles;
- FAQ;
- CTA;
- newsletter;
- contact;
- spacer/divider only where needed.

Admin can:

- add;
- edit;
- duplicate;
- reorder;
- show/hide;
- schedule;
- preview;
- delete to trash;
- restore;
- inspect revision history.

## 17.2 Built-in pages

Connect these pages to CMS data:

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
- refund/cancellation;
- disclaimer.

The code should render robust structured components, while content/order/visibility/media come from Supabase.

## 17.3 Home page recommended structure

Admin-configurable sections:

1. Hero:
   - specific problem/transformation;
   - Heba image;
   - primary “ابدئي من هنا” CTA;
   - secondary “اكتشفي باب الخروج”.
2. Recognition block:
   - signs that the visitor has lost her voice/choice.
3. Heba’s method:
   - action of pressure;
   - hidden rule;
   - internal effect;
   - sound counter-balance;
   - cost/choice;
   - safe next step.
4. “باب الخروج” primary feature.
5. Choose your doorway:
   - book/read;
   - course/learn;
   - workshop/experience;
   - session/accompaniment.
6. About Heba/trust.
7. verified transformations/reviews only.
8. selected content/articles.
9. newsletter.
10. final CTA.

Remove generic or duplicate sections that do not serve conversion.

## 17.4 Navigation/footer

Admin can:

- add/edit/hide/reorder items;
- create nested items;
- control header/footer menus;
- choose internal page/product or external URL;
- validate broken internal links;
- control CTA label and target;
- edit footer contact/legal/social details.

---

# 18. Articles and editorial system

Implement:

- rich editor;
- cover media picker;
- excerpt;
- tags/categories;
- author;
- draft;
- preview;
- scheduled publication;
- publish/unpublish;
- archive/restore;
- duplicate;
- revisions;
- SEO;
- social image;
- related articles/products;
- reading time generated from content;
- safe sanitized rendering.

Admin article list uses data table filters and bulk archive/publish where safe.

Do not expose author/admin IDs publicly.

---

# 19. Reviews and trust

## 19.1 Customer review flow

Allow an authenticated eligible customer to submit a review after a qualifying purchase/access.

Store:

- user;
- product;
- rating;
- comment;
- verified-purchase/access flag;
- moderation status;
- consent for display name;
- created/updated.

## 19.2 Admin moderation

Admin can:

- approve;
- reject with internal reason;
- feature;
- unfeature;
- archive;
- restore;
- optionally publish an owner response;
- filter by product/rating/status;
- verify eligibility;
- view audit trail.

No fabricated fallback reviews or counts in production.

---

# 20. Marketing, offers, coupons, newsletter

## 20.1 Coupons

Admin controls:

- code;
- percent/fixed;
- value validation;
- active/scheduled;
- start/end;
- total uses;
- per-user uses;
- minimum spend;
- eligible products/types/categories;
- excluded products;
- customer segment if implemented;
- first-purchase only if implemented;
- stack policy;
- usage report;
- archive.

## 20.2 Offers

Admin controls:

- title/copy/badge;
- media;
- discount;
- targets;
- start/end;
- usage/capacity;
- countdown visibility;
- homepage placement;
- priority;
- status;
- reporting.

Never generate evergreen fake urgency by resetting an expiry date.

## 20.3 Newsletter

Complete:

- subscribe validation;
- double-opt-in-ready status model;
- unsubscribe token/route;
- resubscribe;
- source/consent timestamp;
- export with permission;
- suppression status;
- search/filter.

Create an email provider adapter. Initial supported provider may be Resend when configured; otherwise keep outbound email disabled with a clear setup state. In-app notifications must continue to work.

Add email templates in admin for transactional messages, with preview and safe variables:

- payment received;
- payment approved/rejected;
- booking confirmed/rescheduled/cancelled;
- workshop reminder;
- content access;
- package expiry.

Do not make bulk campaign sending a launch blocker if provider/consent requirements are not complete.

---

# 21. Inbox and communications

Contact messages need:

- list filters;
- detail view;
- status;
- assign to staff;
- internal notes;
- reply status;
- archive;
- safe deletion/retention policy;
- link to customer when email matches;
- spam flag;
- export only with permission.

Create a unified communication log for:

- in-app notification;
- transactional email;
- manual contact note;
- delivery status where provider returns it.

---

# 22. Reports and analytics

## 22.1 Global report controls

All reports need:

- date range;
- comparison period;
- filters;
- clear timezone;
- loading/error state;
- CSV export with permission;
- printable view;
- no silent catch that converts database errors into zeros without showing system health.

## 22.2 Required reports

### Commerce
- gross collected;
- refunds;
- net revenue;
- pending payments;
- average order value;
- orders by status;
- revenue by product/type;
- discounts;
- coupon use;
- top/low products;
- expired/abandoned orders.

### Bookings
- bookings by service/status;
- confirmation rate;
- cancellation rate;
- no-show rate;
- utilization by weekday/time;
- package-credit bookings;
- upcoming load.

### Packages
- active/paused/expired/cancelled;
- sales by plan;
- active plan value;
- credits granted/used/expired;
- renewal/repurchase;
- capacity.

### Courses
- enrollments;
- active learners;
- average progress;
- completion;
- drop-off by lesson;
- certificates;
- reviews.

### Books
- sales/access;
- downloads;
- unique downloaders;
- version usage.

### Workshops
- registrations;
- capacity;
- attendance;
- no-show;
- revenue;
- waitlist;
- recording access.

### Customers
- new users;
- buyers;
- repeat buyers;
- customer lifetime collected value;
- segment/tag;
- inactive customers.

### Content/marketing
- article views if analytics consent is implemented;
- CTA events;
- newsletter subscriptions/unsubscribes;
- offer/coupon performance;
- checkout funnel events.

## 22.3 Snapshots

Keep report snapshots only when they provide a real immutable comparison use. Store snapshot payload, period, filters, creator, timestamp. Provide view/export, not merely a list saying a snapshot exists.

---

# 23. Settings and system control

## 23.1 Owner-friendly settings pages

Use categorized forms, not raw JSON:

- General
- Brand
- Heba profile
- Contact/social
- SEO
- Payments
- Booking policies
- Refund/cancellation
- Notifications/email
- Legal
- Analytics/privacy
- Feature visibility
- Maintenance

## 23.2 Payment methods

Admin controls:

- enabled/disabled;
- display name;
- instructions;
- account/phone/reference text;
- logo/media;
- sort;
- proof required;
- public visibility.

Sensitive bank information is only public if the owner explicitly configures it as public payment instructions.

## 23.3 System status

Show:

- Supabase connection;
- required tables/migrations;
- Storage buckets;
- cron/expiry job last run;
- failed jobs;
- email provider configured;
- pending stale orders;
- orphaned media;
- missing required settings;
- broken content references;
- build/app version.

Provide safe repair actions only where idempotent.

---

# 24. Public and customer experience completion

Complete the public/customer promises:

1. real workshop detail page;
2. real book download;
3. course protected resources;
4. workshop recordings/resources;
5. reschedule/cancel workflow;
6. newsletter unsubscribe;
7. verified review submission;
8. customer package/credit view;
9. order/payment timeline;
10. consistent pricing/policy copy from one data source;
11. mobile-first Arabic RTL;
12. accessibility;
13. no demo content in production;
14. meaningful error states;
15. no broken call-to-action destinations.

---

# 25. Database migration blueprint

Create ordered migrations after the current latest migration. Do not force all concepts into one migration.

Recommended grouping:

## Migration A — permissions and admin safety
- expanded role check;
- permission seeds;
- `has_permission`;
- last-owner protections;
- audit enhancements;
- permission-aware policies.

## Migration B — media system
- media metadata columns;
- folders;
- usages;
- statuses;
- timestamps;
- relevant indexes and policies.

## Migration C — lifecycle/revisions/CMS
- status/schedule fields;
- section keys/schema versions;
- revision improvements;
- navigation enhancements;
- legacy backfills.

## Migration D — commerce hardening
- idempotency keys;
- order/payment timeline/adjustments/refunds as needed;
- atomic checkout;
- atomic approval/fulfillment;
- policy revocations;
- capacity locks;
- entitlement uniqueness and integrity.

## Migration E — booking and availability
- multiple intervals/day;
- buffers and service settings;
- blackout ranges;
- package-credit support;
- booking adjustment fields;
- conflict constraints/functions.

Remove the migration-018 uniqueness constraint/index that enforces one interval per service/day only after the replacement model and backfill are ready.

## Migration F — packages/credit ledger
- plan enhancements;
- subscription fields;
- immutable credit ledger;
- integrity functions/indexes.

## Migration G — content delivery
- media references;
- book version/file enhancements;
- workshop resources/recordings access windows;
- course lesson types/access duration.

## Migration H — communications/jobs/reports
- unsubscribe tokens/consent;
- email outbox/provider status;
- operational jobs;
- report support.

Every migration must include:

- comments;
- indexes;
- constraints;
- RLS;
- grants/revokes;
- backfill;
- compatibility notes;
- rollback guidance in documentation.

---

# 26. Testing and quality gates

## 26.1 Unit/business tests

Add tests for:

- price calculation;
- offer/coupon eligibility;
- validation schemas;
- lifecycle transitions;
- package credit ledger;
- booking slot generation;
- cancellation policy calculations;
- permission matrix.

## 26.2 Database/integration verification

Add scripts/tests that attempt direct calls as:

- anonymous;
- normal authenticated customer;
- support;
- editor;
- finance;
- owner.

Prove that a customer cannot:

- create a cheaper order;
- alter an order total;
- approve payment;
- grant access;
- read another customer’s booking/payment proof;
- download protected content without entitlement;
- overbook a workshop;
- book an unavailable/conflicting slot.

Prove atomic behavior under repeated approval and repeated checkout idempotency keys.

## 26.3 E2E flows

Automate at least:

1. public browse → register/login → product checkout → proof upload;
2. admin review → approve → customer receives access;
3. reject proof → resubmit;
4. book session → pay → confirm → reschedule/cancel according to policy;
5. purchase package → consume credit → reverse when allowed;
6. purchase book → download signed file;
7. purchase course → open protected lesson;
8. register workshop → seat count → recording access;
9. admin creates article/page section with uploaded image → preview → publish;
10. role permission denial;
11. mobile navigation;
12. accessibility smoke.

## 26.4 Quality command

Update `check:deploy` to include:

- type check;
- lint;
- production build;
- unit tests;
- relevant integration tests;
- route audit;
- UX audit;
- color/brand audit;
- secret/security audit;
- admin route/permission audit;
- database migration audit;
- launch docs audit;
- Playwright smoke/E2E in CI.

No completion claim unless the command passes in the available environment, or a clearly documented external-environment blocker is the only remaining item.

---

# 27. Documentation deliverables

Create/update:

- `docs/MASTER_PLAN.md` — this specification distilled into repository documentation;
- `docs/PROJECT_STATE.md` — current completed/in-progress/blocked items and next exact task;
- `docs/DECISIONS.md` — concise architectural decisions;
- `docs/KNOWN_ISSUES.md` — severity, impact, reproduction, owner;
- `docs/ADMIN_GUIDE.md` — owner-facing use of every admin module;
- `docs/PERMISSIONS_MATRIX.md`;
- `docs/DATA_DICTIONARY.md`;
- `docs/SUPABASE_SETUP.md`;
- `docs/STORAGE_AND_MEDIA.md`;
- `docs/SECURITY_RUNBOOK.md`;
- `docs/DEPLOYMENT.md`;
- `docs/TESTING.md`;
- `docs/LAUNCH_CHECKLIST.md`.

Create `AGENTS.md` at repository root with concise continuing instructions for future Codex sessions:

- read `PROJECT_STATE`;
- preserve approved brand;
- no fake public data;
- migrations only;
- permission/atomicity rules;
- quality gate;
- no owner questions for resolved decisions.

---

# 28. Phased implementation order

Follow this order. Do not begin cosmetic extras before P0 integrity.

## Phase 0 — Baseline and safety
- inspect repository;
- record baseline;
- remove package secrets/temp artifacts;
- create missing docs;
- update security audit;
- run available baseline checks.

**Exit:** clean source/release package, documented baseline, no secret in distributable archive.

## Phase 1 — Admin foundations
- permission architecture;
- central admin auth/action helpers;
- admin shell;
- data table;
- entity editor layout;
- typed validation;
- consistent feedback/errors.

**Exit:** all current admin routes use centralized permission gates and shared patterns.

## Phase 2 — Media Library
- schema;
- storage flows;
- media manager;
- picker;
- reference tracking;
- replace URL inputs in at least all primary content/product forms.

**Exit:** owner can upload/select/reuse images/files without creating URLs.

## Phase 3 — Commerce P0
- atomic checkout;
- payment submission;
- atomic approval/fulfillment;
- rejection/cancellation/refund foundation;
- workshop capacity;
- entitlement integrity;
- security abuse tests.

**Exit:** direct-client price manipulation and partial fulfillment are prevented.

## Phase 4 — Product/catalog and owner settings
- full product editor;
- lifecycle;
- media;
- variants/bundles;
- typed settings/payment methods;
- source-of-truth policies/prices.

**Exit:** owner can operate all saleable catalog items from admin.

## Phase 5 — Booking and packages
- availability redesign;
- calendar;
- full booking operations;
- plan editor;
- credit ledger;
- package-backed booking.

**Exit:** owner controls prices, durations, multiple availability windows, exceptions, packages, credits, and bookings safely.

## Phase 6 — Courses, books, workshops
- curriculum;
- protected media;
- enrollments;
- book versions/download;
- workshop registrations/attendance/resources/recordings;
- real detail page.

**Exit:** all public promises for purchased content are functional.

## Phase 7 — CMS and brand implementation
- approved tokens;
- owner profile;
- structured pages/sections;
- navigation/footer;
- home and About rewrite architecture;
- “باب الخروج” primary feature;
- preview/schedule/revisions.

**Exit:** public site is controlled from admin and visibly matches the approved brand.

## Phase 8 — CRM, communications, reviews
- Customer 360;
- notes/tags/activity;
- communication log;
- verified reviews;
- inbox;
- unsubscribe.

**Exit:** customer operations no longer require manual table work.

## Phase 9 — Reports and marketing
- date-range reports;
- exports;
- offers/coupons;
- operational metrics;
- report snapshots;
- funnel events where consent exists.

**Exit:** owner can see business truth and act from reports.

## Phase 10 — Hardening and launch
- full tests;
- accessibility;
- performance;
- security;
- clean production seed;
- deployment/setup docs;
- launch checklist;
- final owner guide.

**Exit:** all P0/P1 acceptance tests pass and remaining P2 items are clearly separated.

---

# 29. Scope control and token efficiency

To minimize waste:

1. Do not produce alternate architectures unless an existing repository constraint makes the approved one impossible.
2. Do not ask the owner to choose libraries, table names, field names, routes, or UI patterns already resolved here.
3. Reuse existing valid components and tables.
4. Implement vertical slices, not disconnected screens.
5. Use the repository docs as memory across compaction.
6. Read only targeted files for the current phase.
7. Run targeted tests after a slice; run full tests at phase exit.
8. Do not output full source files in chat.
9. Do not spend time on P2 before P0/P1.
10. Do not implement speculative community, quizzes, gamification, multilingual, international tax, printing/shipping, or automatic recurring billing during the initial completion unless the current repository already contains a dependent contract.
11. Prepare extension points for:
    - English;
    - international payments;
    - multi-currency;
    - printed book fulfillment;
    - community;
    but do not let them delay the secure Arabic launch.
12. When context becomes large:
    - update `PROJECT_STATE.md`;
    - update `DECISIONS.md`;
    - compact;
    - continue from the exact next task;
    - do not ask the owner to restate the project.

---

# 30. Definition of done

The project is not “done” because pages exist.

It is done for launch only when:

- no secret is present in distributable files;
- every admin mutation has real backend behavior;
- permissions are enforced;
- owner can upload/select media internally;
- core public content is CMS-controlled;
- products and prices are admin-controlled;
- checkout and fulfillment are atomic;
- bookings cannot conflict;
- workshop seats cannot overbook;
- packages have a real credit ledger;
- books can actually be downloaded by entitled users;
- course/workshop protected resources work;
- customer reschedule/cancel flows work;
- newsletter unsubscribe works;
- no fake public proof or urgency remains;
- policies/prices come from one source of truth;
- reports show accurate collected/refunded/pending distinctions;
- audit/revisions exist;
- tests cover abuse and full journeys;
- documentation allows the owner/team to operate the system.

---

# 31. Required final response from Codex

At the end of each completed phase, respond briefly with:

1. phase completed;
2. files/migrations added or materially changed;
3. user-visible/admin capabilities now working;
4. tests run and result;
5. remaining blockers that genuinely require an external credential or manual dashboard action;
6. exact next phase.

Do not ask for approval between phases. Continue automatically unless the environment itself prevents edits or execution.

At the end of the full run, provide:

- overall status: `READY`, `PARTIALLY READY`, or `NOT READY`;
- completed phases;
- P0 open items;
- P1 open items;
- P2 deferred items;
- migration order;
- setup commands;
- required manual secret rotation/configuration;
- test evidence;
- launch recommendation.

---

# 32. Start instruction

Begin now.

First:

1. inspect the current repository and latest migration;
2. create/update the project state and decision documents;
3. secure the repository/package;
4. establish the permission/admin foundation;
5. proceed through the phases above without returning to the owner for choices already resolved in this document.

Do not stop after producing a plan. Implement.
