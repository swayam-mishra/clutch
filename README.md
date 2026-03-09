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

**Push Notifications**
Real-time budget alerts and weekly review nudges delivered to your device.

---

## Tech Stack

| Layer    | Technology                        |
| -------- | --------------------------------- |
| Frontend | React + TypeScript + Tailwind CSS |
| Backend  | Node.js + Express + TypeScript    |
| Database | PostgreSQL (Neon)                 |
| AI       | Anthropic Claude                  |
| Auth     | JWT + bcrypt                      |
| Push     | Firebase Cloud Messaging          |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or a [Neon](https://neon.tech) connection string)
- An [Anthropic API key](https://console.anthropic.com/)
- A Firebase project with Admin SDK credentials

### 1. Clone and install

```bash
git clone https://github.com/your-username/clutch.git
cd clutch
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Set up the database

```bash
psql -U postgres -c "CREATE DATABASE clutch;"
psql -U postgres -d clutch -f init.sql
```

### 3. Configure environment variables

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/clutch
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
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

The backend runs at `http://localhost:5000` and the frontend at `http://localhost:5173`.

---

## Philosophy

> Good financial habits form when decisions are explained, not enforced.

Clutch is built around guidance over restriction — helping users build confidence around money rather than anxiety.