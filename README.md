# Clutch Backend

REST API for the Clutch personal finance app. Built with Node.js, Express, TypeScript, and Supabase/PostgreSQL.

The Flutter mobile frontend lives in a separate repository.

---

## Prerequisites

- Node.js 20+
- A Supabase project (for database + auth)
- An Anthropic API key

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in all values in .env

# 3. Initialise the database (run once against your Supabase project)
# Paste db/init.sql into the Supabase SQL editor or run via psql:
psql "$DATABASE_URL" -f db/init.sql
```

---

## Running

```bash
# Development (hot-reload)
npm run dev

# Background worker (cron jobs — run in a separate terminal)
npm run dev:worker

# Production
npm run build
npm start
node dist/worker.js   # worker in production
```

The API listens on port `3001` by default (override with `PORT` env var).

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase pooled connection string — **must use port 6543** |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (used by worker) |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `FRONTEND_URL` | Allowed CORS origin (e.g. `http://localhost:5173`) |
| `PORT` | Optional — defaults to `3001` |

---

## Project Structure

```
src/
  server.ts          — Express entry point
  worker.ts          — Cron worker entry (separate process)
  config/            — DB pool, Supabase client, Anthropic SDK
  middleware/        — JWT auth middleware
  controllers/       — Request handlers, one per domain
  routes/            — Route definitions, mounted under /api/*
  services/          — Finance context cache, health score calculation
  jobs/              — Cron jobs (nudges, weekly batch reviews)
db/
  init.sql           — PostgreSQL schema
```

---

## API Routes

| Prefix | Domain |
|--------|--------|
| `/api/auth` | User profile |
| `/api/expenses` | Expense CRUD |
| `/api/budget` | Budget management |
| `/api/ai` | AI coach & "Should I Buy?" |
| `/api/health-score` | Financial health score |
| `/api/insights` | Spending insights |
| `/api/goals` | Savings goals |
| `/api/notifications` | FCM device tokens |
| `/api/challenges` | Spending challenges |
| `/api/splits` | Bill splitting |
| `/api/health` | Health check |

All routes except `/api/health` require a valid Supabase JWT in the `Authorization: Bearer <token>` header.
