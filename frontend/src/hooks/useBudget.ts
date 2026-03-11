import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { apiFetch, ApiError } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategoryStatus {
  category: string;
  limit: number;
  spent: number;
  percentUsed: number;
  status: "safe" | "warning" | "over";
}

export interface BudgetStatus {
  month: string;
  totalBudget: number;
  totalSpent: number;
  dayOfMonth: number;
  daysRemaining: number;
  spendVelocity: number;
  projectedEndBalance: number;
  projectedRunOutDay: number;
  categoryStatus: CategoryStatus[];
}

export interface SetBudgetInput {
  month: string;
  totalIncome: number;
  categoryLimits: Record<string, number>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

export function useBudget(month: string) {
  const qc = useQueryClient();
  const queryKey = ["budget", month] as const;
  const warnedRef = useRef<Set<string>>(new Set());

  const query = useQuery({
    queryKey,
    queryFn: () => apiFetch<BudgetStatus>(`/api/budget/${month}/status`),
    // 404 = no budget set yet — treat as empty, don't retry
    retry: (_, err) =>
      err instanceof ApiError && err.status === 404 ? false : true,
  });

  // Fire warning toasts once per category per data load
  useEffect(() => {
    if (!query.data) return;
    for (const cat of query.data.categoryStatus) {
      if (cat.percentUsed >= 80 && !warnedRef.current.has(cat.category)) {
        warnedRef.current.add(cat.category);
        toast.warning(
          `${cat.category} is at ${cat.percentUsed}% of its budget limit.`,
        );
      }
    }
  }, [query.data]);

  // ── POST (upsert) ─────────────────────────────────────────────────────────
  const setBudget = useMutation({
    mutationFn: (input: SetBudgetInput) =>
      apiFetch<BudgetStatus>("/api/budget", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget"] });
      toast.success("Budget saved.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return {
    budgetStatus: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    noBudget:
      query.isError && query.error instanceof ApiError
        ? query.error.status === 404
        : false,
    setBudget,
  };
}
