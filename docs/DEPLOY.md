# Deploy PoysaPath (Vercel + Supabase)

## 1. Supabase (production)

1. Use your existing project or create a new one at [supabase.com](https://supabase.com).
2. **SQL Editor** — run migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `002_backfill_existing_users.sql` (if needed)
   - `003_insight_cache.sql`
   - `004_budgets.sql`
3. **Authentication → URL configuration** — add your production URL, e.g. `https://your-app.vercel.app`.
4. **Authentication → Providers → Email** — turn on/off **Confirm email** as you prefer.
5. Copy **Project URL** and **anon/publishable key** for Vercel env.

## 2. Vercel

1. Push the repo to GitHub.
2. [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Framework: **Next.js** (auto-detected).
4. **Environment variables:**

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `GEMINI_API_KEY` | Google AI Studio key |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

5. Deploy.

## 3. After deploy

- Sign up / log in on production URL.
- Add an expense, test Quick parse, export CSV from Settings.
- Optional: configure [custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp) for auth emails.

## 4. Local vs production

Use separate Supabase projects or branches if you want isolated dev data. Never commit `.env.local`.
