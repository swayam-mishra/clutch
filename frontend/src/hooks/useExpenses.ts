import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiError } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Expense {
  id: number;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

export interface AddExpenseInput {
  amount: number;
  description: string;
  category?: string;
  date?: string;
}

export interface EditExpenseInput {
  id: number;
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
}

interface ExpensesResponse {
  expenses: Expense[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

export function useExpenses(params?: { month?: string }) {
  const qc = useQueryClient();
  const queryKey = ["expenses", params?.month ?? null] as const;

  // Build query string
  const search = new URLSearchParams({ limit: "200" });
  if (params?.month) search.set("month", params.month);

  // ── GET ──────────────────────────────────────────────────────────────────
  const query = useQuery({
    queryKey,
    queryFn: () =>
      apiFetch<ExpensesResponse>(`/api/expenses?${search.toString()}`),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["expenses"] });

  // ── POST ─────────────────────────────────────────────────────────────────
  const addExpense = useMutation({
    mutationFn: (input: AddExpenseInput) =>
      apiFetch<Expense>("/api/expenses", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Expense logged.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  // ── PUT ──────────────────────────────────────────────────────────────────
  const editExpense = useMutation({
    mutationFn: ({ id, ...fields }: EditExpenseInput) =>
      apiFetch<Expense>(`/api/expenses/${id}`, {
        method: "PUT",
        body: JSON.stringify(fields),
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Expense updated.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  // ── DELETE ───────────────────────────────────────────────────────────────
  const removeExpense = useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ message: string }>(`/api/expenses/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Expense deleted.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return {
    expenses: query.data?.expenses ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    addExpense,
    editExpense,
    removeExpense,
  };
}
