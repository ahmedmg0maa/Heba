# تقرير المراجعة الفنية الشاملة
## منصة Heba ElSherif — النسخة `hebaelsherif1.zip`

**تاريخ المراجعة:** 12 يوليو 2026  
**نوع المراجعة:** مراجعة مصدر كاملة، مقارنة بالنسخة السابقة، مطابقة مع MASTER EXECUTION PROMPT، فحص migrations، الصلاحيات، الأدمن، الوسائط، التجارة، الحجوزات، الباقات، المحتوى، البراند، التقارير، والاختبارات.

---

# 1. الحكم التنفيذي

هذه النسخة **أفضل كثيرًا من النسخة السابقة**، والتغييرات فيها حقيقية وليست مجرد شاشات أو مستندات. تم تنفيذ أساس قوي في:

- حماية المستودع وحزم التسليم؛
- صلاحيات الأدمن الدقيقة؛
- مكتبة الوسائط الأولية؛
- إنشاء الطلبات ومراجعة الدفع بصورة ذرية؛
- متغيرات المنتجات والحزم؛
- أكثر من نافذة مواعيد في اليوم؛
- بداية نظام أرصدة الباقات والحجز بالرصيد.

لكن النسخة **ليست تنفيذًا كاملًا للخطة الكبرى**، ولا ينبغي اعتمادها كنسخة إطلاق نهائية.

الحالة الصحيحة حاليًا:

> **PARTIALLY READY / NOT READY FOR PAID PRODUCTION LAUNCH**

السبب ليس وجود خطأ واحد، بل أن وثيقة حالة المشروع نفسها تسجل:

- Phases 0–4: مكتملة.
- Phase 5: ما زالت قيد التنفيذ.
- Phases 6–10: غير مكتملة.

أهم ما لم يكتمل:

- إدارة الدورات والكتب والورش والتسليم المحمي بصورة كاملة؛
- CMS كامل للصفحات؛
- تطبيق هوية هبة الجديدة؛
- Customer 360؛
- التقارير الاحترافية؛
- دورة الإلغاء وإعادة الجدولة واسترجاع رصيد الباقة؛
- ضبط سعة الورش بصورة ذرية؛
- اختبارات الرحلات الكاملة؛
- التجهيز النهائي للإطلاق.

---

# 2. حدود المراجعة وما تم اختباره

## ما تمت مراجعته

- فك ملف ZIP كاملًا.
- جرد ملفات المصدر والـmigrations والوثائق.
- مقارنة النسخة الحالية بالنسخة السابقة.
- قراءة الملفات المحورية للأدمن والصلاحيات والتجارة والوسائط والحجز.
- قراءة migrations من 019 إلى 028.
- تشغيل جميع أدوات التدقيق التي لا تحتاج dependencies:
  - routes;
  - UX;
  - colors;
  - admin;
  - media;
  - commerce;
  - catalog;
  - booking;
  - database;
  - launch.
- فحص محتويات Release الداخلي.
- فحص أسماء متغيرات البيئة دون عرض أي قيمة.

## ما لم يمكن إعادة تشغيله في بيئة المراجعة

لم أتمكن من إعادة تشغيل:

- `pnpm type-check`
- `pnpm lint`
- `pnpm build`
- Playwright
- اختبارات Supabase الحية

لأن:

- المشروع يتطلب Node 24؛
- البيئة المتاحة تحتوي Node 22؛
- `node_modules` غير موجود؛
- الاتصال الخارجي لتنزيل pnpm/dependencies لم يكن متاحًا.

لذلك لا أعتمد على ادعاء أن آخر migration 028 أو آخر تغييرات Phase 5 اجتازت بوابة كاملة، خصوصًا أن `PROJECT_STATE.md` ما زال يسجل Phase 5 كـ“in progress”.

---

# 3. المقارنة الكمية مع النسخة السابقة

بعد استبعاد الملفات المولدة، ملفات الاختبارات القديمة، release، `.env`، وبيانات البناء:

- **71 ملفًا جديدًا**
- **0 ملفات محذوفة**
- **39 ملفًا تغير**
- **10 migrations جديدة:** 019–028
- **25 صفحة أدمن**
- **22 ملف وثائق**
- **اختبارا Playwright فقط**

الملاحظة المهمة:

> لم تتغير صفحات الموقع العامة أو مكونات الصفحة الرئيسية والبراند في هذه الدفعة بصورة جوهرية؛ معظم التغيير كان في الأدمن، قاعدة البيانات، والإجراءات الخلفية.

---

# 4. التقييم الرقمي

| المحور | التقييم | الحكم |
|---|---:|---|
| حجم العمل الحقيقي | 8/10 | تعديل كبير وجاد |
| أساس الصلاحيات | 8/10 | قوي ومفيد، مع فجوات في قابلية الإدارة |
| أمان الأسرار والتسليم | 4/10 | Release نظيف، لكن ZIP المرسل يحتوي `.env` كاملًا |
| مكتبة الوسائط | 6/10 | بداية جيدة، ليست Media Library كاملة |
| التجارة والطلبات | 7/10 | تحسن معماري مهم، مع ثغرات أعمال وتزامن متبقية |
| المدفوعات والاسترداد | 6/10 | ذرية أفضل، لكن refund/accounting ما زالا محدودين |
| الحجوزات | 6/10 | نوافذ متعددة وحجز باقة، لكن دورة التشغيل ناقصة |
| الباقات والأرصدة | 5.5/10 | ledger موجود، لكن سلامة الدورة الكاملة غير مكتملة |
| إدارة المنتجات | 5.5/10 | variants/bundles حقيقية، المحرر لا يزال أساسيًا |
| الدورات والكتب والورش | 3.5/10 | Phase 6 لم تنفذ |
| CMS والتحكم في الصفحات | 3/10 | SEO ونشر فقط، لا تحكم كامل |
| الهوية والبراند | 2.5/10 | الهوية الجديدة لم تطبق |
| CRM والعملاء | 3/10 | قائمة عملاء وليست Customer 360 |
| التقارير | 4/10 | تقارير أساسية ثابتة |
| جودة الاختبارات | 5/10 | scripts مفيدة، لكنها ليست بديلًا عن full E2E |
| جاهزية الإطلاق المدفوع | 4.5/10 | غير جاهزة حاليًا |
| نسبة تقريبية من الخطة الكبرى | 40–45% | الأساس الصعب متقدم، لكن نصف المنتج التشغيلي لم ينجز |

---

# 5. أخطر نقطة فورية: الأسرار ما زالت داخل الملف المرسل

النسخة المرفوعة تحتوي ملف `.env` بقيم غير فارغة، ومنها:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_LOGIN_EMAIL`

لم تُعرض أي قيمة في هذا التقرير.

داخل المشروع يوجد script جيد ينشئ:

`release/hebaelsherif-source.tgz`

وهذه الحزمة الداخلية نظيفة ولا تحتوي `.env` أو `supabase/.temp`.

لكن الملف الذي تم ضغطه وإرساله هو **مجلد العمل كاملًا**، وليس حزمة release النظيفة.

## الحكم

كودكس أصلح آلية التسليم، لكنه لم يمنع الخطأ التشغيلي:

> يمكن لصاحب المشروع أن يضغط Workspace كاملًا فيعيد تسريب الأسرار.

## المطلوب فورًا

1. تدوير `SUPABASE_SERVICE_ROLE_KEY`.
2. اعتبار المفتاح الحالي مكشوفًا.
3. عدم إرسال ZIP لمجلد العمل مجددًا.
4. إرسال:
   - `release/hebaelsherif-source.tgz`
   فقط.
5. إضافة ملف واضح مثل:
   - `DO_NOT_ZIP_WORKSPACE.txt`
6. إضافة script واحد باسم واضح:
   - `pnpm deliver`
   ينشئ الحزمة الآمنة ويطبع مسارها.
7. يفضّل جعل audit الأمني يفحص archive الناتج ومجلد العمل، لا Git tracking فقط.

---

# 6. Phase 0 — الحماية والتوثيق

## ما تم جيدًا

- `.gitignore` أصبح أفضل.
- `package-release.mjs` ينشئ حزمة نظيفة.
- `audit-security.mjs` يفحص أنماط الأسرار والملفات الحساسة.
- أضيفت وثائق:
  - Security Runbook
  - Permissions Matrix
  - Testing
  - Storage and Media
  - Launch Checklist
  - Data Dictionary
  - AGENTS.md

## ما ينقص

- `audit:security` يفشل في ZIP المستخرج لأنه يعتمد على وجود `.git`.
- يجب أن يعمل في:
  - Git repository؛
  - source archive؛
  - CI؛
  بنفس الكفاءة.
- وثائق المشروع غير متزامنة:
  - `PROJECT_STATE.md` يقول Phase 5 in progress.
  - `FINAL_DELIVERY_REPORT.md` تقرير قديم V2.5.
  - `KNOWN_ISSUES.md` لا يسجل المشكلات الجديدة.
  - بعض الوثائق تقول “لا blockers”، بينما الخطة الكبرى لم تكتمل.
- لا يوجد Final Report حديث بعد migrations 019–028.

## الحكم

Phase 0 مكتملة تقنيًا بدرجة جيدة، لكنها لم تتحول إلى عملية تسليم تمنع الخطأ البشري.

---

# 7. Phase 1 — الصلاحيات والأدمن

## ما تم فعليًا

تم إنشاء أدوار:

- owner
- admin
- operations
- finance
- content
- marketing
- support
- editor

وتم إنشاء 118 mapping تقريبًا للصلاحيات، ومنها:

- payments.approve
- orders.refund
- bookings.manage
- media.manage
- content.publish
- reports.export
- roles.manage

تم كذلك:

- إنشاء `public.has_permission`.
- ربط عدد كبير من server actions بـ`requirePermission`.
- إضافة route permission layouts.
- تصفية روابط الـsidebar بحسب صلاحيات المستخدمة.
- منع إزالة آخر owner.
- اختبار دور support مقابل owner في النسخة التي سجلها كودكس.

## نقاط القوة

- الانتقال من `is_admin()` إلى صلاحيات دقيقة مهم جدًا.
- الخادم وقاعدة البيانات أصبحا أقوى من مجرد إخفاء الأزرار.
- فصل المالية عن المحتوى والدعم قرار سليم.
- owner wildcard واضح.
- منح وسحب الأدوار مسجل.

## العيوب

### 7.1 لا يوجد محرر صلاحيات داخل الأدمن

يوجد جدول `admin_permissions`، لكن صاحبة المنصة لا تستطيع من الواجهة:

- إضافة أو إزالة permission من دور؛
- إنشاء role مخصص؛
- مقارنة الأدوار؛
- رؤية أثر التغيير قبل الحفظ.

الواجهة تعيّن أدوارًا ثابتة فقط.

إذن “التحكم الكامل في الصلاحيات” لم يكتمل.

### 7.2 ازدواج مصدر الحقيقة

مصفوفة الصلاحيات موجودة في:

- TypeScript؛
- migration SQL.

هذا قد يسبب drift عند تعديل واحدة دون الأخرى.

الأفضل:

- قاعدة البيانات هي المصدر الأساسي؛
- الواجهة تجلب effective permissions؛
- TypeScript يحتوي type-safe keys فقط.

### 7.3 `has_permission` يقبل `uid` عشوائيًا

الدالة:

`has_permission(permission_name, uid)`

ممنوحة لأي authenticated user، وبالتالي يمكنها سؤال قاعدة البيانات عن صلاحية UUID لمستخدم آخر.

هي لا تمنح صلاحية، لكنها تكشف معلومة داخلية لا حاجة لها.

الأفضل:

- نسخة عامة تعتمد `auth.uid()` فقط؛
- نسخة service-only تقبل UID صريحًا.

### 7.4 fallback ثابت إذا فشل RPC

إذا فشل RPC، الخادم يرجع إلى مصفوفة TypeScript.

هذا يحافظ على العمل أثناء migration، لكنه في الإنتاج قد يخفي:

- migration ناقصة؛
- خطأ اتصال؛
- drift في قاعدة البيانات.

الأفضل بعد استقرار migration:

> fail closed مع تسجيل خطأ، لا fallback دائم.

### 7.5 واجهة الأدمن نفسها ما زالت قديمة نسبيًا

أضيف:

- `AdminDataTable`
- `AdminEditorShell`

لكن معظم صفحات الأدمن لا تستخدمهما فعلًا.

ما زالت أجزاء كثيرة:

- جداول بسيطة؛
- accordions؛
- forms مضغوطة؛
- لا صفحات details كاملة؛
- لا bulk actions؛
- لا saved views؛
- لا column control؛
- لا pagination حقيقية في كل الوحدات.

## الحكم

الأمان الخلفي في Phase 1 جيد، لكن “Admin OS” كخبرة استخدام لم يُنجز.

---

# 8. مشكلة إعداد Supabase Publishable Key

يوجد helper صحيح:

`hasSupabasePublicConfig()`

يدعم:

- Publishable Key؛
- Anon Key.

لكن ملفات كثيرة، ومنها نظام الصلاحيات، ما زالت تتحقق فقط من:

`NEXT_PUBLIC_SUPABASE_ANON_KEY`

النتيجة:

إذا نشر المشروع بالمفتاح الحديث فقط:

- أجزاء تعمل؛
- أجزاء تدخل Demo Mode؛
- بعض actions ترفض؛
- الأدمن قد يظهر empty/demo بصورة مضللة.

هذا تناقض مع ادعاء دعم publishable key.

## المطلوب

استبدال جميع checks المتناثرة بـhelper موحد، ومنع أي direct env check خارج ملف واحد.

---

# 9. Phase 2 — مكتبة الوسائط

## ما تم فعليًا

أضيفت metadata إلى `media_assets`:

- title
- original_name
- mime_type
- width
- height
- tags
- visibility
- updated_at

وأضيف جدول:

- `media_usages`

وتم تنفيذ:

- رفع ملف؛
- بحث؛
- فلترة؛
- pagination؛
- تعديل metadata؛
- public/private visibility؛
- منع حذف ملف مستخدم؛
- Media Picker للأغلفة؛
- دمجه في:
  - المنتجات؛
  - الدورات؛
  - الكتب؛
  - الورش؛
  - المقالات.

## نقاط القوة

- لم تعد الوسائط مجرد جدول شكلي.
- usage registry خطوة ممتازة.
- private assets لا تظهر للعامة بحسب RLS.
- validation للحجم وMIME أفضل من السابق.
- إعادة استخدام الصور أصبحت ممكنة.

## النواقص مقارنة بطلب التحكم الكامل

### 9.1 ما زال الرابط اليدوي موجودًا

الحقل يقول:

> «رابط خارجي أو اختاري من المكتبة»

أي أن التصميم لم يحسم الانتقال إلى asset IDs بصورة كاملة.

هذا لا يحقق شرط:

> لا أريد الاعتماد على روابط للصور والملفات الداخلية.

### 9.2 الـPicker محدود

- يعرض قائمة محمّلة مسبقًا.
- يقتطع أول 30 نتيجة.
- لا يرفع ملفًا جديدًا من داخله.
- لا يدعم assets الخاصة.
- لا يدعم اختيار عدة ملفات.
- لا يدعم البحث server-side داخل كامل المكتبة.

### 9.3 لا توجد folders

طلب المشروع صراحة:

- مجلدات؛
- tags؛
- bulk move؛
- archive/trash/restore.

الموجود tags فقط.

### 9.4 لا توجد دورة حياة للملف

الموجود حذف دائم.

ينقص:

- archived؛
- trashed؛
- restore؛
- deleted_at؛
- replace asset مع الحفاظ على المراجع.

### 9.5 رفع الفيديوهات الكبيرة غير مناسب للإنتاج

الرفع يقرأ الملف كاملًا في الذاكرة من خلال server action.

لفيديو 500MB، هذا يسبب خطرًا كبيرًا على:

- memory؛
- request limit؛
- timeout؛
- Vercel/serverless.

المطلوب:

- direct/resumable upload إلى Supabase؛
- signed upload authorization؛
- progress/retry.

### 9.6 metadata ناقصة

لا يوجد:

- checksum؛
- duration؛
- caption؛
- extension؛
- status؛
- focal point؛
- variants/thumbnails.

### 9.7 حذف Storage قبل السجل

إذا تم حذف الملف من Storage ثم فشل حذف صف قاعدة البيانات، سيبقى صف يشير إلى ملف مفقود.

الأفضل:

- soft-delete DB؛
- delete storage؛
- finalize؛
أو compensating transaction.

### 9.8 SVG

السماح بـSVG عام يحتاج:

- sanitation؛
- أو Content-Disposition؛
- أو سياسة CSP واضحة؛

لأن SVG يمكن أن يحتوي سلوكًا نشطًا في بعض طرق العرض.

## الحكم

Media Library جيدة كبداية عملية، لكنها تمثل حوالي 55–60% من المطلوب، وليست نظام أصول احترافيًا كاملًا.

---

# 10. Phase 3 — التجارة والطلبات والمدفوعات

## ما تم جيدًا

تم إنشاء RPCs ذرية من migrations 022–025 تشمل:

- إنشاء الطلب؛
- التسعير من قاعدة البيانات؛
- متغير المنتج؛
- رفع إثبات الدفع؛
- اعتماد الدفع؛
- رفض الدفع؛
- إلغاء الطلب؛
- انتهاء الطلب؛
- الاسترداد؛
- منح الوصول؛
- التكرار الآمن/idempotency.

تم استخدام:

- row locks؛
- advisory locks؛
- service-only execution؛
- audit logs.

هذا من أقوى أجزاء التعديل.

## نقاط قوة مهمة

- العميل لا يحدد السعر النهائي.
- variant price يعاد حسابه داخل DB.
- الطلب المكرر القريب يعاد استخدامه.
- اعتماد الدفع لا يعتمد على سلسلة client actions.
- منح الدورة/الكتاب/الورشة/الحزمة يتم داخل عملية واحدة أكثر تماسكًا.
- refund يحاول إزالة الوصول.
- tests المتوفرة اختبرت concurrency أساسيًا.

## ثغرات حرجة

### 10.1 سعة الورش غير محمية فعليًا

اعتماد الدفع يضيف تسجيل ورشة، لكنه لا:

- يقفل صف الورشة؛
- يتحقق من `seats_reserved < seats_total`؛
- يزيد `seats_reserved` بصورة ذرية؛
- ينقصه عند الإلغاء.

النتيجة:

> يمكن اعتماد أكثر من عدد المقاعد.

وهذا P0.

### 10.2 رابط اجتماع الورشة مكشوف على مستوى قاعدة البيانات

سياسة RLS تسمح للعامة بقراءة صف الورشة المنشورة كاملًا.

جدول الورشة يحتوي `meeting_url`.

حتى لو الواجهة العامة لا تختاره، مستخدم PostgREST يستطيع طلب العمود مباشرة لأن RLS على الصف لا يخفي الأعمدة.

المطلوب:

- نقل meeting URL إلى جدول خاص registrations/secure details؛
- أو column-level grants؛
- أو public view لا يحتوي الرابط ومنع select مباشر على الجدول.

### 10.3 وسيلة الدفع لا تتحقق من أنها مفعلة

RPC يقبل:

- instapay
- wallet
- bank_transfer

لكنه لا يقرأ إعدادات الأدمن ليتأكد أن الوسيلة enabled/configured.

عميل مباشر يمكنه اختيار تحويل بنكي حتى لو مخفي في الواجهة.

### 10.4 نظام الكوبونات محدود

لا يدعم:

- منتج محدد؛
- نوع منتج؛
- category؛
- حد أدنى للطلب؛
- first purchase؛
- exclusions؛
- stack policy؛
- customer segments.

### 10.5 تجاوز حد الكوبون عند الاعتماد

الحد يفحص عند checkout بناءً على redemptions المعتمدة.

لكن redemption يسجل عند approval.

يمكن إنشاء عدة طلبات pending بنفس آخر استخدام متاح، ثم اعتمادها لاحقًا لأن approval لا يعيد فحص max uses تحت lock.

### 10.6 العرض والكوبون يكدسان تلقائيًا

لا توجد سياسة:

- best only؛
- coupon + offer؛
- non-stackable.

### 10.7 المنتجات المجانية

منتج بسعر صفر لا يحصل على entitlement فوري من flow مستقل، بل يدخل مسار pending payment.

### 10.8 إعادة الشراء ثم refund

`content_access`, `book_access`, وworkshop registration تحتفظ غالبًا بمصدر order واحد وتعيد كتابة `order_id`.

إذا اشترت العميلة المنتج مرتين ثم استرجعت آخر طلب:

- قد يُسحب الوصول رغم وجود طلب مدفوع أقدم.

المطلوب entitlement grants ledger، لا overwrite لمصدر الوصول.

### 10.9 refund ليس نظامًا ماليًا كاملًا

لا يوجد جدول refunds متكامل يحفظ:

- المبلغ؛
- partial/full؛
- method؛
- reference؛
- processed_at؛
- actor؛
- reason؛
- balance after refund.

كما أن payment قد يظل `approved` بينما order يصبح refunded.

### 10.10 الإلغاء يترك payment pending

إلغاء order في awaiting_review لا يحول payment proof إلى cancelled/rejected بالضرورة.

### 10.11 حذف الوصول بدل إبطال موثق

بعض عمليات refund تحذف registrations/access، فتفقد التاريخ بدل:

- revoked_at؛
- revoke_reason؛
- source refund.

### 10.12 الباقات غير مدمجة بالكامل في fulfillment

شراء package product لا ينشئ بالضرورة subscription plan/credit ledger بشكل كامل.

## الحكم

Phase 3 تقدم قوي، لكنه ليس محاسبة تجارة جاهزة للإطلاق قبل إغلاق النقاط السابقة.

---

# 11. Phase 4 — المنتجات والكتالوج والإعدادات

## ما تم

- variants:
  - name؛
  - price؛
  - active.
- bundle composition.
- منع nested bundles.
- اختيار variant في checkout.
- pricing ذري للvariant.
- typed settings لوسائل الدفع وبعض الحقول.
- expiry hours.

## ما ينقص في محرر المنتج

لا يوجد نظام كامل لـ:

- draft/scheduled/published/archived؛
- preview؛
- publish scheduling؛
- trash/restore؛
- gallery؛
- categories/tags؛
- benefits؛
- target audience؛
- included content؛
- prerequisites؛
- FAQs؛
- related products؛
- cross-sells؛
- purchase limit؛
- inventory؛
- SEO؛
- social image؛
- terms؛
- price history؛
- duplicate product.

المحرر ما زال form مضغوطًا وليس صفحة تحرير احترافية.

## مشاكل التنفيذ

- hard delete ما زال موجودًا.
- revisions تُكتب لكن لا توجد واجهة history/restore.
- audit/revision errors أحيانًا لا توقف العملية.
- saveCatalogItem يقوم بعدة عمليات service-client وليس DB transaction واحدة.
- currency حقل text غير محكوم بقائمة.
- لا يوجد full detail page للمنتج في الأدمن.

## الإعدادات

Typed settings طُبقت فقط في جزء صغير من:

- Instapay؛
- wallet؛
- bank؛
- order expiry.

لم تُطبق على:

- brand؛
- owner profile؛
- contact/social؛
- SEO؛
- booking policy؛
- cancellation/refund؛
- legal؛
- notifications/email؛
- analytics/privacy؛
- maintenance.

ما زال raw JSON موجودًا لأجزاء أخرى.

## الحكم

Phase 4 مفيدة، لكنها لا تحقق “التحكم في كل تفصيلة” حتى الآن.

---

# 12. Phase 5 — الحجوزات والباقات والأرصدة

## ما تم

- إزالة قيد نافذة واحدة في اليوم.
- أكثر من نافذة availability في اليوم.
- trigger لمنع التداخل.
- subscription credit ledger.
- atomic adjustment.
- حجز جلسة برصيد باقة.
- migration 028 أضاف advisory lock لمفتاح idempotency.

## نقطة إيجابية

اكتشاف race condition في Phase 5 كان دليلًا جيدًا على أن الاختبار لم يكن شكليًا.

## المشاكل المتبقية

### 12.1 Phase 5 غير معتمدة في الوثيقة

`PROJECT_STATE.md` ما زال يقول:

> Phase 5: in progress

ولا يوجد تقرير بوابة نهائي بعد migration 028.

### 12.2 idempotency لا يتحقق من تطابق العملية

إذا أعيد استخدام نفس المفتاح مع:

- subscription أخرى؛
- delta مختلف؛
- booking مختلف؛
- reason مختلف؛

الدالة ترجع العملية القديمة بدل رفض mismatch.

المطلوب حفظ fingerprint للعملية ومقارنته.

### 12.3 unique index غير مفيد

`bookings_subscription_credit_unique(subscription_id, id)`

العمود `id` unique أصلًا، لذلك المؤشر لا يمنع شحن الحجز مرتين.

المطلوب unique على:

- ledger movement purpose + booking_id؛
أو
- booking_id where delta=-1.

### 12.4 credit ledger قابل للحذف

الـledger عليه:

`ON DELETE CASCADE`

والأدمن يملك hard delete للاشتراك.

هذا يعني أن سجل الرصيد “غير القابل للتغيير” يمكن أن يختفي كاملًا.

### 12.5 لا استرجاع تلقائي للرصيد

إلغاء حجز الباقة لا يعيد الرصيد تلقائيًا وفق السياسة.

### 12.6 لا ربط بين الباقة والخدمات

أي باقة نشطة فيها رصيد يمكن استخدامها لأي خدمة.

لا يوجد:

- eligible services؛
- service category؛
- restrictions.

### 12.7 لا سعة للباقات

max subscribers / capacity لا تُفرض ذريًا.

### 12.8 تفعيل اشتراك pending

لو أُنشئ pending ثم تحول إلى active لاحقًا، update status لا يمنحه opening credits تلقائيًا.

### 12.9 تغيير plan بعد وجود اشتراكات

تعديل `sessions_included` قد يجعل balances القديمة خارج المعنى دون versioning.

### 12.10 حذف الباقة والاشتراك

الواجهة تحتوي حذفًا مباشرًا.

المطلوب archive/cancel وليس hard delete.

### 12.11 auto-renew

الحقل موجود في backend دون بوابة recurring payment حقيقية، وقد يصنع معنى مضللًا.

### 12.12 إعدادات الموعد ناقصة

لا يوجد تحكم كامل في:

- slot interval؛
- buffer before/after؛
- minimum notice؛
- maximum horizon؛
- max bookings/day؛
- timezone per service؛
- multiple exception windows.

الحالي يحتوي قيمًا ثابتة في أجزاء من النظام، مثل 30 دقيقة وCairo.

### 12.13 admin reschedule

الأدمن يستطيع تعديل الوقت، لكن:

- لا يتحقق من كل قواعد availability؛
- لا يرسل notification كاملة؛
- لا يعيد/يستهلك الرصيد حسب التغيير؛
- لا يطبق cancellation policy.

### 12.14 لا Calendar احترافي

لا يوجد:

- day/week/month؛
- drag reschedule؛
- manual booking creation كاملة؛
- agenda/export.

### 12.15 تعارض نوافذ availability المتزامن

المنع يعتمد trigger يفحص الموجود.

عمليتا insert متزامنتان قد تمران قبل رؤية إحداهما للأخرى.

الأفضل:

- exclusion constraint على range؛
أو
- advisory lock أثناء تعديل قواعد الخدمة/اليوم.

## الحكم

Phase 5 حوالي نصف مكتملة، وتحتاج إغلاق دورة الحياة قبل الاعتماد.

---

# 13. Phase 6 — الدورات والكتب والورش

هذه المرحلة لم تُنفذ وفق الخطة الجديدة.

## دليل واضح

### 13.1 صفحة تفاصيل الورشة مكسورة

المسار:

`/workshops/[slug]`

ما زال يعرض قائمة الورش بدل ورشة محددة، ولا يستخدم slug بصورة صحيحة.

### 13.2 تنزيل الكتاب غير منفذ

زر “تحميل الكتاب” في لوحة العميلة يعيد إلى صفحة الكتاب العامة، ولا يصنع signed URL للملف المحمي.

### 13.3 الورش

لا يوجد نظام كامل لـ:

- registration admin؛
- waitlist؛
- attendance؛
- no-show؛
- resources؛
- recordings؛
- access window؛
- messaging؛
- seat atomicity.

### 13.4 الدورات

منشئ المنهج لا يزال أساسيًا:

- إضافة module/lesson؛
- لا edit/delete/reorder شامل؛
- لا drag-drop؛
- لا lesson types؛
- لا media picker داخل الدرس؛
- لا resources manager؛
- لا enrollment management متقدم.

وثيقة الأدمن نفسها ما زالت تقول:

> ارفعي الفيديو إلى Storage وضعي مساره في حقل الدرس.

وهذا يناقض طلب عدم التعامل بالمسارات والروابط يدويًا.

### 13.5 الكتب

لا يوجد:

- book versions؛
- editions؛
- PDF/EPUB upload selector؛
- current version؛
- download logs؛
- download policy؛
- version release notes.

## الحكم

هذه المرحلة Blocker مباشر لأي بيع حقيقي لكتاب أو دورة أو ورشة.

---

# 14. Phase 7 — CMS والهوية والبراند

لم تُنفذ.

## CMS

صفحة `/admin/pages` تقول صراحة:

> الصفحات الأساسية مبنية في الكود.

والتحكم الحالي يقتصر على:

- SEO title؛
- SEO description؛
- publish toggle.

لا يوجد:

- structured sections؛
- add/reorder/duplicate؛
- hide/show؛
- preview token؛
- schedule؛
- revision restore؛
- navigation/footer editor.

## الهوية

لم تتغير صفحات الموقع العامة في المقارنة الجديدة.

ما زال النظام يستخدم الهوية القديمة المختلطة:

- deep teal؛
- burgundy؛
- cobalt؛
- antique gold؛
- botanicals؛
- dark mode العام.

ولم تطبق الهوية المعتمدة:

- `#2F6173`
- `#5CB7B4`
- `#D8C3A5`
- `#EADBC2`
- `#F5F0E7`
- matte
- no burgundy/cobalt dominance
- no botanical ornament dominance.

## البراند

- الصفحة الرئيسية ما زالت تعتمد جملًا عامة.
- «باب الخروج» ليس مركز المنظومة.
- ملف هبة الشخصي غير مبني كنظام قابل للتحرير.
- لا يوجد حضور واضح للخبرة والمنهج والقصة.
- لا يوجد responsive logo asset system.

## الحكم

الجزء الذي يجعل المشروع “هبة الشريف” بدل منصة عامة لم يبدأ فعليًا في هذه النسخة.

---

# 15. Phase 8 — CRM والاتصالات والتقييمات

لم تُنفذ بالشكل المطلوب.

## العملاء

صفحة العملاء:

- تعرض آخر 200 حساب؛
- بحث؛
- إرسال notification.

لا يوجد Customer 360:

- overview؛
- orders؛
- payments؛
- bookings؛
- packages؛
- progress؛
- books؛
- workshops؛
- access؛
- notes/tags؛
- timeline.

## صندوق الرسائل

ينقص:

- assignment؛
- internal notes؛
- customer linking؛
- spam؛
- reply log؛
- retention workflow.

## البريد

لا يوجد:

- provider adapter؛
- email outbox؛
- templates؛
- delivery status؛
- unsubscribe token route؛
- double opt-in.

## التقييمات

الموجود moderation أساسي.

لا يوجد:

- customer review submission؛
- verified purchase flag؛
- owner response؛
- eligibility؛
- audit كامل.

## الحكم

الأدمن لا يزال لا يغني عن الرجوع اليدوي للجداول أو البحث في وحدات متعددة لإدارة عميلة واحدة.

---

# 16. Phase 9 — التقارير والتسويق

لم تُنفذ إلا كبداية قديمة.

## الموجود

- آخر 12 شهرًا.
- إجمالي الإيرادات.
- الإيراد حسب الشهر والنوع.
- course enrollments/progress.
- bookings by status.
- memberships by plan.
- report snapshots list.

## الناقص

- date range؛
- comparison period؛
- filters؛
- CSV export؛
- print؛
- gross/refunds/net؛
- pending payments؛
- AOV؛
- discounts؛
- coupon performance؛
- booking utilization؛
- cancellation/no-show rate؛
- package credit metrics؛
- book downloads؛
- workshop attendance؛
- LTV؛
- repeat buyers؛
- funnel؛
- snapshot view/export.

## ملاحظة تصميم

التقارير ما زالت تستخدم accent `cobalt` و`burgundy`، وهو دليل إضافي على أن الهوية الجديدة لم تُطبق.

## الحكم

التقارير تصلح كمؤشرات أولية، لا كلوحة قرار تجاري احترافية.

---

# 17. Phase 10 — الاختبارات والاستعداد للإطلاق

لم تُنفذ.

## الموجود

- Playwright specان.
- smoke tests للصفحات.
- mobile overflow.
- auth guards.
- بعض scripts الخاصة:
  - permissions؛
  - media؛
  - commerce؛
  - booking credits.

## المشكلة

`check:deploy` لا يشغل:

- `verify:permissions`
- `verify:media`
- `verify:commerce`
- `verify:booking-credits`
- Playwright

أي أن بوابة النشر الأساسية يمكن أن تمر دون اختبارات السلوك الحية.

## لا يوجد

- Vitest؛
- unit tests؛
- Zod tests؛
- Axe accessibility؛
- full paid journey؛
- refund journey؛
- free product journey؛
- workshop last-seat race؛
- duplicate purchase/refund؛
- customer cancellation؛
- package reversal؛
- CMS publish flow.

## أدوات audit

بعضها يفحص وجود كلمات أو ملفات، لا السلوك الحقيقي.

هي مفيدة كحاجز، لكن لا تكفي كدليل جودة.

## dependencies المعتمدة في الخطة لم تضف

لا يوجد حاليًا:

- zod؛
- react-hook-form؛
- dnd-kit؛
- TipTap؛
- sanitize-html؛
- vitest؛
- axe-core/playwright.

وهذا يفسر غياب:

- محرر محتوى غني؛
- reorder؛
- validation موحد؛
- اختبارات وحدات؛
- accessibility gate.

---

# 18. ملاحظات جودة الكود والصيانة

## جيد

- فصل بعض domains أفضل.
- RPCs الذرية خطوة معمارية صحيحة.
- migrations additive.
- TypeScript strict.
- audit logging موجود.
- no file deletion in refactor.

## يحتاج تحسين

- بعض المكونات/actions مكتوبة بصورة مضغوطة جدًا في أسطر طويلة، مما يصعب المراجعة.
- منطق صلاحيات مكرر.
- منطق settings متفرق.
- بعض عمليات service client متعددة الخطوات وليست transaction.
- errors أحيانًا تتحول إلى empty arrays/zero، فتخفي فشل قاعدة البيانات.
- fallback/demo behavior ما زال واسعًا وقد يخفي أخطاء الإنتاج.
- ملفات الوثائق تحمل ادعاءات من إصدارات مختلفة ومتعارضة.

---

# 19. هل الأدمن أصبح “تحكم كامل”؟

## أصبح يتحكم فعليًا في

- نشر/تعديل أساسي للمنتجات؛
- variants؛
- bundles؛
- الأسعار؛
- بعض وسائل الدفع؛
- availability windows؛
- memberships/subscriptions الأساسية؛
- media upload/picker للأغلفة؛
- payment approval/reject؛
- order transitions؛
- بعض المحتوى؛
- roles assignment؛
- notifications؛
- basic reports.

## لا يتحكم كاملًا في

- محتوى الصفحة الرئيسية والأقسام؛
- About Heba؛
- navigation/footer؛
- brand assets/settings؛
- SEO العالمي؛
- course curriculum كامل؛
- book files/versions؛
- workshop recordings/resources؛
- customer detail؛
- all policy settings؛
- cancellation/reschedule lifecycle؛
- package eligibility/rollover؛
- refund accounting؛
- email templates؛
- reports filters/export؛
- revisions restore؛
- archive/trash؛
- permissions matrix editing.

## الحكم

> الأدمن أصبح أقوى، لكنه ليس بعد Admin Operating System كاملًا.

---

# 20. قراري بشأن الإطلاق

## لا أنصح بالإطلاق المدفوع الآن

Blockers:

1. Service Role داخل ZIP المرسل.
2. Phase 5 غير مغلقة.
3. workshop capacity غير ذرية.
4. meeting URL قابل للتسرب من جدول الورش المنشورة.
5. صفحة workshop detail مكسورة.
6. تنزيل الكتاب غير موجود.
7. course/workshop protected delivery غير مكتمل.
8. refund/accounting محدود.
9. package cancellation لا يعيد الرصيد.
10. identity/CMS لم يطبقا.
11. لا يوجد full E2E حديث.
12. وثائق الحالة متعارضة.

## يمكن استخدامه في

- staging؛
- إدخال بيانات تجريبية؛
- مراجعة الأدمن؛
- اختبار الصلاحيات؛
- إكمال التطوير.

---

# 21. الأولويات التالية

## P0 — فورًا

1. Rotate Service Role.
2. استخدام release archive فقط.
3. توحيد Supabase public config helper.
4. إغلاق Phase 5 واختبار migration 028.
5. منع idempotency key mismatch.
6. جعل ledger غير قابل للحذف.
7. استرجاع رصيد الباقة عند الإلغاء.
8. eligibility للباقة والخدمة.
9. workshop capacity atomic.
10. حماية meeting URL.
11. recheck coupon limit عند approval.
12. منع disabled payment method.
13. إصلاح duplicate entitlement/refund source.
14. جعل `check:deploy` يشغل verify scripts وPlaywright.

## P1 — إكمال المنتج المدفوع

1. Phase 6 كاملة.
2. signed book download.
3. course protected resources.
4. workshop recordings/resources.
5. real workshop details.
6. registration/attendance/waitlist.
7. package fulfillment from paid order.
8. refund records/partial refunds.
9. customer cancel/reschedule.

## P1 — الأدمن الكامل

1. Full entity detail routes.
2. Lifecycle draft/scheduled/published/archived.
3. trash/restore.
4. revisions history/restore.
5. Customer 360.
6. typed settings كاملة.
7. media folders/resumable upload.
8. permissions editor.
9. professional calendar.
10. report ranges/export.

## P1 — البراند

1. تطبيق الألوان المعتمدة.
2. إزالة dominance للburgundy/cobalt/botanicals.
3. Structured CMS.
4. About Heba.
5. Bab Al-Khoroug primary journey.
6. responsive logo/media settings.
7. rewrite home structure and content.

## P2

- email provider/campaigns؛
- advanced analytics؛
- multi-language؛
- international payment؛
- printed-book fulfillment؛
- community/quizzes.

---

# 22. معايير قبول النسخة القادمة

لا تُقبل “Phase complete” إلا إذا:

- `PROJECT_STATE.md` محدث.
- `KNOWN_ISSUES.md` محدث.
- migration مطبقة live.
- verify script يجتاز.
- full `check:deploy` يجتاز.
- E2E المرتبط بالمرحلة يجتاز.
- browser desktop/mobile يجتاز.
- لا fake/demo content في production.
- لا hard delete لسجل مالي أو credit ledger.
- الأدمن يغيّر البيانات وتنعكس فعلًا على public/customer UI.
- لا يوجد manual storage path لوظيفة لها Media Picker.
- كل زر public له destination حقيقي.

---

# 23. الخلاصة

كودكس نفذ أساسًا مهمًا وصعبًا، خصوصًا:

- RBAC؛
- atomic commerce؛
- media registry؛
- variants/bundles؛
- booking windows؛
- credit ledger.

هذا عمل جيد ويستحق الاحتفاظ به.

لكن الخطأ سيكون اعتبار أن المشروع “اكتمل”.

التوصيف الأدق:

> **اكتمل جزء كبير من البنية الخلفية الحرجة، لكن المنتج التشغيلي والبراند والأدمن الكامل والتسليم والتقارير ما زالت في منتصف الطريق.**

المرحلة القادمة يجب ألا تبدأ بإضافات تجميلية، بل بإغلاق:

1. الأسرار؛
2. Phase 5؛
3. تجارة الورش والباقات؛
4. Phase 6؛
5. ثم CMS والبراند؛
6. ثم CRM والتقارير؛
7. ثم full launch gate.
