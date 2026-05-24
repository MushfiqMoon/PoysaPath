# UI suggestions (post-deployment)



> **Last updated:** May 24, 2026  

> Design baseline: [planning-design.md](../planning-design.md)



| Priority | Meaning |

|----------|---------|

| **P0** | Trust or usability for most users |

| **P1** | Clear UX win |

| **P2** | Polish |



Status: `[ ]` open · `[x]` done



---



## Navigation



- [x] **P1 — Bottom nav icons** — `react-icons` in `app-shell.tsx` (Home, Expenses, Add, More).

- [x] **P2 — Active tab animation** — Sliding accent pill on glass track (`app-shell.tsx`); active tab white icon/label, inactive muted.

- [x] **P2 — Theme segmented control** — Sliding accent pill on Light / Dark / System (`theme-toggle.tsx`, Settings → Appearance).



---



## Dashboard



- [x] **P1 — Pull-to-refresh** — Refresh totals on mobile.

- [x] **P2 — Insight card skeleton** — Match loaded card height to reduce layout shift.



---



## Add expense



- [x] **P2 — Parse success flash** — Brief highlight on fields filled by Gemini (**Quick tab only**).

- [x] **P2 — Remember last tab** — Quick vs Manual preference in `localStorage`.

- [x] **P2 — Amount keypad focus** — Auto-focus amount on Manual tab open.



---



## Expenses list



- [x] **P1 — Swipe actions** — Swipe row to edit/delete on mobile.

- [x] **P2 — Sticky date headers** — While scrolling grouped list.



---



## Categories & budgets



- [ ] **P2 — Category color dots** — Removed (hash-based dots caused confusion; categories use name + icon only).

- [x] **P2 — Budget progress ring** — On dashboard or budgets page.



---



## Settings & auth



- [ ] **P1 — Re-enable CSV block** — Deferred (API remains at `GET /api/export/csv`).

- [x] **P2 — Theme toggle** — Light/dark/system in Settings (sliding pill UI).

- [x] **P2 — Gradient borders** — `border-border` / `border-border-soft` utilities in `app/globals.css` (teal-tinted gradient; hover via `--border-gradient-hover`).



---



## Accessibility



- [x] **P1 — Focus order on Add** — Logical tab order through form.

- [x] **P2 — Screen reader labels** — Category picker and insight refresh button.



---



## Related



- [feature-improvements.md](./feature-improvements.md)

- [../planning-design.md](../planning-design.md)

