# PoysaPath

Personal cash-flow tracker for Bangladesh — log income and expenses in BDT, set budgets and goals, and optionally use Gemini AI for quick entry, Money Coach, and monthly reports.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Copy `.env.example` to `.env.local` and add your Supabase credentials (see [docs/DEPLOY.md](docs/DEPLOY.md)).

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/planning.md](docs/planning.md) | Product, routes, security, Gemini |
| [docs/planning-db.md](docs/planning-db.md) | Schema, RLS, migrations |
| [docs/planning-design.md](docs/planning-design.md) | UX flows and screens |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Vercel + Supabase deploy |
| [design.md](design.md) | Design system tokens |

## Stack

Next.js App Router · TypeScript · Tailwind · Supabase · Google Gemini (optional, BYOK)
