# Wagner Tool Management

Admin tool tracking system for **Wagner Vehicle Management Limited** — manage shop inventory, record tool check-outs and returns, and view audit history.

## Stack

- Next.js 16, React 19, TypeScript
- Convex (database + backend)
- Tailwind CSS 4, shadcn/ui
- TanStack React Table

## Getting started

### 1. Install dependencies

```bash
npm installcreate
```

### 2. Start Convex + Next.js

```bash
npm run dev:full
```

On first run, follow the Convex CLI prompts to create/link a project. This writes `NEXT_PUBLIC_CONVEX_URL` to `.env.local`.

### 3. Initialize the system

Open [http://localhost:3000/admin/setup](http://localhost:3000/admin/setup) and create the first admin account. Sample tools, technicians, and categories are seeded automatically.

### 4. Sign in

Go to [http://localhost:3000/login](http://localhost:3000/login) and use your admin credentials.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js only |
| `npm run dev:full` | Convex + Next.js together |
| `npm run build` | Production build |
| `npm run convex:deploy` | Deploy Convex backend |

## Environment variables

Copy `.env.example` to `.env.local`:

- `NEXT_PUBLIC_CONVEX_URL` — Convex deployment URL
- `CONVEX_DEPLOYMENT` — Convex deployment name
- `SEED_SECRET` — optional, for CLI seed script

## Features (MVP)

- Admin authentication (email + password, session cookies)
- Tools CRUD with categories and status
- Technicians CRUD
- Admin-mediated check-out and return
- Live dashboard with stats and recent activity
- Transaction log with date filters and CSV export
- Reports: who has what, overdue tools, utilization

## Deployment

1. `npx convex deploy` — production Convex backend
2. Deploy Next.js to Vercel with `NEXT_PUBLIC_CONVEX_URL` set
