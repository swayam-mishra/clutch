# Clutch — Claude Code Context

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18.3, TypeScript, Vite 6, Tailwind v4, Radix UI, Recharts |
| Backend | Express 5, Node.js, TypeScript 5.9 |
| Database | PostgreSQL via Supabase (pooled connection, port 6543) |
| Auth | Supabase Auth (JWT Bearer tokens) |
| AI | Anthropic SDK — claude-haiku for categorization, claude-sonnet for decisions |
| State | TanStack Query (server), Zustand (client auth) |
| Notifications | Firebase Cloud Messaging (FCM) |

**Ports:** Frontend → 5173, Backend → 3001 (vite proxy points to 5000 in config — verify `.env`)

---

## Commands

```bash
# Backend
cd backend
npm run dev          # ts-node-dev, hot-reload API server
npm run dev:worker   # Run background cron worker separately
npm run build        # tsc → dist/
npm start            # node dist/server.js

# Frontend
cd frontend
npm run dev          # Vite dev server
npm run build        # Production build

# No test suite currently
```

---

## File Structure

```
/backend/src/
  server.ts           — Express entry, CORS, routes registration
  worker.ts           — Cron job entry (run as separate process)
  config/
    db.ts             — pg Pool (max 10 conns, SSL, 30s idle timeout)
    supabase.ts       — Supabase client for auth
    ai.ts             — Anthropic SDK init
  middleware/
    auth.middleware.ts — Bearer JWT validation via Supabase
  controllers/        — One controller per domain (expense, budget, ai, goals, …)
  routes/             — One routes file per domain
  services/
    financeContext.service.ts — Builds full user financial snapshot (5-min NodeCache)
    healthScore.service.ts    — 0-100 score: budget adherence, velocity, consistency
  jobs/
    nudge.cron.ts     — Daily budget nudges, weekly batch reviews, batch poller

/frontend/src/
  app/
    App.tsx           — Root, Supabase session validation on mount
    routes.tsx        — React Router: public (/, /auth) + protected (/dashboard/*)
    components/
      dashboard/      — All dashboard feature pages + DashboardSidebar
      ui/             — Radix UI wrappers (60+ shadcn-style components)
  hooks/              — One hook per domain (useExpenses, useBudget, useAI, …)
  lib/
    api.ts            — apiFetch: adds auth header, 5s timeout, ApiError class
    authStore.ts      — Zustand: "loading" | "authenticated" | "unauthenticated"
    supabase.ts       — Supabase browser client
  types/api.ts        — Shared TypeScript types
```

---

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=         # Supabase pooled connection string (port 6543)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
FRONTEND_URL=         # For CORS allow-list
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=         # Backend base URL
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Key Rules

- **All DB queries through Node backend** — RLS blocks direct Supabase API calls from frontend
- **Worker process is separate** — Never run heavy cron jobs in the API process
- **Always use pooled Supabase connection** (port 6543), not the direct connection
- **Timestamps must be UTC:** `DATE_TRUNC('month', date AT TIME ZONE 'UTC')`
- **Auth flow:** Supabase issues JWT → frontend sends as `Authorization: Bearer <token>` → backend validates with `supabase.auth.getUser()`

---

## AI Cost Constraints

| Use Case | Model | Reason |
|----------|-------|--------|
| Expense categorization (per-add) | `claude-haiku-*` | High volume, simple task |
| "Should I Buy?" decisions | `claude-sonnet-*` | Needs reasoning quality |
| Weekly review batch | `claude-haiku-*` via Batch API | 50% cost reduction |
| Chat coach | `claude-haiku-*` | Conversational, high frequency |

- **Always use prompt caching** (`cache_control: { type: "ephemeral" }`) on static system prompts
- Weekly reviews use Anthropic Batch API — jobs tracked in `batch_jobs` table

---

## Architectural Decisions

- **Financial context cache:** `financeContext.service.ts` caches the full user snapshot for 5 min using `node-cache`. Invalidated explicitly on mutations (add/edit/delete expense, set budget). Don't bypass this — it's the single source of truth for all AI prompts.
- **Health score formula:** budget adherence (40pts) + velocity/projected-run-out (30pts) + logging consistency (30pts).
- **Browser cache:** All GET responses get `Cache-Control: max-age=300` (5 min). TanStack Query handles client-side deduplication.
- **No Firebase auth in use** — `frontend/src/lib/firebase.ts` exists but auth flows through Supabase. FCM is only for push notification device tokens.
- **Vite proxy mismatch:** `vite.config.ts` proxies `/api` to port 5000, but `VITE_API_URL` controls where `apiFetch` sends requests. Confirm `.env` aligns with the running backend port.
- **Splits realtime:** `splits` table has Supabase Realtime enabled (`supabase_realtime` publication).

---

## Database Tables

`users`, `expenses`, `budgets` (JSONB category limits), `savings_goals`, `health_scores`, `weekly_reviews`, `batch_jobs`, `challenges`, `user_challenges`, `splits`

RLS is enabled on all tables. Schema lives in `/init.sql`.
