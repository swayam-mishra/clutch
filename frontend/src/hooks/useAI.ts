import { useMutation } from "@tanstack/react-query";
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

  return { shouldIBuy, autoCategorize };
}
