# Supabase migrations

## Apply schema (required for Phase 1)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Run `migrations/001_initial_schema.sql` (full file).
3. If you already had test sign-ups before migrations, also run `002_backfill_existing_users.sql`.
4. For weekly AI insights, run `003_insight_cache.sql`.
5. For budgets, run `004_budgets.sql`.
6. For in-app notifications (broadcast + per-user read state), run `005_notifications.sql`.
7. For per-user encrypted Gemini API keys (BYOK), run `006_user_gemini_credentials.sql`.
8. For announcement messages, run each file in `migrations/notifications/` (start with `001_intro.sql`). See `migrations/notifications/README.md`.
9. For connections and shared money reminders, run `024_connections_shared_reminders.sql`.
10. For email search before sending a connection request, run `025_connection_search_by_email.sql`.
11. For connection-request bell notifications, run `026_connection_request_inbox.sql`.

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

## Super admin (read-only user stats)

After running `018_super_admin.sql`:

1. **Promote an existing user** in **SQL Editor** (service role). Replace the email:

```sql
UPDATE public.profiles
SET is_super_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com' LIMIT 1
);
```

To remove admin access:

```sql
UPDATE public.profiles
SET is_super_admin = false
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com' LIMIT 1
);
```

2. That user signs in and opens **Settings → Admin** (`/settings/admin`).

3. They can see:
   - Total registered users
   - Users who have signed in at least once (tracked when using the app)
   - Last sign-in time across all users (Asia/Dhaka)
   - A list of every user email and last visit (or “Never visited”)

After `020_admin_user_list.sql`, the user list is available on the Admin page.

Users cannot grant themselves `is_super_admin` from the app; only SQL (or service role) can change that flag.

## RLS test (two accounts)

1. Create User A and User B.
2. As User A, add an expense.
3. In SQL Editor (service role) or as User B via API — User B must not see User A’s rows when using the anon key + User B JWT.

### Connections (after `024_connections_shared_reminders.sql`)

1. As User A, open **Settings → Profile** and send a connection request to User B’s exact email.
2. As User B, see the request in the **bell** and on the Profile page — accept it.
3. User A creates a follow-up for User B in **Settings → Follow-Ups** — User B sees it in the bell and on the Follow-Ups page.
4. Either user removes the connection from Profile — open follow-ups are cancelled.
5. User B still cannot read User A’s expenses, income, or budgets (finance data stays private).
