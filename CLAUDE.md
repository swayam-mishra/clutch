# Clutch Backend — Claude Code Context

This is the **backend API** for Clutch. The Flutter mobile app lives in a separate repo.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js, TypeScript 5.9 |
| Framework | Express 5 |
| Database | PostgreSQL via Supabase (pooled connection, port 6543) |
| Auth | Supabase Auth (JWT Bearer tokens) |
| AI | Anthropic SDK — claude-haiku for categorization/chat, claude-sonnet for decisions |
| Notifications | Firebase Cloud Messaging (FCM) via firebase-admin |
| Cache | node-cache (process-local, 5-min TTL) |

---

## Commands

```bash
npm run dev          # ts-node-dev hot-reload API server (port 3001)
npm run dev:worker   # Run background cron worker as a separate process
npm run build        # tsc → dist/
npm start            # node dist/server.js
node dist/worker.js  # Start compiled worker in production
```

No test suite currently.

---

## File Structure

```
src/
  server.ts           — Express entry: CORS, middleware, route registration
  worker.ts           — Cron job entry (run as a separate process — never in API process)
  config/
    db.ts             — pg Pool (max 10 conns, SSL, 30 s idle timeout)
    supabase.ts       — Supabase client for auth token validation
    ai.ts             — Anthropic SDK init
  middleware/
    auth.middleware.ts — Validates Bearer JWT via supabase.auth.getUser(); attaches req.user
  controllers/        — One file per domain (expense, budget, ai, goals, splits, …)
  routes/             — One file per domain; mounted under /api/<domain>
  services/
    financeContext.service.ts — Builds full user financial snapshot (5-min node-cache)
    healthScore.service.ts    — 0–100 score: budget adherence + velocity + consistency
  jobs/
    nudge.cron.ts     — Daily budget nudges, weekly batch reviews, Batch API poller

db/
  init.sql            — Full PostgreSQL schema (run once against Supabase project)
```

---

## Environment Variables

Copy `.env.example` → `.env` and fill in values.

```
DATABASE_URL=          # Supabase pooled connection string (port 6543, NOT 5432)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
FRONTEND_URL=          # CORS allow-list origin
PORT=3001              # Optional, defaults to 3001
```

---

## Key Rules

- **`req.user.id` is always a Supabase UUID string** — never cast it to a number; pass directly as a `$1` parameter in pg queries.
- **`categoryLimits` is JSONB** — stored in the `budgets` table as `category_limits JSONB`. Read/write as a plain JS object; no ORM mapping.
- **Cache is process-local** — `node-cache` in `financeContext.service.ts` lives in the API process only. The worker process has no shared cache. If you add a second API instance, the cache will diverge — use Redis instead.
- **Always use pooled connection** (port 6543), not the direct Supabase connection (5432).
- **Timestamps must be UTC:** `DATE_TRUNC('month', date AT TIME ZONE 'UTC')` — never assume local time.
- **Worker process is separate** — never `import` cron jobs into `server.ts`. Run `worker.ts` as its own process.
- **Auth flow:** Supabase issues JWT → client sends as `Authorization: Bearer <token>` → `auth.middleware.ts` validates with `supabase.auth.getUser()`.

---

## AI Cost Constraints

| Use Case | Model | Reason |
|----------|-------|--------|
| Expense categorization (per-add) | `claude-haiku-*` | High volume, simple task |
| "Should I Buy?" decisions | `claude-sonnet-*` | Needs reasoning quality |
| Weekly review batch | `claude-haiku-*` via Batch API | 50% cost reduction |
| Chat coach | `claude-haiku-*` | Conversational, high frequency |

- **Always use prompt caching** (`cache_control: { type: "ephemeral" }`) on static system prompts.
- Weekly reviews use the Anthropic Batch API — jobs are tracked in the `batch_jobs` table.

---

## Architectural Decisions

- **Financial context cache:** `financeContext.service.ts` caches the full user snapshot for 5 min. It is invalidated explicitly on mutations (add/edit/delete expense, set budget). This is the single source of truth for all AI prompts — don't bypass it.
- **Health score formula:** budget adherence (40 pts) + velocity / projected-run-out (30 pts) + logging consistency (30 pts).
- **Browser cache:** All GET responses get `Cache-Control: private, max-age=300` (5 min) set in `server.ts`.
- **Splits realtime:** `splits` table has Supabase Realtime enabled on the `supabase_realtime` publication.

---

## Database Tables

`users`, `expenses`, `budgets` (JSONB category limits), `savings_goals`, `health_scores`, `weekly_reviews`, `batch_jobs`, `challenges`, `user_challenges`, `splits`

RLS is enabled on all tables. Schema lives in `db/init.sql`.
