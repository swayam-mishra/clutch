import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiError } from "../lib/api";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../lib/authStore";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Split {
  split_id: number;
  split_with_name: string;
  amount_owed: number;
  is_settled: boolean;
  created_at: string;
  expense_description: string;
  total_expense_amount: number;
  date: string;
}

export interface CreateSplitInput {
  expenseId: number;
  splitWithName: string;
  amountOwed: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSplits() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const queryKey = ["splits"] as const;
  // Track settled state to detect transitions for toast
  const prevSettledIds = useRef<Set<number>>(new Set());

  // ── GET ────────────────────────────────────────────────────────────────────
  const query = useQuery({
    queryKey,
    queryFn: () => apiFetch<Split[]>("/api/splits"),
    enabled: !!userId,
  });

  // Keep prevSettledIds in sync with fetched data
  useEffect(() => {
    if (query.data) {
      prevSettledIds.current = new Set(
        query.data.filter((s) => s.is_settled).map((s) => s.split_id)
      );
    }
  }, [query.data]);

  const invalidate = () => qc.invalidateQueries({ queryKey });

  // ── Supabase Realtime ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`splits:user:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "splits",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          invalidate();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "splits",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as {
            id: number;
            is_settled: boolean;
            split_with_name: string;
            amount_owed: number;
          };

          // Detect settlement transition
          const wasSettled = prevSettledIds.current.has(updated.id);
          if (updated.is_settled && !wasSettled) {
            const amount = Number(updated.amount_owed).toLocaleString("en-IN");
            toast.success(`${updated.split_with_name} paid you ₹${amount}`, {
              duration: 5000,
            });
          }

          invalidate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── POST ───────────────────────────────────────────────────────────────────
  const createSplit = useMutation({
    mutationFn: (input: CreateSplitInput) =>
      apiFetch<Split>("/api/splits", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Split expense created.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  // ── SETTLE ─────────────────────────────────────────────────────────────────
  const settleSplit = useMutation({
    mutationFn: (splitId: number) =>
      apiFetch<Split>(`/api/splits/${splitId}/settle`, { method: "PUT" }),
    onSuccess: (data) => {
      invalidate();
      const amount = Number(data.amount_owed).toLocaleString("en-IN");
      toast.success(`Marked ₹${amount} from ${data.split_with_name} as settled.`);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  // ── Derived ────────────────────────────────────────────────────────────────
  const splits = query.data ?? [];
  const pendingCount = splits.filter((s) => !s.is_settled).length;
  const pendingAmount = splits
    .filter((s) => !s.is_settled)
    .reduce((sum, s) => sum + Number(s.amount_owed), 0);

  return {
    splits,
    pendingCount,
    pendingAmount,
    isLoading: query.isLoading,
    isError: query.isError,
    createSplit,
    settleSplit,
  };
}
