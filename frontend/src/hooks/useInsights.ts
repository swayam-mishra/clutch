import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Anomaly {
  category: string;
  current_total: number;
  avg_monthly_spend: number;
  spike_percentage: number;
}

export interface Habit {
  category: string;
  description: string;
  amount: number;
  frequency: number;
}

export interface TrendRow {
  week: string;   // ISO timestamp from date_trunc
  category: string;
  total: number;
}

const STALE_TIME = 10 * 60 * 1000; // 10 minutes

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInsights() {
  const anomaliesQuery = useQuery({
    queryKey: ["insights", "anomalies"],
    queryFn: () => apiFetch<{ anomalies: Anomaly[] }>("/api/insights/anomalies"),
    staleTime: STALE_TIME,
  });

  const habitsQuery = useQuery({
    queryKey: ["insights", "habits"],
    queryFn: () => apiFetch<{ habits: Habit[] }>("/api/insights/habits"),
    staleTime: STALE_TIME,
  });

  const trendsQuery = useQuery({
    queryKey: ["insights", "trends"],
    queryFn: () => apiFetch<TrendRow[]>("/api/expenses/trends"),
    staleTime: STALE_TIME,
  });

  // Coerce postgres numeric strings to JS numbers
  const anomalies: Anomaly[] = (anomaliesQuery.data?.anomalies ?? []).map((a) => ({
    ...a,
    current_total: Number(a.current_total),
    avg_monthly_spend: Number(a.avg_monthly_spend),
    spike_percentage: Number(a.spike_percentage),
  }));

  const habits: Habit[] = (habitsQuery.data?.habits ?? []).map((h) => ({
    ...h,
    amount: Number(h.amount),
    frequency: Number(h.frequency),
  }));

  const trends: TrendRow[] = (trendsQuery.data ?? []).map((t) => ({
    ...t,
    total: Number(t.total),
  }));

  return {
    anomalies,
    habits,
    trends,
    isLoading: anomaliesQuery.isLoading || habitsQuery.isLoading,
    trendsLoading: trendsQuery.isLoading,
    isError: anomaliesQuery.isError || habitsQuery.isError,
  };
}
