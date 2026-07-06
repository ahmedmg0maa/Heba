# SUPABASE SETUP

## 1. Create the project
1. Create a project at https://supabase.com/dashboard (region close to Egypt, e.g. `eu-central-1`).
2. Copy from Project Settings → API: `Project URL`, `anon` key, `service_role` key.
3. Fill `.env.local` from `.env.example` (service role key stays server-only, never `NEXT_PUBLIC_`).

## 2. Apply migrations
With the Supabase CLI linked to the project:
```bash
supabase link --project-ref <ref>
supabase db push          # applies supabase/migrations/ in order (001 → 010)
```
Or paste each file from `supabase/migrations/` into the SQL editor **in numeric order**.

## 3. Storage
Migration `010_storage.sql` creates the buckets (`public-media`, `avatars`, `protected-books`,
`course-videos`, `course-resources`, `payment-proofs`, `workshop-recordings`) and their policies.
Protected buckets are served exclusively through short-lived signed URLs generated server-side
after a `content_access` check.

## 4. Auth
- Email/password is used. Enable "Confirm email" in Auth → Providers → Email.
- Set Site URL (Auth → URL Configuration) to the deployed domain; add `http://localhost:3000` to redirect allow-list.
- `handle_new_user` trigger auto-creates a `profiles` row on signup.

## 5. First admin (owner)
After signing up with the owner's email, run in SQL editor:
```sql
insert into public.admin_roles (user_id, role)
select id, 'owner' from auth.users where email = 'OWNER_EMAIL_HERE';
```

## 6. Demo data (never in production)
```bash
SEED_DEMO=true DATABASE_URL="postgres://..." pnpm db:seed
```
The seeder refuses to run without `SEED_DEMO=true` and blocks remote URLs unless `SEED_ALLOW_REMOTE=true`.
