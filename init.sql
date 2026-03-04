-- init.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    monthly_income NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    notifications_enabled BOOLEAN DEFAULT true,
    weekly_review_day TEXT DEFAULT 'Sunday',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    mood_tag TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: 'YYYY-MM'
    total_income NUMERIC NOT NULL,
    category_limits JSONB NOT NULL,
    UNIQUE(user_id, month)
);

CREATE TABLE savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_amount NUMERIC NOT NULL,
    saved_amount NUMERIC DEFAULT 0,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    monthly_contribution NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    factors JSONB NOT NULL,
    explanation TEXT NOT NULL,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
