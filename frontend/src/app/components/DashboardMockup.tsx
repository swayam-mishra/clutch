import {
  ShoppingBag,
  Utensils,
  Car,
  Zap,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const categories = [
  {
    icon: ShoppingBag,
    label: "Shopping",
    spent: "$420",
    budget: "$500",
    pct: 84,
    color: "#F59E0B",
  },
  {
    icon: Utensils,
    label: "Food & Drink",
    spent: "$280",
    budget: "$400",
    pct: 70,
    color: "#6C47FF",
  },
  {
    icon: Car,
    label: "Transport",
    spent: "$95",
    budget: "$200",
    pct: 47,
    color: "#22C55E",
  },
  {
    icon: Zap,
    label: "Utilities",
    spent: "$140",
    budget: "$180",
    pct: 78,
    color: "#6C47FF",
  },
];

export function DashboardMockup() {
  return (
    <div
      className="relative w-full max-w-[480px]"
      style={{ perspective: "1200px" }}
    >
      {/* Glow backdrop */}
      <div
        className="absolute -inset-8 rounded-3xl blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at center, #6C47FF 0%, transparent 70%)",
        }}
      />

      {/* Main card */}
      <div
        className="relative rounded-2xl p-6 flex flex-col gap-5"
        style={{
          backgroundColor: "#fff",
          boxShadow: "0 2px 12px rgba(108,71,255,0.08), 0 8px 40px rgba(108,71,255,0.12)",
          borderRadius: 16,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#6C47FF" }}
            >
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
                C
              </span>
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E" }}>
                Clutch Dashboard
              </p>
              <p style={{ fontSize: 12, color: "#1A1A2E", opacity: 0.5 }}>
                March 2026
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-1 px-3 py-1 rounded-full"
            style={{ backgroundColor: "#E8FAE8" }}
          >
            <TrendingUp size={13} color="#22C55E" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#22C55E" }}>
              +12%
            </span>
          </div>
        </div>

        {/* Budget health score */}
        <div
          className="flex items-center gap-5 p-4 rounded-xl"
          style={{ backgroundColor: "#F7F6FF" }}
        >
          {/* Score ring */}
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="#EDE9FF"
                strokeWidth="8"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="#6C47FF"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${78 * 2.136} ${100 * 2.136}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                style={{ fontSize: 20, fontWeight: 700, color: "#6C47FF" }}
              >
                78
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>
              Budget Health Score
            </p>
            <p style={{ fontSize: 12, color: "#1A1A2E", opacity: 0.6 }}>
              78 / 100 — Good shape!
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown size={12} color="#22C55E" />
              <span
                style={{ fontSize: 11, fontWeight: 500, color: "#22C55E" }}
              >
                Spending down 8% this week
              </span>
            </div>
          </div>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="p-3 rounded-xl flex flex-col gap-2"
              style={{
                backgroundColor: "#F7F6FF",
                border: "1px solid rgba(108,71,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: cat.color + "18" }}
                >
                  <cat.icon size={14} color={cat.color} />
                </div>
                <span
                  style={{ fontSize: 12, fontWeight: 500, color: "#1A1A2E" }}
                >
                  {cat.label}
                </span>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#1A1A2E",
                    }}
                  >
                    {cat.spent}
                  </span>
                  <span
                    style={{ fontSize: 11, color: "#1A1A2E", opacity: 0.4 }}
                  >
                    / {cat.budget}
                  </span>
                </div>
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: "#EDE9FF" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${cat.pct}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI nudge */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{
            backgroundColor: "#FFF7ED",
            border: "1px solid rgba(245,158,11,0.15)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#F59E0B20" }}
          >
            <span style={{ fontSize: 16 }}>⚡</span>
          </div>
          <p style={{ fontSize: 12, color: "#92400E", lineHeight: 1.4 }}>
            <span style={{ fontWeight: 600 }}>Heads up:</span> Shopping is at
            84%. You have $80 left for 23 days.
          </p>
        </div>
      </div>
    </div>
  );
}
