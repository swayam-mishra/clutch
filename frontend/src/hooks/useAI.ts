import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiError } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AIVerdict = "YES" | "MAYBE" | "NO";

export interface ShouldIBuyInput {
  itemDescription: string;
  amount: number;
}

export interface ShouldIBuyResult {
  verdict: AIVerdict;
  explanation: string;
  tip: string;
  contextUsed: {
    remainingBudget: number;
    daysLeft: number;
    dailyVelocity: number;
  };
}

export interface AutoCategorizeInput {
  description: string;
  amount: number;
}

export interface AutoCategorizeResult {
  category: string;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start_date: string;
  summary: string;
  highlights: string[];
  created_at: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAI() {
  const shouldIBuy = useMutation({
    mutationFn: (input: ShouldIBuyInput) =>
      apiFetch<ShouldIBuyResult>("/api/ai/purchase-advisor", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onError: (err) => toast.error(errorMessage(err)),
  });

  const autoCategorize = useMutation({
    mutationFn: (input: AutoCategorizeInput) =>
      apiFetch<AutoCategorizeResult>("/api/ai/categorize", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    // Silent — caller handles the result; only surface errors
    onError: (err) => toast.error(`Auto-categorize failed: ${errorMessage(err)}`),
  });

  const weeklyReviewQuery = useQuery({
    queryKey: ["ai", "weekly-review"],
    queryFn: () => apiFetch<WeeklyReview>("/api/ai/weekly-review"),
    retry: false, // 404 = no review yet, don't retry
  });

  return { shouldIBuy, autoCategorize, weeklyReview: weeklyReviewQuery };
}
