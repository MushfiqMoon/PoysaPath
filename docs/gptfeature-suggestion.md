# GPT feature suggestions — inventory & review

> **Purpose:** Compare a 30-feature personal-finance wishlist against what PoysaPath ships today.  
> **Last reviewed:** June 7, 2026  
> **Baseline:** [planning.md](./planning.md) · Backlog: [feature-improvements.md](./post-deployment-changes/feature-improvements.md)

| Legend | Meaning |
|--------|---------|
| ✅ **Have** | Implemented end-to-end (UI + data layer) |
| ⚠️ **Partial** | Related functionality exists; full feature not built |
| ❌ **Don't have** | Not implemented |

---

## Summary

| Status | Count | Features |
|--------|-------|----------|
| ✅ Have | 3 | #5, #7, #21 |
| ⚠️ Partial | 10 | #1, #3, #6, #16, #18, #20, #28, #29, #30 (+ AI categorization via Quick Add only) |
| ❌ Don't have | 17 | #2, #4, #8–15, #17, #19, #22–27 |

**Read:** PoysaPath is a **BDT-focused personal expense tracker** with budgets, goals, recurring reminders, and optional Gemini AI — not yet a full personal-finance platform.

**Next step:** See [Foundation roadmap](#foundation-roadmap) — **Layer 1 (Phase A + A+ shipped):** manual income, dashboard net flow, income categories, savings rate in monthly report & Money Coach. Next: recurring salary, AI income parse.

---

## Full checklist

| # | Feature | Status | Notes / evidence |
|---|---------|--------|------------------|
| 1 | AI Expense Categorization | ⚠️ Partial | Gemini Quick Add on `/add` parses text → amount, category, note, date (`components/expenses/quick-add.tsx`, `app/api/gemini/parse-expense/route.ts`). Manual entry has no AI. No learning from user corrections. |
| 2 | Cash Flow Forecasting | ❌ Don't have | Historical totals only (`getTodayTotal`, `getMonthTotal` in `lib/data/expenses.ts`). No balance projection. |
| 3 | Subscription Tracker | ⚠️ Partial | Generic recurring items can track subscriptions (`components/recurring/recurring-manager.tsx`, `/settings/recurring`). No auto-detection, price-change tracking, or subscription analytics. |
| 4 | Financial Health Score | ❌ Don't have | Dashboard shows raw spend, budgets, and goals — no composite health metric. |
| 5 | AI Spending Coach | ✅ Have | **AI Money Coach** on dashboard: weekly income + spend comparison and one actionable tip (`components/dashboard/insight-card.tsx`, `app/api/gemini/weekly-insight/route.ts`). |
| 6 | Smart Budget Recommendations | ⚠️ Partial | Budgets are user-set manually (`components/budget/budgets-manager.tsx`). AI coach and monthly report give narrative advice only — no auto-generated budget plans. |
| 7 | Goal-Based Savings | ✅ Have | Savings, debt payoff, and spend-less challenges with contribution history (`components/goals/goals-manager.tsx`, `lib/data/goals.ts`, dashboard card). |
| 8 | Investment Portfolio Tracking | ❌ Don't have | No investment types, routes, or UI (stocks, mutual funds, DPS, FDR, etc.). |
| 9 | Net Worth Dashboard | ❌ Don't have | No assets, liabilities, or net-worth-over-time tracking. |
| 10 | Receipt Scanner (OCR) | ❌ Don't have | Explicit non-goal in [planning.md](./planning.md). On P2 backlog in [feature-improvements.md](./post-deployment-changes/feature-improvements.md). |
| 11 | Statement Import | ❌ Don't have | CSV **export** API exists (`app/api/export/csv/route.ts`); no import from PDF, CSV, SMS, or email. |
| 12 | Anomaly Detection | ❌ Don't have | No unusual-spending alerts. Budget overage only (`lib/budget/usage.ts`). |
| 13 | Family Finance Mode | ❌ Don't have | Single-user RLS model. Docs: "No shared household view" (`lib/features-catalog.ts`, [planning-db.md §7](./planning-db.md)). |
| 14 | FIRE Calculator | ❌ Don't have | No retirement / financial-independence calculator. |
| 15 | Tax Estimator | ❌ Don't have | No tax calculation or tax-saving investment tracking. |
| 16 | AI Finance Assistant | ⚠️ Partial | AI via Money Coach, monthly report, and Quick Add — **no conversational Q&A chat** (chat listed as P2 backlog). |
| 17 | Financial Scenario Simulator | ❌ Don't have | No what-if modeling (loans, salary changes, major purchases). |
| 18 | Advanced Spending Analytics | ⚠️ Partial | Category breakdown bars, month filters, budget rings, expense list filters. No charts, heatmaps, trend lines, or custom reports. |
| 19 | Savings Opportunity Finder | ❌ Don't have | Monthly report "watchouts" are AI narrative bullets — no structured savings finder with amounts. |
| 20 | Personal CFO Dashboard | ⚠️ Partial | Dashboard shows Income / Expenses / Saved, goals, coach, recurring, budgets (`app/(app)/dashboard/page.tsx`). No debt overview or investments. |
| 21 | Bill Reminder System | ✅ Have | Recurring items with due-soon / missed alerts, bell notifications, dashboard card (`lib/data/recurring-alerts.ts`, `components/notifications/notifications-panel.tsx`). |
| 22 | Credit Score Monitoring | ❌ Don't have | "Credit Card" is expense metadata only (`lib/constants.ts`). |
| 23 | Shared Group Expenses | ❌ Don't have | No split bills or group expense sharing. |
| 24 | Multi-Currency Support | ❌ Don't have | BDT-only (৳ hardcoded in `lib/format.ts`; non-goal in [planning.md](./planning.md)). |
| 25 | Voice Expense Entry | ❌ Don't have | Quick Add is text-only. No Web Speech API or mic UI. |
| 26 | Location-Based Tracking | ❌ Don't have | `Expense` type has no location / merchant geo fields (`lib/types.ts`). |
| 27 | Cashback & Rewards Tracker | ❌ Don't have | No rewards, cashback, or loyalty-point tracking. |
| 28 | Debt Payoff Planner | ⚠️ Partial | `debt_payoff` goal type with manual contributions. No interest rates, amortization, or snowball / avalanche strategies. |
| 29 | Emergency Fund Tracker | ⚠️ Partial | User can create a savings goal titled "Emergency fund". No dedicated module (months-of-expenses target, recommended amount). |
| 30 | AI Financial Planning | ⚠️ Partial | Monthly AI report includes income, spending, savings rate (`cashFlowSummary`, `lib/gemini/cash-flow.ts`) + Money Coach with income context. Not a full long-term planning suite. |

---

## What we ship today (core product)

Beyond the 30-item list, these are the main implemented capabilities:

| Area | Key paths |
|------|-----------|
| Expense CRUD | `app/(app)/history/`, `app/(app)/expenses/[id]/edit/`, `app/(app)/add/`, `app/(app)/actions/expenses.ts` |
| Income CRUD | `app/(app)/history/?tab=income`, `app/(app)/incomes/[id]/edit/`, `app/(app)/add/?flow=income`, `app/(app)/actions/incomes.ts` |
| Categories | `app/(app)/settings/categories/`, `lib/data/categories.ts` |
| Budgets | `app/(app)/settings/budgets/`, `lib/data/budgets.ts` |
| Goals + challenges | `app/(app)/settings/goals/`, `lib/data/goals.ts` |
| Recurring + reminders | `app/(app)/settings/recurring/`, `lib/data/recurring-alerts.ts` |
| Auth | Email/password + Google OAuth (`components/auth/auth-form.tsx`) |
| Notifications | `lib/data/notifications.ts`, bell in `components/layout/app-shell.tsx` |
| CSV export (API only) | `app/api/export/csv/route.ts` (Settings UI hidden) |
| AI (BYOK Gemini) | parse-expense, weekly-insight, monthly-report APIs |

**Domain types in `lib/types.ts`:** `Category`, `Expense`, `Income`, `BudgetRow`, `FinancialGoal`, `RecurringItem`, `Notification`.

**Not defined:** accounts/wallets, investments, net worth, tax, credit score, location, multi-currency, family/workspace, anomalies, forecasts, scenarios.

---

## Strongest matches to the wishlist

| Feature | Why it fits |
|---------|-------------|
| #5 AI Spending Coach | Fully shipped as Money Coach |
| #7 Goal-Based Savings | Full goals system with contributions and dashboard |
| #21 Bill Reminder System | Recurring items + in-app alerts |

---

## Closest partial matches (upgrade candidates)

| Feature | What exists | Gap to close |
|---------|-------------|--------------|
| #1 AI Categorization | Quick Add only | Extend to manual add; learn from corrections |
| #3 Subscription Tracker | Recurring bills | Auto-detect recurring charges; monthly/yearly cost rollup |
| #28 Debt Payoff Planner | Debt goal type | Interest, schedules, snowball/avalanche |
| #29 Emergency Fund Tracker | Generic savings goal | Months-of-expenses calculator + recommended target |
| #30 AI Financial Planning | Monthly report + coach | Long-term projections; goal prioritization |
| #6 Smart Budget Recommendations | Manual budgets + AI text | Algorithmic budget suggestions from history |
| #16 AI Finance Assistant | Point-in-time AI features | Conversational Q&A on user aggregates |
| #18 Advanced Analytics | Category bars + filters | Charts, trends, heatmaps, custom date ranges |
| #20 Personal CFO Dashboard | Expense dashboard | Income, cash position, debt, holistic view |

---

## Biggest gaps (not started)

| Category | Features |
|----------|----------|
| Wealth & investments | #8 Portfolio, #9 Net worth |
| Import / capture | #10 OCR, #11 Statement import, #25 Voice entry |
| Planning & simulation | #2 Cash flow forecast, #14 FIRE, #15 Tax, #17 Scenario simulator |
| Social / shared | #13 Family mode, #23 Group expenses |
| Monitoring & alerts | #4 Health score, #12 Anomaly detection, #22 Credit score |
| Other | #19 Savings finder, #24 Multi-currency, #26 Location, #27 Cashback/rewards |

---

## Foundation roadmap

PoysaPath is built on manual **income + expense** tracking today. Many wishlist features need shared foundations before they can ship. Build in layers — each layer unlocks the next tier of features.

### Layer 1 progress (Phase A + A+)

| What exists (after Phase A+) | What is still missing |
|-------------|-----------------|
| `incomes` table + manual CRUD | Recurring salary |
| Dashboard: Income / Expenses / Saved | Savings rate on dashboard (shown in monthly report UI) |
| 4 default income categories + Settings tabs | AI Quick Add for income |
| `/history` (Expense \| Income tabs) | CSV export with income |
| Money Coach + monthly report income & savings rate | `for_month` earned-month field |

---

### Layer 1 — Cash flow basics (highest priority)

| # | Foundation item | Scope |
|---|-----------------|-------|
| 1.1 | **Income transactions** | Manual + AI Quick Add; or unified `transactions` with `type: income \| expense` |
| 1.2 | **Income categories** | Salary, Business, Investment returns, Other income |
| 1.3 | **Recurring income** | Re-enable monthly salary / allowance (record as income, not expense) |
| 1.4 | **Dashboard net cash flow** | Income this month · Expenses this month · **Saved this month** |
| 1.5 | **Savings rate** | `(income − expenses) / income` — feeds health score and AI planning |

**Unlocks:** #2, #4, #6, #14, #15, #17, #20, #29, #30 (partial)

**Does not require:** accounts, investments, or imports.

---

### Layer 2 — Accounts & balances

| # | Foundation item | Scope |
|---|-----------------|-------|
| 2.1 | **Accounts / wallets** | Cash, bKash/Nagad, bank, credit card — beyond `payment_method` labels |
| 2.2 | **Starting balance** | Optional opening balance per account |
| 2.3 | **Running balance** | Derive from income, expenses, and transfers |
| 2.4 | **Transfers** | Move money between accounts (not income or expense) |

**Unlocks:** #2 (cash forecast), #9 (cash portion of net worth), #20 (CFO cash position)

**Build after:** Layer 1 (income + expenses linked to accounts).

---

### Layer 3 — Assets, debt & investments

| # | Foundation item | Scope |
|---|-----------------|-------|
| 3.1 | **Liabilities** | Loans, credit cards — balance, APR, minimum payment, due date |
| 3.2 | **Assets** | Savings, FD, property — manual value + last updated |
| 3.3 | **Investments** | Holdings (DPS, FDR, stocks, mutual funds) — units, cost, current value |
| 3.4 | **Net worth snapshot** | `assets − liabilities` over time |

**Unlocks:** #8, #9, #28 (real debt planner with snowball/avalanche), #14 (FIRE inputs)

**Build after:** Layer 2 (accounts as base for cash assets).

---

### Layer 4 — Data ingestion & intelligence

| # | Foundation item | Scope |
|---|-----------------|-------|
| 4.1 | **Statement / CSV import** | Inbound pipeline (export API exists today) |
| 4.2 | **Receipt OCR** | Image → amount, merchant, date |
| 4.3 | **Merchant / location** | Optional fields on transactions |
| 4.4 | **Categorization memory** | Learn from user corrections after AI parse |
| 4.5 | **Time-series analytics** | Charts, MoM/YoY, custom date ranges (today: category bars only) |
| 4.6 | **Anomaly baseline** | Rolling averages + std dev for spend alerts |

**Unlocks:** #1, #10, #11, #12, #18, #19, #25, #26, #27

**Note:** #12 and #19 can start on **expenses only**; income context makes them richer.

---

### Layer 5 — Social & platform

| # | Foundation item | Scope |
|---|-----------------|-------|
| 5.1 | **Household / workspace** | Shared RLS scope beyond single `user_id` |
| 5.2 | **Group expense splitting** | Shared ledger, split rules, settle-up |
| 5.3 | **Multi-currency** | FX rates, per-transaction currency (today: BDT-only) |
| 5.4 | **Credit score API** | Third-party integration |
| 5.5 | **Conversational AI** | Chat Q&A on user aggregates (point-in-time AI exists today) |

**Unlocks:** #13, #16 (full assistant), #22, #23, #24

**Note:** Architectural changes — highest effort, build when core single-user finance is solid.

---

### Feature dependency map

Which foundation layer each wishlist feature needs (minimum):

| Layer | Features unlocked |
|-------|-------------------|
| **L1 — Cash flow** | #2, #4, #6, #14, #15, #17, #20, #29, #30 |
| **L2 — Accounts** | #2 (forecast), #9 (partial), #20 (partial) |
| **L3 — Assets/debt** | #8, #9, #28 (full), #14 (full) |
| **L4 — Ingestion/AI** | #1, #10, #11, #12, #18, #19, #25, #26, #27 |
| **L5 — Social/platform** | #13, #16 (chat), #22, #23, #24 |
| **None (expense-only OK)** | #3, #5, #7, #21 — already partial or shipped |

---

### Income dependency: yes vs no

**Heavily blocked without income (Layer 1):**

| # | Feature | Why |
|---|---------|-----|
| 2 | Cash flow forecasting | Needs inflows + outflows to project balance |
| 4 | Financial health score | Savings rate, income vs spend ratio |
| 6 | Smart budget recommendations | Usually % of income (e.g. 50/30/20) |
| 14 | FIRE calculator | Income, expenses, savings rate |
| 15 | Tax estimator | Taxable income is core input |
| 17 | Scenario simulator | “Salary change” needs a salary baseline |
| 20 | Personal CFO dashboard | Incomplete without income summary |
| 29 | Emergency fund tracker | Months-of-expenses + income stability |
| 30 | AI financial planning | Plans need full cash-flow picture |

**Can progress on expenses alone (income optional):**

| # | Feature | Notes |
|---|---------|-------|
| 1 | AI categorization | Expense-only is fine |
| 3 | Subscription tracker | Recurring expense detection |
| 5 | AI Spending Coach | ✅ Shipped on spend + budgets |
| 7 | Goal-based savings | ✅ Shipped — manual contributions |
| 10 | Receipt OCR | Capture expenses |
| 12 | Anomaly detection | Unusual spending detectable without income |
| 18 | Advanced analytics | Expense trends and charts |
| 21 | Bill reminders | ✅ Shipped |
| 25 | Voice entry | Add expenses |
| 26 | Location tagging | Expense metadata |
| 27 | Cashback tracker | Tied to card spend |

**Blocked by other foundations (not just income):**

| # | Feature | Primary blocker |
|---|---------|-----------------|
| 8 | Investment portfolio | Layer 3 — holdings table |
| 9 | Net worth | Layer 2 + 3 — assets & liabilities |
| 11 | Statement import | Layer 4 — import pipeline |
| 13 | Family finance | Layer 5 — household model |
| 23 | Group expenses | Layer 5 — split ledger |
| 24 | Multi-currency | Layer 5 — FX (or product decision) |
| 22 | Credit score | Layer 5 — external API |
| 28 | Debt payoff planner | Layer 3 — loan terms (goals exist today) |
| 19 | Savings finder | Layer 4 — analytics; richer with L1 |

---

### Minimum foundation pack (recommended first sprint)

Smallest set that unlocks the most planning features:

1. **Income entry** — manual tab on `/add` + optional AI parse
2. **Dashboard trio** — Income · Expenses · Saved this month
3. **Recurring salary** — monthly income reminder + record as income
4. **Savings rate** — single metric on dashboard or reports
5. **Income categories** — seed on sign-up (Salary, Other income)

**After this pack, realistically start:** #2, #4, #6, #20, #29, #30 (partial), and improve #14, #15, #17.

**Defer until later:** Layer 3+ (investments, net worth), Layer 5 (family, multi-currency), OCR/import unless capture is the priority.

---

### Suggested build order (summary)

```
Layer 1  Income + net cash flow          ← start here
   ↓
Layer 2  Accounts & balances
   ↓
Layer 3  Assets, debt, investments
   ↓
Layer 4  Import, OCR, analytics, anomalies
   ↓
Layer 5  Household, groups, multi-currency, credit API
```

| Phase | Focus | Example deliverables |
|-------|--------|----------------------|
| **Phase A** | Layer 1 | Income CRUD, dashboard net flow, income categories |
| **Phase A+** | Layer 1 (AI) | Monthly report + Money Coach use income & savings rate |
| **Phase B** | Layer 2 | Wallet accounts, transfers, simple forecast |
| **Phase C** | Layer 3 | Debt accounts, investment holdings, net worth chart |
| **Phase D** | Layer 4 | CSV import, charts, anomaly alerts, OCR |
| **Phase E** | Layer 5 | Family workspace, splits, chat assistant |

---

## Review notes

Use this section during team review. Add decisions, priorities, and owner initials.

| # | Feature | Review decision | Priority | Notes |
|---|---------|-----------------|----------|-------|
| 1 | AI Expense Categorization | | | |
| 2 | Cash Flow Forecasting | | | |
| 3 | Subscription Tracker | | | |
| 4 | Financial Health Score | | | |
| 5 | AI Spending Coach | ✅ Shipped | — | |
| 6 | Smart Budget Recommendations | | | |
| 7 | Goal-Based Savings | ✅ Shipped | — | |
| 8 | Investment Portfolio Tracking | | | |
| 9 | Net Worth Dashboard | | | |
| 10 | Receipt Scanner (OCR) | | | |
| 11 | Statement Import | | | |
| 12 | Anomaly Detection | | | |
| 13 | Family Finance Mode | | | |
| 14 | FIRE Calculator | | | |
| 15 | Tax Estimator | | | |
| 16 | AI Finance Assistant | | | |
| 17 | Financial Scenario Simulator | | | |
| 18 | Advanced Spending Analytics | | | |
| 19 | Savings Opportunity Finder | | | |
| 20 | Personal CFO Dashboard | | | |
| 21 | Bill Reminder System | ✅ Shipped | — | |
| 22 | Credit Score Monitoring | | | |
| 23 | Shared Group Expenses | | | |
| 24 | Multi-Currency Support | | | |
| 25 | Voice Expense Entry | | | |
| 26 | Location-Based Tracking | | | |
| 27 | Cashback & Rewards Tracker | | | |
| 28 | Debt Payoff Planner | | | |
| 29 | Emergency Fund Tracker | | | |
| 30 | AI Financial Planning | | | |

**Decision values (suggested):** `Ship` · `Upgrade partial` · `Backlog` · `Won't do` · `Needs research`

---

## Related docs

- [planning.md](./planning.md) — product scope and non-goals
- [feature-improvements.md](./post-deployment-changes/feature-improvements.md) — prioritized post-launch backlog
- [planning-design.md](./planning-design.md) — UX flows and screens
