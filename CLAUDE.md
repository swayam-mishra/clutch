# Clutch — Claude Code Context

## Stack
- Frontend: React 18, TypeScript, Vite, Tailwind v4, Radix UI (port 5173)
- Backend: Express + Node.js + TypeScript (port 3001), separate worker process
- DB: PostgreSQL via Supabase (pooled, port 6543)
- AI: Anthropic SDK — claude-3-haiku-* for categorization & decisions

## Key Rules
- ALL DB queries must go through Node.js backend (RLS blocks direct Supabase API)
- Never bypass the worker process for heavy scheduled tasks
- Use pooled Supabase connection string, not direct
- Timestamps must use UTC: DATE_TRUNC('month', date AT TIME ZONE 'UTC')

## File Structure
- /backend — Express API (server.ts entry)
- /frontend — Vite React app
- /backend/worker.ts — Dedicated worker process

## Cost Constraints
- Use claude-haiku-* for categorization (high volume)
- Use claude-sonnet-* only for "Should I Buy This?" decisions
- Always use prompt caching on system prompts