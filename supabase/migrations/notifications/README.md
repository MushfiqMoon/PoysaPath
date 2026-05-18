# Notification announcements

Broadcast messages shown in the app bell until each user taps **Mark as read**.

**Prerequisite:** Run `../005_notifications.sql` once (creates tables + RLS).

## Files (run in order)

| File | Title | Description |
|------|-------|-------------|
| `001_intro.sql` | Notifications | Intro: new features will appear here |
| `002_may_2026_updates.sql` | What's new today | Recent tap-to-edit, BYOK Gemini key in Settings |

## Add a new notification

1. Copy `_template.sql` to `00N_short_name.sql` (next number).
2. Edit `title`, `body`, and optional `kind` (`feature`, `system`, …).
3. Run the file in Supabase **SQL Editor**.
4. Add a row to the table above in this README.

Each file is idempotent (`WHERE NOT EXISTS`) — safe to re-run.

## Quick insert (alternative)

```sql
SELECT public.create_broadcast_notification(
  'Your title',
  'Your message body.',
  'feature'
);
```
