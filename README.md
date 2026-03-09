# Clutch — Your AI Money Coach

Clutch is an AI-powered personal finance app built for students and young adults. Instead of just showing you charts, it acts as a decision-support system — understanding your spending, predicting problems before they happen, and giving plain-English advice when you need it most.

---

## Features

**"Should I Buy This?"**
Ask Clutch before any purchase. It evaluates your remaining budget, active goals, and spending history, then gives you a clear YES / MAYBE / NO with an honest explanation.

**Financial Health Score**
A living score that reflects how balanced and consistent your spending is. Every change is explained, not just displayed.

**Smart Insights**
Clutch detects habits, flags unusual spending, and forecasts whether you'll run out of money before the month ends — automatically.

**Adaptive Budgeting**
Set a monthly budget with per-category limits. Clutch tracks velocity and warns you when you're trending over.

**Weekly Money Review**
Every Sunday, a short AI-written summary of where your money went and one thing you can do better next week.

**Micro-Challenges**
Short, targeted spending challenges (e.g. "Keep food under ₹500 this week") to build habits through small wins.

**Expense Splits**
Split any expense with friends, track balances, and mark settlements — attached directly to the original expense.

**AI Auto-Categorization**
Skip selecting a category when logging an expense. Provide a description and Claude 3 Haiku classifies it instantly. The response includes an `autoCategorized` flag so the UI can prompt a one-tap correction if needed.

**Push Notifications**
Real-time budget alerts and weekly review nudges delivered to your device.

---

## Tech Stack

| Layer    | Technology                        |
| -------- | --------------------------------- |
| Frontend | React + TypeScript + Tailwind CSS |
| Backend  | Node.js + Express + TypeScript    |
| Database | PostgreSQL (Supabase)             |
| Auth     | Supabase Auth                     |
| AI       | Anthropic Claude                  |
| Push     | Firebase Cloud Messaging          |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is fine)
- An [Anthropic API key](https://console.anthropic.com/)
- A Firebase project with Admin SDK credentials

### 1. Clone and install

```bash
git clone https://github.com/your-username/clutch.git
cd clutch
cd backend && npm install
cd ../frontend && npm install
```

### 2. Set up the database

In the Supabase SQL Editor, run the contents of `init.sql`. This creates all tables and sets up the trigger that auto-creates a user profile on signup.

### 3. Configure environment variables

Create `backend/.env`:

```env
PORT=3001
DATABASE_URL="postgres://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
ANTHROPIC_API_KEY=sk-ant-...
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Run

```bash
# Backend (API server)
cd backend && npm run dev

# Background worker (cron jobs)
cd backend && npm run dev:worker

# Frontend
cd frontend && npm run dev
```

The backend runs at `http://localhost:3001` and the frontend at `http://localhost:5173`.

---

## Philosophy

> Good financial habits form when decisions are explained, not enforced.

Clutch is built around guidance over restriction — helping users build confidence around money rather than anxiety.