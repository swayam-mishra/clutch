import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScoreFactors {
  budgetAdherence: number;  // out of 40
  spendingBalance: number;  // out of 30
  consistency: number;      // out of 30
}

export interface HealthScoreData {
  id: string;
  user_id: string;
  score: number;
  factors: ScoreFactors;
  explanation: string;
  computed_at: string;
}

export interface HealthScoreTrendPoint {
  score: number;
  computed_at: string;
}

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHealthScore() {
  const scoreQuery = useQuery({
    queryKey: ["health-score"],
    queryFn: () => apiFetch<HealthScoreData>("/api/health-score"),
    staleTime: STALE_TIME,
  });

  const historyQuery = useQuery({
    queryKey: ["health-score", "history"],
    queryFn: () => apiFetch<HealthScoreData[]>("/api/health-score/history"),
    staleTime: STALE_TIME,
  });

  const data = scoreQuery.data;
  const history = historyQuery.data ?? [];

  // Derive trend: compare latest score to the one before it
  const trend: "up" | "down" | "flat" =
    history.length >= 2
      ? history[0].score > history[1].score
        ? "up"
        : history[0].score < history[1].score
          ? "down"
          : "flat"
      : "flat";

  return {
    score: data?.score ?? null,
    breakdown: data?.factors ?? null,
    explanation: data?.explanation ?? null,
    computedAt: data?.computed_at ?? null,
    trend,
    trendHistory: history.slice(0, 14).map((h) => ({
      score: h.score,
      computed_at: h.computed_at,
    })),
    isLoading: scoreQuery.isLoading,
    isError: scoreQuery.isError,
  };
}
