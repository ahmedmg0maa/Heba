# VERCEL DEPLOYMENT

## 1. Import the repo
1. Push the repo to GitHub (private is fine).
2. Vercel → **Add New Project** → import the repo.
3. Framework preset: **Next.js** (auto-detected). Root directory: repo root.

`vercel.json` already pins the install command:
```json
"installCommand": "corepack enable && corepack prepare pnpm@10.13.1 --activate && pnpm install --frozen-lockfile"
```
Node version comes from `package.json` `engines` (24.x) — no override needed.

## 2. Environment variables (Project → Settings → Environment Variables)
| Name | Value | Scope |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://azuvwkzpgtyxwxmvedmp.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key from Supabase → Settings → API | All |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (⚠ server-only secret) | All |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-domain>` | Production |

Never prefix the service key with `NEXT_PUBLIC_`. `SEED_DEMO` must NOT be set on Vercel.

## 3. Deploy
Click **Deploy**. The build runs `pnpm build`; middleware guards `/dashboard`, `/checkout`, `/admin`.

## 4. Domain
Add the custom domain in Vercel → Domains, then update:
- `NEXT_PUBLIC_SITE_URL` env var (redeploy),
- Supabase Auth **Site URL** + redirect allow-list.

## 5. Verify
- `/` renders with live data (sessions on `/booking` at ١٬٢٠٠/١٬٥٠٠ ج.م).
- `/auth/register` → confirmation email arrives → login lands on `/dashboard`.
- `/admin` redirects non-admins away; the owner account reaches `/admin/overview`.
