# Feature improvements (post-deployment)

> **Last updated:** May 26, 2026  
> Product baseline: [planning.md](../planning.md) · Security: [planning.md §3](../planning.md#3-security-canonical)

| Priority | Meaning |
|----------|---------|
| **P0** | Security, data integrity, broken core flow |
| **P1** | High value for retention or trust |
| **P2** | Nice-to-have |

Status: `[ ]` open · `[~]` in progress · `[x]` done

---

## Already shipped (do not re-plan)

- Auth, RLS schema, expense CRUD, categories, budgets
- **Gemini:** Quick parse (`/add`), Money Coach (`/dashboard`), monthly report (`/settings/reports`); Manual add has no AI
- **BYOK:** Per-user encrypted Gemini API key in Settings → AI (no shared `GEMINI_API_KEY`)
- Per-user Gemini rate limit (~40/hr, in-memory), insight cache + refresh cooldown
- Goals with contribution history, spend-less challenges, recurring money reminders, CSV export API (Settings UI hidden), privacy/terms, notifications (`005`)
- **Income tracking (Phase A):** manual income CRUD, `/history` (Expense | Income tabs), dashboard Income/Expenses/Saved (`022_incomes.sql`)
- **Income AI context (Phase A+):** Money Coach and monthly report fetch incomes, compute savings rate, and include `cashFlowSummary` in reports

---

## Security & ops

- [ ] **P0 — RLS regression tests** — Two test users; no cross-read (see `supabase/README.md`).
- [ ] **P1 — Persistent Gemini rate limits** — Replace in-memory map (serverless resets per instance).
- [ ] **P1 — Error monitoring** — Sentry or similar on API + client.
- [ ] **P1 — Gemini quota monitoring** — Log 429s; usage dashboard.
- [ ] **P1 — Analytics (privacy-safe)** — Add success, Gemini fallback rate (no PII in events).

---

## Auth & account

- [ ] **P1 — Email verification** — Enforce or nudge in Supabase Auth.
- [ ] **P1 — Google OAuth**
- [ ] **P1 — Delete account** — Cascade user data; sign out.
- [ ] **P2 — Change password** — In-app flow.

---

## Expenses & data

- [~] **P1 — CSV export** — API live at `GET /api/export/csv`; UI hidden in Settings. Re-enable in `settings-panel.tsx` when needed.
- [ ] **P1 — Full JSON export** — GDPR-style self-service.
- [x] **P1 — Recurring expenses** — Templates, reminders, and record-as-expense flow via `007_goals_recurring.sql`; default expense handling via `008_recurring_payments_default_expense.sql`.
- [x] **P1 — Financial goals** — Savings, emergency fund, debt payoff, spend-less category challenges, additive contribution history, and safe complete/delete confirmations.
- [x] **P2 — Income tracking (Phase A)** — Manual income, `/history`, dashboard net flow, income categories. Deferred: recurring salary, AI parse.
- [x] **P2 — Income AI context (Phase A+)** — Monthly report + Money Coach include income totals and savings rate (`lib/gemini/cash-flow.ts`).
- [ ] **P2 — Receipt OCR, multi-wallet**

---

## Categories & budgets

- [x] **P1 — Reassign on category delete**
- [ ] **P2 — Category rename for defaults, budget alerts, copy budget from last month**

---

## Gemini & AI

- [x] **P1 — Per-user encrypted API keys (BYOK)** — Settings → AI; `006_user_gemini_credentials.sql`
- [x] **P1 — Per-user rate limits** — `lib/gemini/rate-limit.ts`
- [x] **P1 — Insight refresh control** — 1h cooldown + `insight_cache`
- [x] **P1 — Money Coach** — Dashboard coaching card with recent-vs-previous income, spending, and budget context.
- [x] **P1 — Monthly AI report** — Income, spending, savings rate, wins, problem areas, category changes, and next-month plan.
- [ ] **P2 — Chat assistant** — Q&A on aggregates only
- [ ] **P2 — Smarter categorization** — Learn from user overrides (future; not manual blur)

---

## Multi-user (Phase 4)

- [ ] **P2 — Household / shared workspace**
- [ ] **P2 — Split expenses**

---

## Platform

- [ ] **P2 — PWA / offline, admin dashboard, paid tier**

---

## Hidden: CSV export

| Item | Detail |
|------|--------|
| Why hidden | Low daily need; keeps Settings simple |
| Access | Authenticated `GET /api/export/csv` (?from= / ?to= optional) |
| Security | Session required; rows scoped to `auth.uid()` |

---

## User feedback

| Date | Note |
|------|------|
| 2026-05-26 | Added goal contribution history, collapsed goal panels, safer confirmations, recurring reminder polish, and announcement `003_goals_recurring_updates.sql`. |
| 2026-06-07 | Income tracking (Phase A + A+), `/history`, dashboard net flow, docs/landing refresh, and announcement `004_income_tracking.sql`. |

---

## Related

- [ui-suggestions.md](./ui-suggestions.md)
- [../planning-db.md](../planning-db.md)
- [../DEPLOY.md](../DEPLOY.md)
