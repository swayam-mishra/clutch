import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiError } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActiveChallenge {
  user_challenge_id: number;
  title: string;
  description: string;
  target_amount: number;
  duration_days: number;
  progress: number;
  start_date: string;
  status: "active" | "completed";
}

export interface AvailableChallenge {
  id: number;
  title: string;
  description: string;
  target_amount: number;
  duration_days: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  reward?: string;
}

export interface ChallengeHistory {
  user_challenge_id: number;
  title: string;
  status: string;
  progress: number;
  start_date: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errMsg(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChallenges() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["challenges"] });
    qc.invalidateQueries({ queryKey: ["goals"] });
  };

  // ── GET active ────────────────────────────────────────────────────────────
  const activeQuery = useQuery({
    queryKey: ["challenges", "active"],
    queryFn: () => apiFetch<ActiveChallenge[]>("/api/challenges/active"),
  });

  // ── GET available ─────────────────────────────────────────────────────────
  const availableQuery = useQuery({
    queryKey: ["challenges", "available"],
    queryFn: () => apiFetch<AvailableChallenge[]>("/api/challenges/available"),
  });

  // ── GET history ───────────────────────────────────────────────────────────
  const historyQuery = useQuery({
    queryKey: ["challenges", "history"],
    queryFn: () => apiFetch<ChallengeHistory[]>("/api/challenges/history"),
  });

  // ── POST /:id/join ────────────────────────────────────────────────────────
  const joinChallenge = useMutation({
    mutationFn: (challengeId: number) =>
      apiFetch(`/api/challenges/${challengeId}/join`, { method: "POST" }),
    onSuccess: () => {
      invalidate();
      toast.success("Challenge joined!");
    },
    onError: (err) => toast.error(errMsg(err)),
  });

  // ── PUT /:id/progress — mark complete ─────────────────────────────────────
  const markComplete = useMutation({
    mutationFn: (userChallengeId: number) =>
      apiFetch(`/api/challenges/${userChallengeId}/progress`, {
        method: "PUT",
        body: JSON.stringify({ markCompleted: true }),
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Challenge completed! 🏆");
    },
    onError: (err) => toast.error(errMsg(err)),
  });

  // ── PUT /:id/progress — add amount ────────────────────────────────────────
  const addProgress = useMutation({
    mutationFn: ({ userChallengeId, amountAdded }: { userChallengeId: number; amountAdded: number }) =>
      apiFetch(`/api/challenges/${userChallengeId}/progress`, {
        method: "PUT",
        body: JSON.stringify({ amountAdded }),
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Progress updated.");
    },
    onError: (err) => toast.error(errMsg(err)),
  });

  return {
    active: activeQuery.data ?? [],
    available: availableQuery.data ?? [],
    history: historyQuery.data ?? [],
    isLoading: activeQuery.isLoading || availableQuery.isLoading,
    joinChallenge,
    markComplete,
    addProgress,
  };
}
