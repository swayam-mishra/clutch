import { Wallet, Heart, TrendingUp, Calendar } from "lucide-react";
import { useBudget } from "../../../hooks/useBudget";
import { useHealthScore } from "../../../hooks/useHealthScore";

const cardStyle = {
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 12px rgba(108,71,255,0.08)",
};

function HealthGauge({ score }: { score: number }) {
  const percentage = score / 100;
  const startAngle = Math.PI;
  const endAngle = 0;
  const sweepAngle = (endAngle - startAngle) * percentage;
  const cx = 50,
    cy = 50,
    r = 38;

  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy - r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(startAngle + sweepAngle);
  const y2 = cy - r * Math.sin(startAngle + sweepAngle);
  const largeArc = percentage > 0.5 ? 1 : 0;

  return (
    <svg viewBox="0 0 100 58" className="w-24 h-auto">
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6C47FF" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>
      </defs>
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="rgba(108,71,255,0.08)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
        fill="none"
        stroke="url(#gaugeGrad)"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="p-5 flex flex-col gap-3 animate-pulse" style={cardStyle}>
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: "#EDE9FF" }} />
        <div className="h-3 w-16 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.08)" }} />
      </div>
      <div>
        <div className="h-7 w-24 rounded-lg mb-1" style={{ backgroundColor: "rgba(108,71,255,0.08)" }} />
        <div className="h-3 w-20 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
      </div>
      <div className="w-full h-2 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
    </div>
  );
}

export function StatCards() {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const { budgetStatus, isLoading: budgetLoading } = useBudget(currentMonth);
  const { score, isLoading: scoreLoading } = useHealthScore();

  const isLoading = budgetLoading || scoreLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-5">
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const budgetTotal = budgetStatus?.totalBudget ?? 0;
  const budgetSpent = budgetStatus?.totalSpent ?? 0;
  const budgetPercent = budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0;
  const velocity = budgetStatus?.spendVelocity ?? 0;
  const daysRemaining = budgetStatus?.daysRemaining ?? 0;
  const projectedRunOutDay = budgetStatus?.projectedRunOutDay ?? null;
  const healthScore = score ?? 0;
  const healthLabel =
    healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : healthScore >= 40 ? "Fair" : "Needs work";
  const healthColor = healthScore >= 60 ? "#22C55E" : healthScore >= 40 ? "#F59E0B" : "#EF4444";

  // Format projected runout date
  let projectedLabel = "—";
  if (projectedRunOutDay && projectedRunOutDay > 0) {
    const now = new Date();
    const runout = new Date(now.getFullYear(), now.getMonth(), projectedRunOutDay);
    projectedLabel = runout.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  }

  return (
    <div className="grid grid-cols-4 gap-5">
      {/* Monthly Budget */}
      <div className="p-5 flex flex-col gap-3" style={cardStyle}>
        <div className="flex items-center justify-between">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#EDE9FF" }}
          >
            <Wallet size={20} color="#6C47FF" />
          </div>
          <span style={{ fontSize: 12, color: "rgba(26,26,46,0.4)", fontWeight: 500 }}>
            This month
          </span>
        </div>
        <div>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
            ₹{(budgetTotal / 1000).toFixed(0)}k
          </p>
          <p style={{ fontSize: 13, color: "rgba(26,26,46,0.5)", marginTop: 2 }}>
            ₹{budgetSpent.toLocaleString("en-IN")} spent
          </p>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.08)" }}>
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${Math.min(budgetPercent, 100)}%`,
              backgroundColor: budgetPercent > 80 ? "#EF4444" : "#6C47FF",
            }}
          />
        </div>
      </div>

      {/* Health Score */}
      <div className="p-5 flex flex-col gap-3" style={cardStyle}>
        <div className="flex items-center justify-between">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#EDE9FF" }}
          >
            <Heart size={20} color="#6C47FF" />
          </div>
          <span style={{ fontSize: 12, color: "rgba(26,26,46,0.4)", fontWeight: 500 }}>
            Health Score
          </span>
        </div>
        <div className="flex items-end gap-4">
          <div>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
              {healthScore}<span style={{ fontSize: 16, color: "rgba(26,26,46,0.3)", fontWeight: 500 }}>/100</span>
            </p>
            <p style={{ fontSize: 13, color: healthColor, fontWeight: 600, marginTop: 2 }}>{healthLabel}</p>
          </div>
          <HealthGauge score={healthScore} />
        </div>
      </div>

      {/* Spend Velocity */}
      <div className="p-5 flex flex-col gap-3" style={cardStyle}>
        <div className="flex items-center justify-between">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#EDE9FF" }}
          >
            <TrendingUp size={20} color="#6C47FF" />
          </div>
          <span
            className="px-2.5 py-1 rounded-full"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: budgetPercent > 80 ? "#EF4444" : "#22C55E",
              backgroundColor: budgetPercent > 80 ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
            }}
          >
            {budgetPercent > 80 ? "Overspending" : "On track"}
          </span>
        </div>
        <div>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
            ₹{Math.round(velocity).toLocaleString("en-IN")}<span style={{ fontSize: 14, color: "rgba(26,26,46,0.4)", fontWeight: 500 }}>/day</span>
          </p>
          <p style={{ fontSize: 13, color: "rgba(26,26,46,0.5)", marginTop: 2 }}>
            Spend Velocity
          </p>
        </div>
      </div>

      {/* Projected Run-out */}
      <div className="p-5 flex flex-col gap-3" style={cardStyle}>
        <div className="flex items-center justify-between">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#EDE9FF" }}
          >
            <Calendar size={20} color="#6C47FF" />
          </div>
          <span style={{ fontSize: 12, color: "rgba(26,26,46,0.4)", fontWeight: 500 }}>
            Projected
          </span>
        </div>
        <div>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
            {projectedLabel}
          </p>
          <p style={{ fontSize: 13, marginTop: 2 }}>
            <span style={{ color: daysRemaining > 5 ? "#22C55E" : "#F59E0B", fontWeight: 600 }}>
              {daysRemaining} days left
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
