# Supabase migrations

## Apply schema (required for Phase 1)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Run `migrations/001_initial_schema.sql` (full file).
3. If you already had test sign-ups before migrations, also run `002_backfill_existing_users.sql`.
4. For weekly AI insights, run `003_insight_cache.sql`.
5. For budgets, run `004_budgets.sql`.
6. For in-app notifications (broadcast + per-user read state), run `005_notifications.sql`.
7. For announcement messages, run each file in `migrations/notifications/` (start with `001_intro.sql`). See `migrations/notifications/README.md`.

## Verify

- **Table Editor:** `profiles`, `categories`, `expenses` exist.
- Sign up a new user → `profiles` row + 9 `categories` with that `user_id`.
- Add an expense in the app → row appears in `expenses`.

## Sign-up blocked: `over_email_send_rate_limit`

Supabase’s **built-in email** allows only a few auth emails per hour. Repeated sign-ups or password resets hit this quickly.

**Fastest fixes for local dev:**

1. **Dashboard → Authentication → Providers → Email** → turn **Confirm email** **OFF** → save. New sign-ups log in without a confirmation email (fewer sends).
2. **Dashboard → Authentication → Users → Add user** → create a test user with email + password → log in on `/login` (no email sent).
3. **Wait ~1 hour** for the limit to reset, then try again.
4. **Production / heavy dev:** [configure custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp) (Resend, SendGrid, etc.) for higher limits.

## Notifications (broadcast to all users)

After running `005_notifications.sql`, run files under `migrations/notifications/` (see that folder’s README). Example — intro message is in `notifications/001_intro.sql`.

Each user sees an announcement until they mark it read in the app (bell icon → **Mark as read**). Add new ones by copying `notifications/_template.sql`.

## RLS test (two accounts)

1. Create User A and User B.
2. As User A, add an expense.
3. In SQL Editor (service role) or as User B via API — User B must not see User A’s rows when using the anon key + User B JWT.
