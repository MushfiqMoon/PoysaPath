# UI suggestions (post-deployment)

> **Last updated:** May 18, 2026  
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
- [ ] **P2 — Active tab animation** — Subtle scale or underline on active route.

---

## Dashboard

- [ ] **P1 — Pull-to-refresh** — Refresh totals on mobile.
- [ ] **P2 — Insight card skeleton** — Match loaded card height to reduce layout shift.

---

## Add expense

- [ ] **P2 — Parse success flash** — Brief highlight on fields filled by Gemini (**Quick tab only**).
- [ ] **P2 — Remember last tab** — Quick vs Manual preference in `localStorage`.
- [ ] **P2 — Amount keypad focus** — Auto-focus amount on Manual tab open.

---

## Expenses list

- [ ] **P1 — Swipe actions** — Swipe row to edit/delete on mobile.
- [ ] **P2 — Sticky date headers** — While scrolling grouped list.

---

## Categories & budgets

- [ ] **P2 — Category color dots** — Visual distinction in picker and breakdown.
- [ ] **P2 — Budget progress ring** — On dashboard or budgets page.

---

## Settings & auth

- [ ] **P1 — Re-enable CSV block** — When product wants export in UI again.
- [ ] **P2 — Theme toggle** — Light/dark if not already system-only.

---

## Accessibility

- [ ] **P1 — Focus order on Add** — Logical tab order through form.
- [ ] **P2 — Screen reader labels** — Category picker and insight refresh button.

---

## Related

- [feature-improvements.md](./feature-improvements.md)
- [../planning-design.md](../planning-design.md)
