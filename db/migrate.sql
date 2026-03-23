-- migrate.sql
-- Run this against your Supabase project to align the schema with the v2 API spec.
-- Safe to run multiple times (uses IF NOT EXISTS / DROP NOT NULL where possible).

-- ============================================================
-- users: add preferences column
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- ============================================================
-- expenses: add tag + confidence columns
-- ============================================================
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS tag TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS confidence INTEGER DEFAULT 100;

-- ============================================================
-- budgets: add new columns for the v2 budget setup flow.
-- Keep total_income + category_limits for the AI/health-score services.
-- ============================================================
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2);
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS distribution TEXT DEFAULT 'distribute';
-- Make category_limits nullable (old required field, not needed in new flow)
ALTER TABLE budgets ALTER COLUMN category_limits DROP NOT NULL;
ALTER TABLE budgets ALTER COLUMN category_limits SET DEFAULT '{}';
ALTER TABLE budgets ALTER COLUMN total_income SET DEFAULT 0;

-- ============================================================
-- savings_goals: add icon_key
-- ============================================================
ALTER TABLE savings_goals ADD COLUMN IF NOT EXISTS icon_key TEXT DEFAULT 'savings';

-- ============================================================
-- challenges: add UI metadata columns
-- ============================================================
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS icon_key TEXT DEFAULT 'emoji_events';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS reward TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS reward_icon_key TEXT DEFAULT 'workspace_premium';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS color_scheme TEXT DEFAULT 'primary';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium';
-- Rename title → name at DB level (add name column, copy data, keep title for compat)
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS name TEXT;
UPDATE challenges SET name = title WHERE name IS NULL;
