import { Wallet, Heart, TrendingUp, Calendar } from "lucide-react";

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
      {/* Background arc */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="rgba(108,71,255,0.08)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Value arc */}
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

export function StatCards() {
  const budgetSpent = 6200;
  const budgetTotal = 15000;
  const budgetPercent = (budgetSpent / budgetTotal) * 100;

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
            ₹15,000
          </p>
          <p style={{ fontSize: 13, color: "rgba(26,26,46,0.5)", marginTop: 2 }}>
            ₹6,200 spent
          </p>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.08)" }}>
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${budgetPercent}%`,
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
              78<span style={{ fontSize: 16, color: "rgba(26,26,46,0.3)", fontWeight: 500 }}>/100</span>
            </p>
            <p style={{ fontSize: 13, color: "#22C55E", fontWeight: 600, marginTop: 2 }}>Good</p>
          </div>
          <HealthGauge score={78} />
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
            style={{ fontSize: 12, fontWeight: 600, color: "#22C55E", backgroundColor: "rgba(34,197,94,0.1)" }}
          >
            On track
          </span>
        </div>
        <div>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
            ₹412<span style={{ fontSize: 14, color: "rgba(26,26,46,0.4)", fontWeight: 500 }}>/day</span>
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
            Mar 28
          </p>
          <p style={{ fontSize: 13, marginTop: 2 }}>
            <span style={{ color: "#22C55E", fontWeight: 600 }}>6 days buffer</span>
          </p>
        </div>
      </div>
    </div>
  );
}
