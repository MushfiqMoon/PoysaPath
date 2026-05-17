# Feature improvements (post-deployment)

> New or expanded **product capabilities** after the first production deploy.  
> **Last updated:** May 17, 2026

Pair with [ui-suggestions.md](./ui-suggestions.md) when a feature needs both logic and interface work.

---

## How to use this doc

| Priority | Meaning |
|----------|---------|
| **P0** | Security, data integrity, or broken core flow |
| **P1** | High value for retention or trust |
| **P2** | Nice-to-have / experimental |

Status: `[ ]` open · `[~]` in progress · `[x]` done

---

## Auth & account

- [ ] **P1 — Email verification** — Enforce or nudge verify in Supabase Auth settings.
- [ ] **P1 — Google OAuth** — Sign in with Google ([planning.md §5.2](./../planning.md)).
- [ ] **P1 — Delete account** — Cascade delete profile, categories, expenses, budgets, insight cache; sign out.
- [ ] **P2 — Change password** — In-app flow using Supabase reset / update password.

## Expenses & data

- [~] **P1 — Date range CSV export** — **Hidden from Settings UI** (May 2026). Backend remains at `GET /api/export/csv` (optional `?from=` / `?to=`). Re-enable by restoring the Data section in `components/settings-panel.tsx` when users need spreadsheet backup.
- [ ] **P1 — Recurring expenses** — Optional template (e.g. rent monthly) — needs schema + UI.
- [ ] **P2 — Income tracking** — Separate type or table; out of v1 scope.
- [ ] **P2 — Receipt upload / OCR** — Photo → amount + merchant via vision model.
- [ ] **P2 — Multi-wallet** — Cash vs bKash balances per “account”.

## Categories & budgets

- [x] **P1 — Reassign on category delete** — Move expenses to another category before delete.
- [ ] **P2 — Category rename** — Edit name/icon for seeded defaults.
- [ ] **P2 — Budget alerts** — Notify when category spend crosses 80% / 100% of budget.
- [ ] **P2 — Copy budget from last month** — One-tap duplicate budgets.

## Gemini & AI

- [x] **P1 — Per-user rate limits** — `lib/gemini/rate-limit.ts` caps `/api/gemini/*` per user per hour.
- [x] **P1 — Insight refresh control** — 24h cooldown on manual refresh; respects `insight_cache`.
- [ ] **P2 — Chat assistant** — Q&A over user’s aggregates (no raw export of all rows to client).
- [ ] **P2 — Smarter categorization** — Learn from user overrides (local rules or few-shot in prompt).

## Multi-user & sharing (Phase 4)

- [ ] **P2 — Household / shared workspace** — Optional ledger shared by invite ([planning.md Phase 4](./../planning.md)).
- [ ] **P2 — Split expenses** — Between members — out of v1 scope.

## Platform & ops

- [ ] **P0 — RLS regression tests** — Two test users; automated or documented manual script.
- [ ] **P1 — Error monitoring** — Sentry or similar on API routes and client errors.
- [ ] **P1 — Analytics (privacy-safe)** — Page views, add-expense success, Gemini fallback rate.
- [ ] **P2 — PWA / offline** — Service worker, queue writes when back online.
- [ ] **P2 — Admin dashboard** — Support view of users (not in v1; careful with privacy).

## Infrastructure & cost

- [ ] **P1 — Gemini quota monitoring** — Log 429s; dashboard for API usage.
- [ ] **P2 — Paid tier** — Subscription to cover Gemini / hosting for heavy users.
- [ ] **P2 — Edge caching** — Cache weekly insight responses per user.

## Compliance & trust

- [x] **P1 — Privacy policy + terms** — `/privacy`, `/terms` linked from Settings.
- [ ] **P1 — Data export (full)** — JSON export of all user tables (GDPR-style self-service).
- [ ] **P2 — Audit log** — Who changed what (lower priority for personal app).

---

## Hidden / deferred in UI

### CSV export (Settings)

| Item | Detail |
|------|--------|
| **Why hidden** | Low day-to-day need; keeps Settings focused on profile and legal links. |
| **Still works?** | Yes — `app/api/export/csv/route.ts` is live for authenticated users. Not linked in the app UI. |
| **How to test** | While logged in, open `/api/export/csv` in the browser (or call with optional `?from=YYYY-MM-DD&to=YYYY-MM-DD`). |
| **Re-enable** | Add back the Data block in `components/settings-panel.tsx` (see git history). |
| **Related** | Full JSON export remains a separate P1 backlog item below. |

---

## Already shipped (v1–3) — do not re-plan here

- Manual + Gemini add expense, weekly insight, category management, budgets, CSV export API (Settings UI hidden post-deploy), profile display name, multi-user RLS.

---

## Notes / feedback from users

| Date | Note |
|------|------|
| | |

---

## Related docs

| Document | Purpose |
|----------|---------|
| [ui-suggestions.md](./ui-suggestions.md) | Visual and interaction polish |
| [../planning.md](../planning.md) | Phase 4 backlog source |
| [../planning-db.md](../planning-db.md) | Schema impact for new features |
| [../DEPLOY.md](../DEPLOY.md) | Production environment |
