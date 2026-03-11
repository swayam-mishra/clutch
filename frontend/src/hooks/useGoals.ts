import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiError } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Goal {
  id: number;
  user_id: string;
  title: string;
  target_amount: number;
  saved_amount: number;
  deadline: string;
  monthly_contribution?: number;
}

export interface CreateGoalInput {
  title: string;
  targetAmount: number;
  deadline: string;
  monthlyContribution?: number;
}

export interface UpdateGoalInput {
  id: number;
  title?: string;
  targetAmount?: number;
  deadline?: string;
  monthlyContribution?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errMsg(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGoals() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["goals"] });
    qc.invalidateQueries({ queryKey: ["challenges"] });
  };

  // ── GET ──────────────────────────────────────────────────────────────────
  const query = useQuery({
    queryKey: ["goals"],
    queryFn: () => apiFetch<Goal[]>("/api/goals"),
  });

  // ── POST (create) ─────────────────────────────────────────────────────────
  const createGoal = useMutation({
    mutationFn: (input: CreateGoalInput) =>
      apiFetch<Goal>("/api/goals", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Goal created.");
    },
    onError: (err) => toast.error(errMsg(err)),
  });

  // ── PUT (update metadata) ─────────────────────────────────────────────────
  const updateGoal = useMutation({
    mutationFn: ({ id, ...fields }: UpdateGoalInput) =>
      apiFetch<Goal>(`/api/goals/${id}`, {
        method: "PUT",
        body: JSON.stringify(fields),
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Goal updated.");
    },
    onError: (err) => toast.error(errMsg(err)),
  });

  // ── POST /:id/contribute (update saved_amount) ────────────────────────────
  const contributeToGoal = useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      apiFetch<Goal>(`/api/goals/${id}/contribute`, {
        method: "POST",
        body: JSON.stringify({ amount }),
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Contribution added!");
    },
    onError: (err) => toast.error(errMsg(err)),
  });

  return {
    goals: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    createGoal,
    updateGoal,
    contributeToGoal,
  };
}
