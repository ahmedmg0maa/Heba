# دليل نشر Cloudflare Staging — 2026-08-26

## الحكم

**`STAGING BLOCKED`**

تم إنشاء ونشر Worker تجريبي مستقل وآمن على `workers.dev`، وأنشئ لاحقًا مشروع Supabase Staging مستقل بحجم Nano المجاني وبلا بيانات. لكن قبول Staging الوظيفي غير ممكن بعد لأن schema/RBAC وبيانات اتصال التطبيق وAuth redirects لم تُجهز بعد. لم يُستخدم Supabase Production، ولم تتغير DNS أو Nameservers أو النطاق الأساسي أو أي مورد Production.

> تحديث مصدر محلي في 2026-08-28: أضيفت migrations 048–065 بعد العقد الخارجي 044–047. آخرها 065 يغلق admission لتنزيل موارد الدورات والورش وتسجيلاتها خلف الاستحقاق والحد والتدقيق، ويحافظ على الأجسام خارج Worker عبر Signed URLs قصيرة، واجتاز Next وWorkers **70/70**. لا يغيّر هذا حكم Staging: لم تُطبق 065 أو أي migration أخرى على مزود، وتبقى جميع أدلة SQL/RLS/Storage/persistence الحية `unverified` حتى بوابة الاستعادة والترحيل المفوضة.

## هوية النشر

- مستودع المصدر: `https://github.com/ahmedmg0maa/Heba`
- الفرع: `codex/cloudflare-compatibility-spike`
- commit التطبيق المنشور: `6be490a7912d685e2c090600e5a4eb5dfae97ed2`
- Worker: `heba-elsherif-platform-staging`
- رابط Staging: `https://heba-elsherif-platform-staging.heba-elsherif-platform.workers.dev`
- بيئة Worker: `staging`
- compatibility date: `2026-08-26`
- compatibility flag: `nodejs_compat`
- bindings الفعلية: `ASSETS` فقط. لا توجد D1 أو KV أو R2 أو Queue أو قاعدة بيانات Cloudflare.

## أوامر البناء والنشر الفعلية

```text
pnpm build:cloudflare:staging:isolated
wrangler deploy --config dist/server/wrangler.json --keep-vars
```

ويغلفها الأمر المصدرِي `pnpm deploy:cloudflare:staging`. البناء المعزول لا ينسخ أي `.env*`، ويمرر `CLOUDFLARE_ENV=staging` صراحةً لإنتاج اسم Worker المنفصل. لا يُستخدم `vinext-cloudflare deploy` في Staging لأن مساره يعيد البناء وقد يحمّل `.env`؛ يبقى منطق Vinext/Vite نفسه هو الذي ينتج الـWorker.

## متغيرات البيئة المطلوبة — أسماء فقط

| التصنيف | الأسماء / السياسة |
| --- | --- |
| Public variable | `HEBA_DEPLOYMENT_ENV=staging` و`NEXT_PUBLIC_SITE_URL` و`SEED_DEMO=false` |
| Supabase client configuration | `NEXT_PUBLIC_SUPABASE_URL` مع **واحد فقط** من `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` أو `NEXT_PUBLIC_SUPABASE_ANON_KEY`، وكلها تخص مشروع Staging منفصلًا |
| Cloudflare secret | `STAGING_ACCESS_USER` و`STAGING_ACCESS_PASSWORD` |
| Server-only secret/configuration | واحد فقط من `SUPABASE_SECRET_KEY` أو `SUPABASE_SERVICE_ROLE_KEY`، و`ADMIN_LOGIN_EMAIL` و`PROTECTED_UPLOAD_SCAN_URL` و`PROTECTED_UPLOAD_SCAN_TOKEN` عند تشغيل الفحص |
| Staging value | عنوان Worker أعلاه، ومشروع Supabase Staging وResend/Sentry الخاصان بـStaging فقط |
| Production value | النطاق الأساسي ومشروع Supabase Production وأسراره؛ لا تُدخل ولا تُستخدم في هذا Worker |

تمت إضافة سرّي Basic Auth المطلوبين لاحقًا إلى Worker عبر مطالبة Wrangler التفاعلية. فحص الأسماء فقط يؤكد وجودهما، ولم تُقرأ أو تُعرض أي قيمة سرية.

## الأدلة والاختبارات

| الفحص | النتيجة |
| --- | --- |
| `wrangler whoami` عبر OAuth | ناجح؛ لم يُعرض معرّف الحساب أو أي اعتماد |
| بناء Worker المعزول لـStaging | ناجح؛ 60 مسارًا وWorker منفصل باسم Staging |
| `wrangler deploy --dry-run` | ناجح |
| نشر Workers.dev | ناجح؛ startup time بلغ 23ms عند النشر النهائي |
| `pnpm type-check` | ناجح |
| `pnpm lint` | ناجح |
| `pnpm test:e2e:cloudflare` | **46/46 ناجح** محليًا ضد Wrangler مستقل، مكتبي ومحمول (يشمل RTL وPixel 7/390px) |
| الصفحة الرئيسية، login، admin وrobots على الرابط الحي بلا اعتماد | `401` متوقع مع Basic Auth، مع `X-Robots-Tag: noindex` وCSP وHSTS و`nosniff` |
| المسارات الحية بعد اعتماد Basic Auth | 11 مسارًا عامًا ومسار login أعادت `200`؛ `/admin` أعاد `307` إلى حاجز المصادقة المتوقع؛ جميعها احتفظت بـCSP و`noindex` |
| مسار source map غير موجود على الرابط الحي | `404`؛ وناتج النشر المحلي يحتوي 0 ملفات `.map` |
| Worker error tail | لا توجد أحداث خطأ مرصودة في نافذة المراقبة القصيرة؛ لا يُعامل ذلك كدليل مراقبة قبول |

## ما لم يُتحقق منه ولماذا

- العرض البصري الحي RTL عند 390px وdesktop، والصور والملفات: **unverified**؛ صحة الاستجابة HTTP ثبتت بعد Basic Auth، لكن لا يوجد بعد اختبار متصفح حي أو Storage Staging.
- Auth redirects، جلسات HttpOnly، MFA وRBAC: **unverified**؛ مشروع Supabase Staging مستقل موجود، لكنه لم يتلق إعداد redirects أو schema/RBAC أو بيانات اتصال التطبيق بعد.
- Booking E2E، الدفع اليدوي، منع الإثبات المكرر، الاستحقاقات، الإدارة والـaudit: **unverified**؛ لا يجوز تنفيذ كتابة على Supabase Production، وStaging ما زال فارغًا إلى أن تنجح بوابة Backup/Restore والمigrations المعتمدة.
- Resend وSentry وStorage والتسليم المحمي: **unverified**؛ إعدادات Staging الخارجية غير مهيأة.
- GitHub Workers Builds: **unverified / awaiting owner**؛ النشر اليدوي عبر OAuth نجح، أما ربط Cloudflare Dashboard بالمستودع `ahmedmg0maa/Heba` واختيار فرع `codex/cloudflare-compatibility-spike` فهو إجراء Dashboard خارجي لم يُنفذ من هذا المسار. لا يوجد نشر تلقائي لـ`main`.

## المانع الخارجي الوحيد

**تهيئة قبول Staging المستقلة في Cloudflare/Supabase.**

تتكون من ربط Workers Builds بالمستودع والفرع التجريبي، ثم إضافة متغيرات مشروع Supabase Staging من Cloudflare Dashboard فقط، وإضافة رابط Worker إلى Auth redirect URLs في مشروع Staging. لا تُرسل القيم في المحادثة. بعد نجاح Backup/Restore Drill وتفويض Staging migrations، تطبق الـschema بالترتيب ثم ينشأ حساب Admin الحقيقي ويمنح دورًا محفوظًا ومدققًا؛ عندها فقط يمكن اختبار الدخول والكتابة وE2E الحي.

## بوابات Production المتبقية

لا يزال Production محظورًا حتى ينجح قبول Staging، واعتماد المحتوى والقانونيات، ونسخة احتياطية منطقية حديثة مع Restore Drill، وتفويض مستقل للمigrations Production. لم تُطبّق migrations 044–047 على أي بيئة في هذه المرحلة.
