# PoysaPath — Project Plan

> **Status:** Phase 3 complete — run migrations `001`–`004` in Supabase. See [DEPLOY.md](./DEPLOY.md) for Vercel.  
> **Last updated:** May 17, 2026

### Related planning docs

| Document | Purpose |
|----------|---------|
| [planning.md](./planning.md) | Product scope, stack, features, build phases |
| [planning-db.md](./planning-db.md) | Database ER diagram, tables, RLS, migrations |
| [planning-design.md](./planning-design.md) | User flows, wireframes, navigation, UI tokens |

---

## 1. Overview

**PoysaPath** is a **multi-user, daily expense tracker**. Anyone can **sign up**, log spending in **BDT (৳)**, view their own totals by day and month, and use **Google Gemini (Free API)** for fast entry, categorization, and short insights. Each account is **fully private** — users never see each other’s data.

| Attribute | Decision |
|-----------|----------|
| **Name** | **PoysaPath** — *path of your poysa (money)* |
| **Tagline** | *Track every taka, every day.* (optional marketing copy) |
| **Audience** | **Multiple users** — each with their own account and isolated data |
| **Platform** | Web app, **mobile-first** responsive UI |
| **Primary currency** | BDT (Bangladeshi Taka) |
| **Timezone** | `Asia/Dhaka` (per-user; fixed for v1) |

---

## 2. Goals

### Primary goals
- Support **many registered users**, each managing their own expenses securely.
- Log daily expenses quickly (especially on mobile).
- See where money goes (by category and time).
- Reduce friction via Gemini: natural-language entry, auto-categories, brief summaries.

### Non-goals (v1)
- **Shared households / teams** (one budget, multiple members viewing the same expenses)
- **Expense splitting** between users (e.g. “Ali owes ৳200”)
- Multi-currency
- Receipt OCR, chat assistant, recurring detection (deferred to Phase 2+)
- Native mobile apps (responsive web only)

---

## 3. Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| **Framework** | Next.js (App Router) | TypeScript, API routes for Gemini |
| **Styling** | Tailwind CSS | Mobile-first, consistent spacing/typography |
| **Database** | Supabase (PostgreSQL) | Auth + Row Level Security |
| **Auth** | Supabase Auth | **Required** for all app features; email/password (v1); Google OAuth (Phase 2) |
| **AI** | Gemini Free API via `@google/genai` | Server-side only; model: `gemini-2.5-flash` |
| **Hosting** | Vercel (recommended) | Fits Next.js; env vars for keys |

### Security principles
- `GEMINI_API_KEY` and Supabase **service role** never exposed to the browser.
- Gemini calls only from **Next.js Route Handlers** (`app/api/...`).
- Supabase **RLS** on every user-owned table: `user_id = auth.uid()` — **no cross-user access**.
- API routes always resolve the session from cookies; never trust `user_id` from the client body.
- Gemini requests are scoped to the **logged-in user’s** categories and aggregates only.

---

## 3.1 Multi-user model

### What “multiple users” means in v1

| Model | v1 | Description |
|-------|-----|-------------|
| **Multi-tenant (private accounts)** | ✅ Yes | User A and User B each sign up; each sees only their own expenses, categories, budgets, and insights. |
| **Shared workspace / household** | ❌ No | Family or roommates sharing one ledger — deferred to Phase 2+. |
| **Admin panel** | ❌ No | No super-user view of all accounts in v1. |

### Per-user lifecycle
1. **Sign up** → Supabase creates `auth.users` row.
2. **Trigger / hook** → create `profiles` row and **seed default categories** for that `user_id`.
3. **Use app** → all CRUD and Gemini features require authentication.
4. **Sign out** → session cleared; protected routes redirect to login.

### Data isolation rules
- Every expense, custom category, budget, and insight cache row has a non-null `user_id`.
- Inserts must set `user_id` to `auth.uid()` (via RLS `WITH CHECK` or DB default).
- Queries from the client use the **anon key** + user JWT; RLS enforces isolation.
- Weekly insight cache is **per user, per week** (not global).

### Future: shared access (Phase 2+)
If household/team mode is added later, introduce a `workspaces` table and membership roles (`owner`, `member`); expenses would belong to `workspace_id` instead of (or in addition to) `user_id`. **Do not** build this in v1 — keep schema simple with `user_id` only.

---

## 4. Gemini Integration

### v1 features (approved direction)

| # | Feature | User flow | Data sent to Gemini |
|---|---------|-----------|---------------------|
| 1 | **Quick natural-language entry** | User types e.g. `50 taka bus`, `120 lunch at hotel` → app prefills amount, category, note, date | Single input string + category list |
| 2 | **Auto-categorize** | User enters amount + description → Gemini suggests category | Description + allowed categories |
| 3 | **Weekly insight** | Dashboard shows 2–4 sentence summary | Aggregated totals by category (no raw line-items dump) |

### Parsing requirements
- Support **English, Bangla, and Banglish** in user input.
- Always return **structured JSON** from API routes (validated with Zod).
- Fallback: if Gemini fails or rate-limits, user can still use **manual form**.

### Phase 2+ (not in v1)
- Budget nudges (wording via Gemini, logic in app)
- Chat: “How much on transport in March?”
- Receipt photo OCR
- Recurring expense detection

### Free tier considerations
- Use **`gemini-2.5-flash`** (cost-efficient, fast).
- Debounce client requests; cache weekly insight per user per week.
- Minimize tokens: send category list once in prompt, not full history.
- Handle `429` with user-friendly “try again or use manual entry.”

### Cost & quota ownership

All Gemini calls go through **one API key** (yours), stored server-side in `GEMINI_API_KEY`. End users never supply their own key.

```
User A ──┐
User B ──┼──► Next.js API routes ──► Your GEMINI_API_KEY ──► Google Gemini
User C ──┘
User D ──┘
```

| Topic | Detail |
|-------|--------|
| **Who owns the bill?** | The Google AI Studio / Cloud project owner who created the API key — **you** (the app developer). |
| **Quota pool** | Free-tier limits (requests, tokens per minute/day) are shared across **all users** of the app, not per user. |
| **3–4 users** | Typical light use (a few parses/categorizes per day + one cached weekly insight per user) usually fits **free tier** with the mitigations below — but all usage still counts against **your** project. |
| **Monetary cost** | **$0** while on free tier and within limits. Charges apply only if you **enable billing** and exceed free allowances. |
| **Abuse risk** | One user repeatedly hitting “Parse” can consume **your** shared quota for everyone — implement per-user rate limits on API routes. |

**What you are not paying for via Gemini**

- Supabase storage/auth (separate product / limits).
- Vercel hosting (separate).
- Storing expenses in PostgreSQL — only API calls that **send text to Gemini** consume Gemini quota.

**Built-in cost controls (v1)**

| Control | Purpose |
|---------|---------|
| Server-only API routes | Key never exposed to browsers |
| `insight_cache` table | One Gemini insight call per user per week when possible |
| Debounced categorize | Avoid API call on every keystroke |
| Parse on button tap | No auto-parse per character |
| Manual fallback on `429` | App stays usable when quota is exhausted |
| Per-user rate limit (recommended) | e.g. cap `/api/gemini/*` calls per `auth.uid()` per hour |

**If you want zero AI cost**

- Ship manual entry only, or disable Gemini routes until you enable billing / accept quota risk.

**Future options (not v1)**

- Paid subscription to cover API usage.
- Stricter per-user daily caps for friends-and-family deployments.

---

## 5. Functional Requirements

### 5.1 MVP (v1)

#### Expenses
- [x] Add expense (manual form): amount, category, date, note, payment method (optional)
- [x] Add expense via **Gemini quick entry** (natural language)
- [x] **Auto-suggest category** when description is filled (Gemini, manual tab)
- [x] Edit and delete expense
- [x] List expenses grouped by **day** (current month)
- [x] Filter by category on expenses list (month scope)

#### Summaries
- [x] **Today** and **this month** total spend
- [x] Breakdown by category (simple bars)
- [x] **Weekly insight** card (Gemini-generated, cached per week)

#### Categories
- [x] Default set seeded on sign-up (9 categories)
- [x] User can add custom categories (stored in Supabase)

#### Budgets
- [x] Set monthly budget per category
- [x] Progress indicator (% used)

#### Auth & account (required for multi-user)
- [x] **Sign up** with email + password (Supabase)
- [x] **Sign in** / **sign out**
- [x] **Password reset** via email (Supabase built-in)
- [ ] **Email verification** (recommended — configurable in Supabase dashboard)
- [x] Middleware: unauthenticated users → `/login`; authenticated users on `/login` → `/dashboard`
- [x] **On sign-up:** DB trigger creates profile + seeds categories (after migration)
- [x] All data scoped to `auth.uid()` (RLS in migration + server actions)

#### Settings
- [x] Profile: display name (optional), email shown (read-only from auth)
- [x] Currency fixed to BDT in v1 (display `৳`)
- [x] Export **own** expenses to **CSV**
- [ ] **Delete account** (Phase 2 — requires cascade delete or soft-delete policy)

### 5.2 Explicitly out of scope for v1
- Shared household / team workspaces
- Splitting expenses between users
- Income tracking
- Multi-wallet / accounts
- Offline-first / PWA sync
- Receipt upload
- Google OAuth (Phase 2 — improves signup friction for multi-user)
- Admin dashboard to manage all users

---

## 6. Data Model (Supabase)

> **Full database diagram:** see **[planning-db.md](./planning-db.md)** — ER diagram (Mermaid), ASCII schema, RLS map, indexes, sign-up flow, and migration checklist.

### `profiles` (one row per registered user)
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | FK → `auth.users.id` (= `auth.uid()`) |
| `display_name` | text | nullable |
| `created_at` | timestamptz | default now() |
| `updated_at` | timestamptz | optional |

> Created automatically on sign-up (DB trigger or Edge Function). Users cannot read or update other users’ profiles.

### `categories`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | null = system default |
| `name` | text | |
| `icon` | text | optional emoji/key |
| `sort_order` | int | |
| `created_at` | timestamptz | |

### `expenses`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | RLS |
| `amount` | numeric(12,2) | always BDT |
| `category_id` | uuid FK | |
| `expense_date` | date | user’s local date |
| `note` | text | nullable |
| `payment_method` | text | e.g. cash, bkash, card |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `budgets` (optional v1)
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `category_id` | uuid FK | |
| `month` | date | first day of month |
| `amount` | numeric(12,2) | |
| `created_at` | timestamptz | |

### `insight_cache` (optional — reduces Gemini calls)
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `week_start` | date | |
| `content` | text | generated summary |
| `created_at` | timestamptz | |

### Row Level Security (critical for multi-user)

**`profiles`**
- SELECT, UPDATE: `id = auth.uid()`
- INSERT: `id = auth.uid()` (on sign-up trigger)

**`expenses`, `budgets`, `insight_cache`**
- ALL operations: `user_id = auth.uid()`

**`categories`**
- SELECT: `user_id IS NULL` (system defaults) OR `user_id = auth.uid()`
- INSERT, UPDATE, DELETE: `user_id = auth.uid()` only (users cannot modify system defaults)

**Policies pattern (example for `expenses`):**
```sql
-- SELECT
CREATE POLICY "Users read own expenses"
  ON expenses FOR SELECT
  USING (user_id = auth.uid());

-- INSERT
CREATE POLICY "Users insert own expenses"
  ON expenses FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE / DELETE: same USING clause as SELECT
```

**Sign-up seeding:** After `profiles` insert, copy system default categories into rows with `user_id = auth.uid()` **or** rely on `user_id IS NULL` defaults at read time (choose one approach in implementation; per-user copies allow customization without affecting other users).

---

## 7. Application Structure

```
/
├── app/
│   ├── layout.tsx              # Root layout, fonts, theme
│   ├── page.tsx                # Landing (public) or redirect if logged in
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (app)/
│   │   ├── dashboard/page.tsx  # Totals, insight, quick add
│   │   ├── expenses/page.tsx   # List + filters
│   │   ├── add/page.tsx        # Manual + Gemini entry
│   │   ├── categories/page.tsx
│   │   ├── budgets/page.tsx    # optional v1
│   │   └── settings/page.tsx
│   └── api/
│       ├── gemini/
│       │   ├── parse-expense/route.ts
│       │   ├── categorize/route.ts
│       │   └── weekly-insight/route.ts
│       └── export/csv/route.ts # optional
├── components/
│   ├── ui/                     # Button, Input, Card, etc.
│   ├── expense-form.tsx
│   ├── expense-list.tsx
│   ├── quick-add.tsx           # Gemini NL input
│   ├── category-picker.tsx
│   ├── summary-cards.tsx
│   └── insight-card.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   └── server.ts           # Server client + cookies
│   ├── gemini.ts               # Shared Gemini client
│   └── validators.ts           # Zod schemas
├── supabase/
│   └── migrations/             # SQL for tables + RLS
├── docs/
│   ├── planning.md             # Product plan (this file)
│   ├── planning-db.md
│   └── planning-design.md
├── .env.example
└── package.json
```

---

## 8. API Routes (Gemini)

### `POST /api/gemini/parse-expense`
**Body:** `{ "text": "50 taka bus fare" }`  
**Response:**
```json
{
  "amount": 50,
  "category": "Transport",
  "note": "bus fare",
  "expense_date": "2026-05-17"
}
```

### `POST /api/gemini/categorize`
**Body:** `{ "description": "bKash recharge" }`  
**Response:** `{ "category": "Utilities" }`

### `POST /api/gemini/weekly-insight`
**Body:** `{ "summary": { "Food": 3200, "Transport": 800, ... }, "total": 8500 }`  
**Response:** `{ "insight": "..." }`

All routes:
- Require authenticated Supabase session; return **401** if not logged in.
- Load categories / aggregates for **`auth.uid()` only** — never accept `userId` from the request body.

---

## 9. UI / UX Guidelines

> **Full design plan:** see **[planning-design.md](./planning-design.md)** — personas, sitemap, user flows (Mermaid), mobile wireframes, components, design tokens, and states.

### Design principles
- **Mobile-first:** thumb-friendly tap targets (min 44px), bottom-aligned primary actions where possible.
- **Simple & attractive:** clean cards, generous whitespace, one primary action per screen.
- **Fast daily use:** dashboard → quick add in ≤2 taps.

### Theme
- **System preference + manual toggle** (light / dark).
- Accent color: distinct but calm (e.g. teal or indigo — finalize in implementation).

### Key screens

| Screen | Purpose |
|--------|---------|
| **Dashboard** | Today’s total, month total, category breakdown, insight card, FAB → Add |
| **Add expense** | Tabs or sections: Quick (Gemini) \| Manual |
| **Expenses** | Chronological list, swipe or menu to edit/delete |
| **Categories** | View defaults, add custom |
| **Landing** | Public marketing + Sign up / Log in (unauthenticated) |
| **Settings** | Profile, sign out, export |

### Language
- UI copy: **English** for v1 (Bangla UI in Phase 2).
- Gemini prompts: explicitly handle **Bangla / Banglish** input.

### Formatting
- Currency: `৳1,234` (en-BD or custom formatter, no decimals unless needed).
- Dates: relative on mobile (“Today”, “Yesterday”) + full date in detail.

---

## 10. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only, if needed for admin tasks

# Gemini (server only)
GEMINI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Setup checklist (before build):**
1. Create project at [supabase.com](https://supabase.com).
2. Run migrations (tables + RLS + seed default categories).
3. Create API key at [Google AI Studio](https://aistudio.google.com/apikey).
4. Copy `.env.example` → `.env.local`.

---

## 11. Implementation Phases

### Phase 0 — Project bootstrap (Day 1) ✅
- [x] Initialize Next.js + TypeScript + Tailwind
- [x] Supabase client (browser + server)
- [x] Auth pages: login, signup, forgot-password
- [x] Middleware: protect `(app)/*`; redirect logged-in users away from auth pages
- [x] Public landing page with CTA to sign up
- [x] `.env.example`, `.gitignore`
- [x] Fix: static `NEXT_PUBLIC_*` env reads for client bundle

### Phase 1 — Core CRUD (Days 2–3) ✅ (app code; DB: run SQL in `supabase/`)
- [x] Migrations: `supabase/migrations/001_initial_schema.sql` (+ optional `002_backfill_existing_users.sql`)
- [x] Sign-up trigger: profile + seed categories per new user
- [ ] **RLS test:** two test accounts cannot read each other’s expenses (manual — see `supabase/README.md`)
- [x] Manual add / edit / delete expense (`/add`, `/expenses/[id]/edit`)
- [x] Expense list grouped by day + dashboard today/month totals + category bars (no Gemini)
- [ ] Filter expenses by category (deferred — list shows current month only)

### Phase 2 — Gemini (Days 4–5) ✅
- [x] `lib/gemini/` client + three API routes (`parse-expense`, `categorize`, `weekly-insight`)
- [x] Quick-add UI (tabs) + categorize on manual form (note blur, debounced)
- [x] Weekly insight card + `insight_cache` migration
- [x] Per-user rate limit on Gemini routes (~40/hour)

### Phase 3 — Polish (Days 6–7) ✅
- [x] Category management UI (`/categories`)
- [x] Budgets (`/budgets` + migration `004`)
- [x] CSV export (`/api/export/csv` + Settings)
- [x] Loading skeletons, empty states, expense category filter
- [x] Deploy guide — [DEPLOY.md](./DEPLOY.md) (manual Vercel + Supabase steps)

### Phase 4 — Post-launch
- **Household / shared workspace** (optional multi-user on same data)
- Chat assistant, receipt OCR, Bangla UI, Google login, PWA offline, account deletion.

---

## 12. Testing Plan

| Area | Tests |
|------|-------|
| **Auth** | Sign up, login, logout, password reset; protected routes |
| **Multi-user isolation** | User A cannot SELECT/UPDATE/DELETE User B’s expenses (RLS) |
| **CRUD** | Create/edit/delete expense only for own `user_id` |
| **Onboarding** | New sign-up gets profile + default categories |
| **Gemini** | Parse EN/BN/Banglish samples; invalid JSON fallback |
| **UI** | Mobile viewport (375px), dark mode |
| **Edge cases** | Empty list, zero amount rejected, 429 from Gemini |

---

## 13. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Gemini free quota / 429 | Manual fallback; debounce; cache weekly insight |
| Wrong parse (amount/category) | Show preview before save; user can edit |
| API key leak | Server-only routes; never import Gemini in client components |
| Supabase RLS misconfiguration | **Mandatory:** integration test with two accounts before production |
| User data leak via API | Never pass `user_id` from client; always use session `auth.uid()` |
| Gemini quota across many users (all on your API key) | See [§4 Cost & quota ownership](#cost--quota-ownership); per-user insight cache + rate limit API routes |

---

## 14. Open Items (confirm before coding)

These were proposed as defaults; change in chat if needed:

| Item | Proposed default |
|------|------------------|
| Multi-user model | Private accounts only (no shared ledger in v1) |
| Auth method | Email + password + password reset |
| Email verification | Enabled in Supabase (recommended) |
| Category seeding | Per-user copy on sign-up (allows personal customization) |
| Budgets in v1 | Include if time allows; otherwise Phase 2 |
| CSV export in v1 | Nice-to-have (own data only) |
| Payment methods | cash, bkash, nagad, card, other |
| Offline support | Online-only for v1 |
| Shared household | Phase 2+ — confirm if needed before building workspaces |

---

## 15. Approval & progress

- [x] Plan reviewed and approved by user  
- [x] Supabase project created  
- [x] Gemini API key created  
- [x] Phase 0 complete  
- [x] Phase 1 app code complete  

---

*Next step: run migration `004_budgets.sql` if not done. Deploy via [DEPLOY.md](./DEPLOY.md). Phase 4 (post-launch) when ready.*
