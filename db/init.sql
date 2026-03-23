-- init.sql — v2
-- Run this once against a fresh Supabase project.
-- Schema covers exactly what be-integration.md defines — nothing more.

-- ============================================================
-- users
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    monthly_income NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    device_token TEXT,
    preferences JSONB DEFAULT '{}',        -- { spendingAlerts, goalReminders, challengeNudges, appLock }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger: auto-insert user profile on Supabase signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', 'User'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- expenses  (§5 Expenses)
-- ============================================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    tag TEXT,                              -- human-readable label (e.g. "chaat")
    description TEXT,                      -- kept as alias for tag
    confidence INTEGER DEFAULT 100,        -- 0–100, from POST /expenses/categorize
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category  ON expenses(user_id, category);

-- ============================================================
-- budgets  (§4 Budget)
-- ============================================================
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month TEXT NOT NULL,                   -- 'YYYY-MM', derived from start_date
    total_income NUMERIC DEFAULT 0,        -- kept for health-score service
    category_limits JSONB DEFAULT '{}',    -- kept for health-score service
    amount NUMERIC(12,2),                  -- canonical budget amount from frontend
    currency TEXT DEFAULT 'INR',
    start_date DATE,
    end_date DATE,
    distribution TEXT DEFAULT 'distribute', -- 'distribute' | 'carryover'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);
CREATE INDEX IF NOT EXISTS idx_budgets_user_dates ON budgets(user_id, start_date, end_date);

-- ============================================================
-- savings_goals  (§7 Goals)
-- ============================================================
CREATE TABLE savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,                   -- API exposes as 'name'
    target_amount NUMERIC NOT NULL,
    saved_amount NUMERIC DEFAULT 0,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,  -- API exposes as 'targetDate'
    monthly_contribution NUMERIC DEFAULT 0,
    icon_key TEXT DEFAULT 'savings',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- health_scores  (§11 Health Score)
-- ============================================================
CREATE TABLE health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    factors JSONB NOT NULL,
    explanation TEXT NOT NULL,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- weekly_reviews + batch_jobs  (worker-internal, not exposed via API)
-- ============================================================
CREATE TABLE weekly_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    week_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE batch_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'processing', -- processing | completed | failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- challenges  (§8 Challenges)
-- ============================================================
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,                   -- legacy; API uses 'name'
    name TEXT,
    description TEXT NOT NULL,
    target_amount NUMERIC,
    category TEXT,
    duration_days INTEGER NOT NULL,
    icon_key TEXT DEFAULT 'emoji_events',
    reward TEXT,
    reward_icon_key TEXT DEFAULT 'workspace_premium',
    color_scheme TEXT DEFAULT 'primary',   -- 'primary' | 'tertiary'
    difficulty TEXT DEFAULT 'medium'       -- 'easy' | 'medium' | 'hard'
);

CREATE TABLE user_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenges(id),
    status TEXT DEFAULT 'active',          -- active | completed | failed
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Row Level Security — blocks direct anon-key access
-- Node.js backend retains full access via pooled connection string
-- ============================================================
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals   ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_scores   ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews  ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_jobs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- updated_at auto-updater
-- ============================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_budgets_modtime
    BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_savings_goals_modtime
    BEFORE UPDATE ON savings_goals
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_user_challenges_modtime
    BEFORE UPDATE ON user_challenges
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
