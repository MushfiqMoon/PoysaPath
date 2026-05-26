# Design Plan — PoysaPath

> **Companion:** [planning.md](./planning.md) · [planning-db.md](./planning-db.md)  
> **Security / AI disclosure:** [planning.md §3–4](./planning.md)  
> **Last updated:** May 26, 2026

## Current state

- Mobile-first (375px+), bottom nav: Home, Expenses, Add, More — glass track with **sliding accent pill** on the active tab (white icon/label).
- Settings → Appearance: Light / Dark / System with the **same sliding-pill** control (`ThemeToggle`).
- Default control borders: **`border-border`** gradient (teal-tinted rule); hover shifts to `--border-gradient-hover`.
- `/add`: **Quick** (Gemini parse + preview) and **Manual** (no AI).
- Dashboard: totals, Money Coach, goals, recurring reminders, category breakdown, recent expenses.

---

## 1. Design goals

| Goal | Approach |
|------|----------|
| Fast logging | Dashboard → Add in ≤2 taps; Quick parse for NL input |
| Clear totals | Today + month on dashboard |
| Retention loops | Goals, recurring reminders, and monthly reports |
| Private accounts | No shared UI between users |
| Safe AI | Preview before save; Manual tab never calls Gemini |
| Mobile comfort | Bottom nav, 44px+ tap targets |

---

## 2. Sitemap

```mermaid
flowchart TB
    subgraph public [Public]
        landing["/"]
        login["/login"]
        signup["/signup"]
    end
    subgraph app [Authenticated]
        dashboard["/dashboard"]
        add["/add"]
        expenses["/expenses"]
        settings["/settings"]
    end
    landing --> login
    login --> dashboard
    add --> dashboard
```

| Route | Auth | Notes |
|-------|------|-------|
| `/`, `/login`, `/signup` | Public | Logged in → `/dashboard` |
| `/dashboard`, `/add`, `/expenses`, `/settings`, … | Required | Middleware |

---

## 3. Core flows

### 3.1 Quick add (Gemini)

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Add_Quick
    participant API as parse_expense
    U->>UI: Type description
    U->>UI: Tap Parse
    UI->>API: POST text
    API-->>UI: amount category note date
    UI->>U: Editable preview
    U->>UI: Save
    UI->>U: Dashboard
```

- Always **preview** before save; highlight parsed fields optional.
- Error: inline message + switch to Manual tab.
- Footer: description sent to Google AI (see privacy).

### 3.2 Manual add (no AI)

```mermaid
flowchart TD
    manual[Manual tab] --> amount[Amount]
    amount --> category[CategoryPicker]
    category --> note[Note optional]
    note --> date[Date default today]
    date --> payment[Payment optional]
    payment --> save[Save]
    save --> done[Dashboard or Expenses]
```

User picks category manually. No blur/API categorization.

### 3.3 Money Coach

- If cached coach text for today → show card.
- Else POST `weekly-insight` → generate Money Coach text and cache in DB.
- Refresh: manual, 1h cooldown (client + server rules).

### 3.4 Goals and recurring reminders

- Settings → Goals creates savings, emergency, debt payoff, or spend-less category challenges.
- Settings → Recurring money creates rent, subscription, bill, tuition, salary, or allowance reminders.
- Dashboard surfaces active goals and upcoming or missed recurring items.

### 3.5 Monthly AI report

- Settings → Monthly report calls `POST /api/gemini/monthly-report`.
- Report includes wins, problem areas, category changes, and next-month plan.

### 3.6 Edit / delete

Expenses list → edit page → save or confirm delete. No AI.

### 3.7 Auth

Login, signup, forgot password, sign out from Settings.

---

## 4. Key screens

### Dashboard `/dashboard`

- Greeting, today + month cards.
- Money Coach card (if user has expenses and Gemini key).
- Goals and upcoming money reminders.
- Category breakdown, recent list → edit.
- Empty state: CTA to `/add`.

### Add `/add`

| Tab | Content |
|-----|---------|
| **Quick** | Textarea, Parse button, then preview form (`ExpenseForm`) |
| **Manual** | Full `ExpenseForm` — amount, category, date, note, payment |

### Expenses `/expenses`

- Grouped list, tap to edit. Filter by category (month scope).

### Settings `/settings`

- Hub: grouped menu (Profile, Categories, Budgets, Goals, Recurring money, Monthly report, Announcements) + Gemini API key (BYOK) + legal links on `/settings`.
- **Profile** (`/settings/profile`): display name, email, **Preferences** (theme: Light / Dark / System). CSV export hidden (API still exists).

---

## 5. Components

| Component | Used on |
|-----------|---------|
| `QuickAdd` | `/add` Quick tab |
| `ExpenseForm` | Manual tab, parse preview, edit |
| `InsightCard` | Dashboard Money Coach |
| `GoalsManager` | Settings → Goals |
| `RecurringManager` | Settings → Recurring money |
| `MonthlyReportCard` | Settings → Monthly report |
| `CategoryPicker` | Expense form |
| `app-shell` | Bottom navigation (mobile); sidebar (desktop) |
| `ThemeToggle` | Settings → Profile → Preferences (Light / Dark / System) |

---

## 6. UI tokens (summary)

- Surfaces: `bg-bg`, `bg-surface`, `glass-panel`, `glass-panel-light`
- Borders: `border-border` (gradient ring via `app/globals.css` `@utility`), `border-border-soft` (subtle dividers), solid `border-danger` / `border-accent/*` for state
- Text: `text-text`, `text-text-muted`
- Accent: primary actions, sliding pills on segmented controls (nav + theme)
- Danger: errors, delete
- Currency: `৳` + tabular nums

**Segmented control pattern** (nav + theme): neutral track → absolutely positioned accent pill (`width: 25%` or `33.333%`) → `translate3d(index * 100%, 0, 0)` with 300ms ease; active label `text-white`.

---

## 7. States and errors

| State | Pattern |
|-------|---------|
| Loading | Skeleton or button spinner |
| Empty | Short message + CTA |
| Gemini 429 | “AI busy — use manual entry or try later” |
| Auth error | Inline under form fields |

---

## 8. Gemini UX principles

1. Preview before persist (Quick tab only).
2. Manual tab is fully offline from AI.
3. EN / BN / Banglish supported on **parse** input only.
4. Money Coach and monthly report use aggregates, not full expense dump in prompt.

---

*Backlog UI: [post-deployment-changes/ui-suggestions.md](./post-deployment-changes/ui-suggestions.md).*
