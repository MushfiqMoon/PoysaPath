# Deploy PoysaPath (Vercel + Supabase)

## 1. Supabase (production)

1. Use your existing project or create a new one at [supabase.com](https://supabase.com).
2. **SQL Editor** — run migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `002_backfill_existing_users.sql` (if needed)
   - `003_insight_cache.sql`
   - `004_budgets.sql`
   - `005_notifications.sql`
   - `006_user_gemini_credentials.sql`
   - `007_goals_recurring.sql`
   - `008_recurring_payments_default_expense.sql`
   - `009_goal_contributions.sql`
   - `010_monthly_ai_reports.sql`
   - `011_monthly_ai_reports_one_per_month.sql`
   - `012_recurring_goal_link.sql`
   - `013_recurring_expense_goal_links.sql`
   - `014_recurring_alert_dismissals.sql`
   - `015_recurring_expense_date_backfill.sql`
   - `016_profile_avatar_url.sql`
   - `017_remove_legacy_payment_methods.sql`
   - `018_super_admin.sql`
   - `019` (if present in your project)
   - `020_admin_user_list.sql`
   - `021_admin_stats_trim.sql`
   - `022_incomes.sql`
3. **Authentication → URL configuration** (critical for Google sign-in):
   - **Site URL:** your public app URL only, e.g. `https://poysa-path.vercel.app` — not a Vercel team URL like `https://poysa-path-mushfiqur-rahmans-projects.vercel.app`.
   - **Redirect URLs:** add:
     - `https://poysa-path.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (local dev)
   - If Site URL or redirect URLs are wrong, Google sign-in lands on `/?code=` and never reaches the dashboard.
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
| `ENCRYPTION_SECRET` | Random string, 32+ characters (encrypts user Gemini keys in DB) |
| `NEXT_PUBLIC_APP_URL` | `https://poysa-path.vercel.app` (must match Supabase Site URL) |

5. Deploy.

## 3. After deploy

- Sign up / log in on production URL.
- Add an expense and income; each user adds their own Gemini API key in **Settings → AI** (free key from [Google AI Studio](https://aistudio.google.com/api-keys)), then test Quick parse, Money Coach, and Monthly report.
- Run notification SQL in Supabase **SQL Editor** (see `supabase/migrations/notifications/README.md`):
  - `001_intro.sql` through `003_goals_recurring_updates.sql` (if not already applied)
  - **`004_income_tracking.sql`** — income tracking and History announcement (bell icon)
- Optional: configure [custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp) for auth emails.

## 4. Local vs production

Use separate Supabase projects or branches if you want isolated dev data. Never commit `.env.local`.
