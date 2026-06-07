# PoysaPath — Project Plan

> **Status:** Phases 0–4 shipped. Migrations `001`–`022` in Supabase. Deploy: [DEPLOY.md](./DEPLOY.md).  
> **Last updated:** June 7, 2026

| Doc | Purpose |
|-----|---------|
| [planning.md](./planning.md) | Product, stack, security, Gemini, routes |
| [planning-db.md](./planning-db.md) | Schema, RLS, migrations |
| [planning-design.md](./planning-design.md) | UX flows and screens |
| [post-deployment-changes/](./post-deployment-changes/) | Post-launch backlog |
| [gptfeature-suggestion.md](./gptfeature-suggestion.md) | 30-feature wishlist vs shipped inventory |

---

## Current state

- Multi-user expense tracker in **BDT**, timezone **Asia/Dhaka**, mobile-first web app.
- Auth: email/password + Google OAuth, protected `(app)/*`, RLS on all user tables.
- **Gemini:** Quick parse on `/add` (expense tab), Money Coach on `/dashboard`, and monthly report in Settings.
- Core: expenses CRUD, **income CRUD** (`/history` with Expense \| Income tabs, `/add` income tab), expense + income categories, budgets, financial goals, recurring money reminders, CSV export API (hidden in Settings UI), notifications (`005`).
- Dashboard: **Income / Expenses / Saved** this month (`022_incomes.sql`).
- **Not v1:** shared households, OCR, chat assistant, recurring salary, income AI parse.

---

## 1. Product

**PoysaPath** — personal cash-flow tracker (expenses + income). Each user has a private account; no cross-user data access.

| Item | Value |
|------|--------|
| Currency | BDT (৳) |
| UI language | English |
| Input (Quick parse) | English, Bangla, Banglish |

**Non-goals (v1):** shared ledgers, expense splitting, multi-currency, native apps, receipt OCR.

---

## 2. Stack

| Layer | Choice |
|-------|--------|
| App | Next.js App Router, TypeScript, Tailwind |
| Data | Supabase (PostgreSQL + Auth) |
| AI | Google Gemini `gemini-2.5-flash` via `@google/genai` (server only) |
| Host | Vercel |

**Layout:** `app/(app)/` pages, `app/api/` routes, `components/`, `lib/`, `supabase/migrations/`.

---

## 3. Security (canonical)

Full RLS detail: [planning-db.md](./planning-db.md).

| Rule | How |
|------|-----|
| Auth required for app data | Middleware + session; API routes return 401 if no user |
| Never trust client `user_id` | Server actions set `user_id` from session |
| Gemini server-only | `GEMINI_API_KEY` in env; [`requireApiUser`](../lib/gemini/auth.ts) on AI routes |
| RLS is the isolation boundary | Every user row: `user_id = auth.uid()` |
| Gemini data minimization | Parse: one text + category names; Insight: category totals only |
| No secrets in browser | Only `NEXT_PUBLIC_SUPABASE_*` |
| CSV export | Auth required; query scoped to session user (defense in depth + RLS) |

### Known gaps and mitigations

| Gap | Mitigation |
|-----|------------|
| In-memory Gemini rate limit (~40/hr) | Resets per serverless instance; backlog: DB/Redis counter |
| RLS not automated in CI | **P0:** manual two-user test before prod (`supabase/README.md`) |
| Quick parse sends description to Google | Disclosed in UI + `/privacy`; Manual tab does not call AI |
| CSV route live but not linked in UI | Auth + own data only; see post-deploy docs |
| Email verification optional | P1 backlog in feature-improvements |

---

## 4. Gemini integration

| Feature | UI | API |
|---------|-----|-----|
| Quick parse | `/add` → Quick tab → Parse → preview → Save | `POST /api/gemini/parse-expense` |
| Money Coach | `/dashboard` coaching card (cached) | `POST /api/gemini/weekly-insight` |
| Monthly report | `/settings/reports` → Generate report | `POST /api/gemini/monthly-report` |

Both AI features include **income + spending** context and **savings rate** when income is logged (`lib/gemini/cash-flow.ts`).

- Structured JSON responses (Zod). Preview before save on Quick tab.
- On 429 / failure: user message + manual entry still works.
- Rate limit: ~40 calls/user/hour (in-memory). Money Coach text is cached per user/day in `insight_cache`.

**Future AI ideas:** chat over aggregates, OCR, and smarter categorization from reviewed edits.

---

## 5. Multi-user model

- **v1:** private accounts only (`user_id` on all owned rows).
- Sign-up trigger: `profiles` + copy of 9 default categories per user.
- **Future:** `workspaces` / household sharing — do not add until planned.

---

## 6. Routes and screens

| Route | Purpose |
|-------|---------|
| `/` | Landing (public) |
| `/login`, `/signup`, `/forgot-password` | Auth |
| `/dashboard` | Today/month totals, Money Coach, goals, recurring reminders, recent |
| `/add` | Expense \| Income; expense has Quick (AI) \| Manual tabs |
| `/history` | Expense \| Income tabs; list, filter, drill-down |
| `/expenses/[id]/edit`, `/incomes/[id]/edit` | Edit expense or income |
| `/settings`, `/settings/categories`, `/settings/budget`, `/settings/goals`, `/settings/recurring`, `/settings/reports`, `/settings/announcements` | Manage (`/settings/notification-history` redirects here) |
| `/privacy`, `/terms` | Legal |

**API:** `POST /api/gemini/parse-expense`, `POST /api/gemini/weekly-insight`, `POST /api/gemini/monthly-report`, `GET /api/export/csv` (optional `?from=` / `?to=` dates).

---

## 7. Environment

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=
```

Optional/future only: `SUPABASE_SERVICE_ROLE_KEY` (not used by current app code).

Setup: Supabase project → run migrations → [Google AI Studio](https://aistudio.google.com/apikey) → `.env.local`.

---

## 8. Shipped vs backlog

### Shipped (Phases 0–4)

- Auth, middleware, landing, expense + income CRUD, dashboard, categories, budgets
- `/history` (Expense | Income tabs); `/expenses` list removed
- Dashboard **Income / Expenses / Saved** this month (`022_incomes.sql`)
- Financial goals and recurring money reminders
- Gemini: parse-expense + Money Coach + monthly report (income + savings rate context)
- Per-user rate limit, insight refresh cooldown
- CSV export API, privacy/terms, notifications migration

### Phase 4 backlog

Household sharing, Google OAuth, email verification enforcement, account deletion, chat assistant, Bangla UI, PWA offline, persistent rate limits, RLS automation.

---

## 9. Risks

| Risk | Mitigation |
|------|------------|
| Gemini quota / 429 | Manual form; cache insight; rate limit |
| Wrong parse | Preview before save |
| API key leak | Server-only Gemini; no key in client |
| RLS misconfiguration | Mandatory two-user test |
| Cross-user API abuse | Session `auth.uid()`; never body `userId` |

---

*Deploy: [DEPLOY.md](./DEPLOY.md). Schema: [planning-db.md](./planning-db.md). UX: [planning-design.md](./planning-design.md).*
