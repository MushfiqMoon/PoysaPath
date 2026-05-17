# UI suggestions (post-deployment)

> Ideas to refine look, feel, and usability **after** the first production deploy.  
> **Last updated:** May 17, 2026

Track items here instead of blocking launch. Prioritize by user feedback and effort.

---

## How to use this doc

| Priority | Meaning |
|----------|---------|
| **P0** | Hurts trust or usability for most users — fix soon after deploy |
| **P1** | Clear UX win, moderate effort |
| **P2** | Polish / delight |

Status: `[ ]` open · `[~]` in progress · `[x]` done

---

## Navigation & layout

### Bottom navigation (Facebook-style)

**Current:** Text-only tabs with placeholder glyphs (`•` / `+`) in `components/app-shell.tsx`.  
**Goal:** Icon above label, familiar mobile pattern (similar to Facebook / Instagram bottom bar) — outline icons inactive, filled or accent color when active.

- [x] **P1 — Bottom nav icons (`react-icons`)** — `react-icons` in `components/app-shell.tsx`.

| Tab | Route | Label | Icon (outline) | Import |
|-----|--------|--------|----------------|--------|
| Home | `/dashboard` | Home | `IoHomeOutline` | `react-icons/io5` |
| Expenses | `/expenses` | Expenses | `CiCircleList` | `react-icons/ci` |
| Add | `/add` | Add | `FiEdit` | `react-icons/fi` |
| More | `/settings` | More | `IoSettingsOutline` | `react-icons/io5` |

**Suggested markup pattern:**

```tsx
import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";
import { CiCircleList } from "react-icons/ci";
import { FiEdit } from "react-icons/fi";

// Per tab: icon ~22–24px, label text-xs below, flex-col, min tap 44px
<IoHomeOutline className="h-6 w-6" aria-hidden />
<span>Home</span>
```

**Polish (optional with icons):**

- [x] **P1 — Active state** — Filled icons + accent on active tab where available.
- [ ] **P2 — Add tab emphasis** — Slightly larger icon or accent pill for Add (common in social apps); keep `FiEdit` or swap to `IoAddCircleOutline` if edit feels unclear.
- [x] **P1 — `aria-current="page"`** — On active nav links in `app-shell.tsx`.

**Dependency:** `npm install react-icons` (tree-shaken per icon import).

---

- [x] **P1 — Desktop sidebar** — Persistent sidebar at `md+` in `app-shell.tsx`.
- [ ] **P2 — “More” menu** — Group Categories, Budgets, Settings in a sheet with icons and short descriptions.
- [ ] **P2 — Active route affordance** — Stronger highlight on bottom nav / sidebar for current page (partially covered by bottom nav icons above).

### Glass / fluid UI (iOS-style)

**Current:** Flat `bg-surface` header and bottom bar; cards use solid `bg-surface` + `border` ([`app/globals.css`](../../app/globals.css)). Header already has light `backdrop-blur` — can push further toward **frosted glass** (translucent layers, content scrolling underneath).

**Goal:** Feel closer to iOS / visionOS — layered depth, blur, soft edges, smooth motion — without hurting readability or performance on mid-range Android.

**Where to apply (highest impact first):**

| Surface | File(s) | Idea |
|---------|---------|------|
| Bottom nav | `components/app-shell.tsx` | Floating pill or full-width bar: `bg-surface/70`, `backdrop-blur-xl`, hairline top border `border-white/10` (dark) / `border-black/5` (light) |
| Header | `components/app-shell.tsx` | Match bottom bar; optional hide-on-scroll down, show on scroll up |
| Cards (dashboard, lists) | Dashboard / expense components | Slight translucency + blur *or* keep cards solid and only glass the chrome (recommended v1 of this look) |
| Modals / sheets | Future “More” menu, category picker | `backdrop-blur` overlay + rounded sheet with glass panel |
| Insight / summary chips | Dashboard | Soft gradient blob behind card (very subtle) |

**CSS / Tailwind building blocks:**

```css
/* Add to globals.css when implementing */
--glass-bg: color-mix(in srgb, var(--surface) 72%, transparent);
--glass-border: color-mix(in srgb, var(--border) 50%, transparent);
```

```tsx
// Example utility class (Tailwind)
className="border border-white/10 bg-surface/75 shadow-lg shadow-black/5 backdrop-blur-xl backdrop-saturate-150"
```

**Fluid motion (optional, P2):**

- [ ] **P2 — Page transitions** — Short fade/slide between main tabs (respect `prefers-reduced-motion`).
- [ ] **P2 — Scroll-linked header** — Header opacity/blur increases as user scrolls (iOS Safari-style).
- [ ] **P2 — Springy press states** — `active:scale-[0.98]` on nav items and primary buttons (subtle only).

**Checklist:**

- [x] **P1 — Glass chrome only** — Frosted header + floating bottom nav; cards stay solid.
- [x] **P1 — Design tokens** — `--glass-bg`, `--glass-border` in `app/globals.css`.
- [~] **P1 — Contrast pass** — Initial pass done; revisit after user feedback on devices.
- [x] **P2 — Floating bottom nav** — Inset rounded bar + safe-area padding.
- [x] **P2 — Mesh / gradient background** — Subtle accent radial on `body`.
- [x] **P2 — `@supports (backdrop-filter: blur(1px))`** — `.glass-panel` fallback in `globals.css`.
- [ ] **P2 — Performance** — Limit blurred layers (2–3 max); avoid `backdrop-blur` on long scroll lists (each row).

**Pair with:** Bottom nav icons (above) — glass bar + outline icons reads very “modern iOS / social app.”

**Avoid for v1 of glass UI:**

- Heavy blur on every list row (jank + battery).
- Glass-only text with no opaque backing (fails accessibility on photos/busy wallpapers).

---

## Dashboard

- [ ] **P1 — Pull-to-refresh** — Refresh today/month totals and insight on mobile.
- [ ] **P1 — Skeleton → content transition** — Softer fade when dashboard data loads.
- [x] **P2 — Category bars** — Tap bar → `/expenses?category=…`.
- [ ] **P2 — Empty month state** — Illustration + CTA to Add when month total is ৳0.

## Add expense

- [x] **P1 — Sticky save bar** — Fixed save bar on mobile in `expense-form.tsx`.
- [x] **P1 — Amount keypad** — `inputmode="decimal"` + larger amount field.
- [ ] **P2 — Recent categories** — Show last 3 used categories as chips above the picker.
- [ ] **P2 — Parse success flash** — Brief highlight on fields filled by Gemini ([planning-design §9](./../planning-design.md)).

## Expenses list

- [ ] **P1 — Date range filter** — Week / custom range in addition to category filter.
- [ ] **P2 — Swipe actions** — Swipe row to edit or delete (with confirm).
- [ ] **P2 — Group collapse** — Collapse “Yesterday”, older days in long lists.

## Categories & budgets

- [x] **P1 — Delete category UX** — Reassign picker when category has expenses.
- [ ] **P2 — Budget progress colors** — Consistent green / amber / red with **% label** (not color alone).
- [ ] **P2 — Emoji picker** — Simple grid for category icon instead of free text.

## Settings & auth

- [x] **P1 — Sign out confirmation** — Confirm dialog in `app-shell.tsx`.
- [ ] **P2 — Avatar / initials** — Circle with first letter of display name on dashboard and settings.
- [ ] **P2 — Theme toggle** — Light / dark / system if not already exposed in UI.

## Accessibility (from design baseline)

- [x] **P0 — Focus rings** — Global `:focus-visible` + button outlines.
- [~] **P0 — Icon buttons** — Sign out has `aria-label`; audit remaining icon-only controls.
- [ ] **P1 — Form errors** — Link messages with `aria-describedby`.
- [ ] **P1 — Contrast audit** — Verify body text ≥ 4.5:1 on `bg` / `surface`.

## Localization (future UI)

- [ ] **P2 — Bangla UI** — Copy and labels in Bengali ([planning-design §12](./../planning-design.md)).
- [ ] **P2 — BDT formatting** — Consistent `৳` grouping everywhere (lists, charts, budgets).

## Performance & perceived speed

- [ ] **P1 — Optimistic UI** — Instant feedback on add/delete expense where safe.
- [ ] **P2 — Prefetch** — Prefetch `/add` and `/expenses` from dashboard nav hover (desktop).

---

## Notes / feedback from users

_Add dated bullets after deploy (user quotes, analytics, support requests)._

| Date | Note |
|------|------|
| | |

---

## Related docs

| Document | Purpose |
|----------|---------|
| [feature-improvements.md](./feature-improvements.md) | Non-UI capabilities and backend work |
| [../planning-design.md](../planning-design.md) | Original wireframes and tokens |
| [../DEPLOY.md](../DEPLOY.md) | Production deploy checklist |
