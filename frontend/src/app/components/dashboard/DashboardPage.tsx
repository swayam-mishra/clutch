import { useState } from "react";
import { Sparkles } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { StatCards } from "./StatCards";
import { RecentExpenses } from "./RecentExpenses";
import { BudgetOverview } from "./BudgetOverview";
import { SpendTrajectory } from "./SpendTrajectory";
import { ActiveGoals } from "./ActiveGoals";
import { AskClutchModal } from "./AskClutchModal";
import { ShouldIBuyButton } from "./ShouldIBuyButton";
import { HealthScoreCard } from "./HealthScoreCard";

export function DashboardPage() {
  const [showAI, setShowAI] = useState(false);

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

        {/* Row 1b — Health Score */}
        <div className="mt-6">
          <HealthScoreCard />
        </div>

        {/* Row 2 — Expenses + Budget */}
        <div className="grid grid-cols-5 gap-5 mt-6">
          <div className="col-span-3">
            <RecentExpenses />
          </div>
          <div className="col-span-2">
            <BudgetOverview />
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
      </main>

      {showAI && <AskClutchModal onClose={() => setShowAI(false)} />}
      <ShouldIBuyButton />
    </div>
  );
}
