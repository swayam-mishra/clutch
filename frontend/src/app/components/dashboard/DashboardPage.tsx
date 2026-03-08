import { useState, useEffect } from "react";
import { apiClient } from '../../services/apiClient';
import { Sparkles, AlertTriangle } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { StatCards } from "./StatCards";
import { RecentExpenses } from "./RecentExpenses";
import { BudgetOverview } from "./BudgetOverview";
import { SpendTrajectory } from "./SpendTrajectory";
import { ActiveGoals } from "./ActiveGoals";
import { AskClutchModal } from "./AskClutchModal";

export function DashboardPage() {
  const [showAI, setShowAI] = useState(false);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [scoreData, expenseData] = await Promise.all([
          apiClient('/health-score'),
          apiClient('/expense?limit=5'),
        ]);
        setHealthScore(scoreData.score);
        setExpenses(expenseData.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const hour = today.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#F7F6FF" }}
    >
      <DashboardSidebar activePage="Dashboard" />

      {/* Main content */}
      <main className="flex-1 ml-16 p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#1A1A2E",
                letterSpacing: "-0.02em",
              }}
            >
              {greeting}, Swayam
            </h1>
            <p style={{ fontSize: 14, color: "rgba(26,26,46,0.45)", marginTop: 4 }}>
              {dateStr}
            </p>
          </div>
          <button
            onClick={() => setShowAI(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90 border-none"
            style={{
              backgroundColor: "#6C47FF",
              fontSize: 14,
              fontWeight: 600,
              boxShadow: "0 4px 20px rgba(108,71,255,0.25)",
            }}
          >
            <Sparkles size={16} />
            Ask Clutch
          </button>
        </div>

        {/* Row 1 — Stat cards */}
        <StatCards />

        {/* Row 2 — Expenses + Budget */}
        <div className="grid grid-cols-5 gap-5 mt-6">
          <div className="col-span-3">
            <RecentExpenses expenses={expenses} loading={loading} />
          </div>
          <div className="col-span-2">
            <BudgetOverview currentScore={healthScore} loading={loading} />
          </div>
        </div>

        {/* Row 3 — Trajectory + Goals */}
        <div className="grid grid-cols-5 gap-5 mt-6">
          <div className="col-span-3">
            <SpendTrajectory />
          </div>
          <div className="col-span-2">
            <ActiveGoals />
          </div>
        </div>

        {/* Warning banner (shows if health score < 50) */}
        {healthScore !== null && healthScore < 50 && (
          <div
            className="flex items-center gap-3 px-6 py-4 rounded-2xl mt-6"
            style={{
              backgroundColor: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.15)",
            }}
          >
            <AlertTriangle size={20} color="#EF4444" />
            <p style={{ fontSize: 14, fontWeight: 600, color: "#EF4444" }}>
              You've used 80%+ of your budget. Slow down.
            </p>
          </div>
        )}
      </main>

      {/* AI Modal */}
      {showAI && <AskClutchModal onClose={() => setShowAI(false)} />}
    </div>
  );
}