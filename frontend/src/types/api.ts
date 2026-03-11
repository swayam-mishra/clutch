// ─── Shared API response types ────────────────────────────────────────────────
// All types are re-exported from their canonical hook files, plus any extras.

// ── Auth ──────────────────────────────────────────────────────────────────────
export type { AuthUser } from "../lib/api";

// ── Expenses ──────────────────────────────────────────────────────────────────
export type {
  Expense,
  AddExpenseInput,
  EditExpenseInput,
} from "../hooks/useExpenses";

// ── Budget ────────────────────────────────────────────────────────────────────
export type {
  CategoryStatus,
  BudgetStatus,
  SetBudgetInput,
} from "../hooks/useBudget";

// ── AI ────────────────────────────────────────────────────────────────────────
export type {
  AIVerdict,
  ShouldIBuyInput,
  ShouldIBuyResult,
  AutoCategorizeInput,
  AutoCategorizeResult,
} from "../hooks/useAI";

// ── Health Score ──────────────────────────────────────────────────────────────
export type {
  ScoreFactors,
  HealthScoreData,
  HealthScoreTrendPoint,
} from "../hooks/useHealthScore";

// ── Goals ─────────────────────────────────────────────────────────────────────
export type {
  Goal,
  CreateGoalInput,
  UpdateGoalInput,
} from "../hooks/useGoals";

// ── Challenges ────────────────────────────────────────────────────────────────
export type {
  ActiveChallenge,
  AvailableChallenge,
  ChallengeHistory,
} from "../hooks/useChallenges";

// ── Splits ────────────────────────────────────────────────────────────────────
export type { Split, CreateSplitInput } from "../hooks/useSplits";

// ── Notifications ─────────────────────────────────────────────────────────────
export type { NotificationStatus } from "../hooks/useNotifications";

// ── Insights ──────────────────────────────────────────────────────────────────

export interface Anomaly {
  id: string;
  category: string;
  description: string;
  amount: number;
  average: number;
  percentAbove: number;
  date: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  trend: "up" | "down" | "flat";
  value: number;
  unit: string;
}
