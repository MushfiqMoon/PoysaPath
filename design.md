# Design — PoysaPath

Locked design system for the PoysaPath expense tracker. Every page reads this file before emitting UI code.

## Genre

Utilitarian-evolve — mobile-first finance app with refined glass surfaces, dense workbench layouts, and calm motion.

## Macrostructure family

- **Marketing pages** (landing, auth): Split-panel hero — wordmark left, action column right; mesh background; no enrichment.
- **App pages** (dashboard, add, expenses, settings): Workbench — stacked sections, metric cards, filter bars, grouped lists.
- **Content pages** (privacy, terms): Long Document — readable prose, minimal chrome.

## Theme

Custom OKLCH palette with **teal accent** (`#0d9488` / `#0f766e`) — restored per product preference (May 2026).

| Token | Light | Dark |
|-------|-------|------|
| `--color-paper` | oklch(98% 0.008 275) | oklch(16% 0.025 275) |
| `--color-paper-2` | oklch(100% 0 0) | oklch(22% 0.03 275) |
| `--color-ink` | oklch(22% 0.03 275) | oklch(96% 0.01 275) |
| `--color-ink-2` | oklch(52% 0.02 275) | oklch(72% 0.02 275) |
| `--color-rule` | oklch(90% 0.015 275) | oklch(32% 0.025 275) |
| `--color-accent` | `#0d9488` | `#0d9488` |
| `--color-accent-hover` | `#0f766e` | `#0f766e` |
| `--color-focus` | `#0d9488` | `#0d9488` |
| `--color-danger` | oklch(55% 0.22 25) | oklch(62% 0.2 25) |

Semantic aliases: `--bg` → paper, `--surface` → paper-2, `--text` → ink, `--text-muted` → ink-2, `--border` → rule, `--accent` → accent.

### Borders (gradient)

CSS cannot set `border-color` to a gradient. Default borders use the `border-border` utility in `app/globals.css`, which paints a **teal-tinted 135° gradient** on the border ring via double `background-image` + `background-clip` (inner fill + outer gradient).

| Token / utility | Role |
|-----------------|------|
| `--border-gradient` | Default edge: rule gray blended with accent |
| `--border-gradient-hover` | Stronger accent mix on `:hover` / `:focus-within` |
| `--border-gradient-soft` | Subtle variant (`border-border-soft`) for dividers |
| `--border-inner` | Inner fill matched to element background (`bg-surface`, `bg-bg`, or `[--border-inner:transparent]` on glass dividers) |

**Usage:** `border border-border` with `bg-surface` (or `bg-bg`). Pair `bg-bg` / `bg-bg/50` so `--border-inner` auto-matches. Error/success still use solid `border-danger`, `border-accent/50`, etc.

`.surface-card` / `.surface-card-elevated` use the same gradient tokens.

## Typography

- **Display + Body:** Plus Jakarta Sans (400, 500, 600, 700) via `next/font/google`
- **Mono:** ui-monospace stack for amounts (`tabular-nums`)
- **Scale:** `--text-xs` 0.75rem · `--text-sm` 0.875rem · `--text-md` 1rem · `--text-lg` 1.125rem · `--text-xl` 1.375rem · `--text-2xl` 1.75rem · `--text-display` clamp(1.75rem, 4vw + 0.5rem, 2.25rem)
- **Tracking:** `-0.02em` on headings

## Spacing

4-point named scale in `app/globals.css`: `--space-3xs` 0.25rem · `--space-2xs` 0.5rem · `--space-xs` 0.75rem · `--space-sm` 1rem · `--space-md` 1.5rem · `--space-lg` 2rem · `--space-xl` 3rem

## Motion

- `--ease-out`: cubic-bezier(0.16, 1, 0.3, 1)
- `--dur-short`: 180ms · `--dur-medium`: 280ms
- Reveal: opacity-only on load; no scroll-jacking
- Reduced motion: ≤150ms opacity crossfade
- **Segmented controls** (mobile bottom nav, theme picker): sliding accent pill, **300ms** `cubic-bezier(0.4, 0, 0.2, 1)`, `motion-reduce:transition-none`

## Microinteractions

- Silent success (no celebratory toasts)
- Hover tooltips: 800ms delay; focus: 0ms
- Buttons: translateY(1px) on active
- All interactive controls: 8 states (default, hover, focus-visible, active, disabled, loading, error, success)

## CTA voice

- **Primary:** filled accent, `rounded-xl`, min-h-11, font-medium
- **Secondary:** border rule, surface fill, hover bg shift
- **Ghost:** accent text, subtle hover wash

## Per-page allowances

- Glass panels on app chrome, filter bars, mobile nav track (neutral glass; accent only on active tab pill)
- App pages: no hero enrichment, no decorative imagery
- Marketing: mesh gradient only

## App chrome

### Mobile bottom nav (`components/app-shell.tsx`)

- Fixed bar: `glass-panel-light`, `rounded-2xl`, safe-area padding
- **Track:** neutral glass — not full-width accent
- **Active tab:** accent pill slides horizontally (`translate3d`, 25% width per item); label + icon **white** on active, `text-text-muted` on inactive
- Routes: Home, Expenses, Add, More (Settings section highlights **More**)

### Theme picker (`components/theme-toggle.tsx`)

- Settings → **Appearance**: Light / Dark / System
- Same sliding-pill pattern as bottom nav (3 columns, accent pill, white active label)

## What pages MUST share

- Plus Jakarta Sans
- Teal accent placement (≤5% per viewport)
- Card surface pattern (`Card` component)
- CTA button shapes
- 44px+ tap targets

## What pages MAY differ on

- Section density within Workbench family
- Filter vs form vs list emphasis per route

## Exports

See `app/globals.css` `@theme inline` block — mirrors all semantic color and font tokens for Tailwind v4.
