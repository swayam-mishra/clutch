# Clutch — Your AI Money Coach

Clutch is an AI-powered personal finance application designed for students and young adults who want clarity and control over their money—without becoming finance experts.

Unlike traditional budgeting apps that focus on tracking and charts, Clutch acts as a **decision-support system**. It understands spending behavior, anticipates problems, and explains financial trade-offs in plain language, helping users make better money decisions in real time.

---

## Problem Statement

For students and first-time earners, money management breaks down for predictable reasons:

* Small, frequent expenses go unnoticed
* Spending patterns are recognized too late
* Budgets feel rigid and unrealistic
* Users don’t know whether a purchase is actually affordable
* Most apps present numbers without guidance

As a result, users overspend early, panic later, and fail to build sustainable habits.

---

## Solution

Clutch shifts responsibility from the user to the system.

Instead of asking users to interpret dashboards, Clutch:

* Detects habits automatically
* Predicts future outcomes
* Explains *why* something is happening
* Suggests *what to do next*

The product is designed to feel like a calm, intelligent money coach—present, contextual, and non-judgmental.

---

## Core Features

### Smart Expense Understanding

* Minimal-effort expense capture
* Automatic classification
* Pattern-based organization instead of raw categories

### Adaptive Budgeting

* Budgets adjust dynamically based on behavior
* Weekly and category limits optimized for sustainability
* Designed to adapt, not punish

### Predictive Money Insights

* Detects overspending trends early
* Predicts potential fund shortages
* Flags risky behavior *before* it becomes a problem

### “Should I Buy This?” Decision Assistant

A real-time purchase advisor that evaluates:

* Remaining budget
* Spending patterns
* Savings goals
* Past behavior in similar situations

Provides clear, reasoned recommendations:

* Yes (with adjustments)
* Wait
* No (with explanation)

This is the core interaction that makes Clutch feel personal.

### Financial Health Score

* A living score reflecting spending balance and consistency
* Every change is explained
* Focuses on learning, not perfection

### Weekly Money Review

A concise narrative summary covering:

* Where money actually went
* What changed compared to last week
* One actionable improvement

No spreadsheets. No noise.

### Micro-Challenges

* Short, targeted spending challenges (e.g. "Spend under ₹500 on food this week")
* Tracks real-time progress against each challenge
* Builds habits through achievable goals

### Expense Splits

* Split any expense with friends or contacts
* Track who owes what and mark settlements
* Attached directly to individual expense records

---

## How Clutch Is Different

| Typical Finance Apps | Clutch                  |
| -------------------- | ----------------------- |
| Expense tracking     | Behavior understanding  |
| Static budgets       | Adaptive budgets        |
| Historical data      | Predictive insights     |
| Charts & dashboards  | Explanations & guidance |
| User interprets      | System interprets       |

---

## Tech Stack

| Layer     | Technology                                 |
| --------- | ------------------------------------------ |
| Runtime   | Node.js + TypeScript                       |
| Framework | Express.js v5                              |
| Database  | PostgreSQL                                 |
| AI        | Anthropic Claude (`@anthropic-ai/sdk`)     |
| Auth      | Firebase Admin SDK + JWT + bcrypt          |
| Push      | Firebase Cloud Messaging (device tokens)   |
| Scheduler | `node-cron` (nudge & review jobs)          |
| Dev tools | `ts-node-dev`, `nodemon`, TypeScript 5     |

---

## Project Structure

```
Clutch/
├── init.sql                  # Database schema (PostgreSQL)
├── package.json              # Root-level shared dependencies
└── backend/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── server.ts         # Express app entry point
        ├── config/
        │   ├── ai.ts         # Anthropic client setup
        │   └── db.ts         # PostgreSQL pool setup
        ├── controllers/      # Route handler logic
        │   ├── ai.controller.ts
        │   ├── auth.controller.ts
        │   ├── budget.controller.ts
        │   ├── challenges.controller.ts
        │   ├── expense.controller.ts
        │   ├── goals.controller.ts
        │   ├── healthScore.controller.ts
        │   ├── insights.controller.ts
        │   ├── notifications.controller.ts
        │   └── splits.controller.ts
        ├── jobs/
        │   └── nudge.cron.ts # Scheduled nudge & review tasks
        ├── middleware/
        │   └── auth.middleware.ts
        ├── routes/           # Express router definitions
        └── services/
            ├── financeContext.service.ts
            └── healthScore.service.ts
```

---

## API Reference

All routes are prefixed with `/api`.

| Method          | Endpoint          | Description                             |
| --------------- | ----------------- | --------------------------------------- |
| GET             | `/health`         | Server health check                     |
| POST            | `/auth/...`       | Register, login, token refresh          |
| GET/POST/DELETE | `/expenses`       | Log, fetch, and delete expenses         |
| GET/POST        | `/budget`         | Read and set monthly budgets            |
| POST            | `/ai/ask`         | "Should I buy this?" AI advisor         |
| POST            | `/ai/review`      | Generate weekly money review            |
| GET             | `/health-score`   | Fetch latest financial health score     |
| GET             | `/insights`       | Predictive spending insights            |
| GET/POST        | `/goals`          | Manage savings goals                    |
| GET             | `/notifications`  | Fetch user notifications                |
| GET/POST        | `/challenges`     | Browse and join micro-challenges        |
| GET/POST        | `/splits`         | Create and manage expense splits        |

---

## Database Schema

Core tables defined in `init.sql`:

| Table             | Purpose                                           |
| ----------------- | ------------------------------------------------- |
| `users`           | User profiles, income, currency, preferences      |
| `expenses`        | Individual expense records with mood tags         |
| `budgets`         | Monthly budgets with per-category JSONB limits    |
| `savings_goals`   | Savings targets with deadlines and contributions  |
| `health_scores`   | Computed financial health scores with explanation |
| `weekly_reviews`  | AI-generated weekly narrative summaries           |
| `challenges`      | Challenge definitions (title, category, duration) |
| `user_challenges` | Per-user challenge enrollment and progress        |
| `splits`          | Split records linked to expenses                  |

---

## Target Users

* Students managing allowances or pocket money
* Young adults on their first income
* Users who value clarity over complexity
* People who struggle with consistency, not intent

---

## Product Philosophy

> Good financial habits form when decisions are explained, not enforced.

Clutch prioritizes guidance over restriction, helping users build confidence around money rather than anxiety.

---

## Getting Started

### Prerequisites

* Node.js 18+
* PostgreSQL 14+
* An [Anthropic API key](https://console.anthropic.com/)
* A Firebase project with Admin SDK credentials

### 1. Clone the repo

```bash
git clone https://github.com/your-username/clutch.git
cd clutch
```

### 2. Set up the database

```bash
psql -U postgres -c "CREATE DATABASE clutch;"
psql -U postgres -d clutch -f init.sql
```

### 3. Configure environment variables

Create `backend/.env`:

```env
# Server
PORT=3001

# PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/clutch

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# JWT
JWT_SECRET=your_jwt_secret

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Install dependencies

```bash
# Root
npm install

# Backend
cd backend && npm install
```

### 5. Run the development server

```bash
cd backend
npm run dev
```

The server starts at `http://localhost:3001`. Confirm it is running by hitting `/api/health`.

### Build for production

```bash
cd backend
npm run build   # Compiles TypeScript → dist/
npm start       # Runs dist/server.js
```

---