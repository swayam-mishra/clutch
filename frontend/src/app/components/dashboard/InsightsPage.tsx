import { useState } from "react";
import {
  Utensils,
  Coffee,
  Plane,
  Gamepad2,
  ShoppingBag,
  Heart,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Repeat,
  Zap,
  GraduationCap,
  Wifi,
  Music,
  Dumbbell,
  Monitor,
} from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";

// ─── Design tokens ─────────────────────────────
const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 12px rgba(108,71,255,0.08)",
};

// ─── Anomaly Data ──────────────────────────────
const anomalies = [
  {
    id: "food",
    icon: Utensils,
    iconColor: "#F59E0B",
    iconBg: "#FFF7ED",
    category: "Food & Dining",
    spent: 4200,
    avg: 2800,
    percentIncrease: 50,
  },
  {
    id: "shopping",
    icon: ShoppingBag,
    iconColor: "#EF4444",
    iconBg: "#FEF2F2",
    category: "Shopping",
    spent: 5499,
    avg: 3200,
    percentIncrease: 72,
  },
  {
    id: "transport",
    icon: Plane,
    iconColor: "#3B82F6",
    iconBg: "#EFF6FF",
    category: "Transport",
    spent: 1850,
    avg: 1400,
    percentIncrease: 32,
  },
];

// ─── Stacked Bar Data ──────────────────────────
const weeklySpendData = [
  { week: "Week 1", Food: 1200, Transport: 600, Shopping: 400, Entertainment: 250, Health: 150, Utilities: 500 },
  { week: "Week 2", Food: 1400, Transport: 450, Shopping: 1800, Entertainment: 350, Health: 100, Utilities: 200 },
  { week: "Week 3", Food: 900, Transport: 500, Shopping: 800, Entertainment: 150, Health: 200, Utilities: 300 },
  { week: "Week 4", Food: 700, Transport: 300, Shopping: 2500, Entertainment: 0, Health: 50, Utilities: 200 },
];

const barCategories = [
  { key: "Food", color: "#F59E0B" },
  { key: "Transport", color: "#6C47FF" },
  { key: "Shopping", color: "#EF4444" },
  { key: "Entertainment", color: "#22C55E" },
  { key: "Health", color: "#EC4899" },
  { key: "Utilities", color: "#3B82F6" },
];

// ─── Pie Data ──────────────────────────────────
const pieData = [
  { name: "Food & Dining", value: 4200, color: "#F59E0B" },
  { name: "Shopping", value: 5499, color: "#EF4444" },
  { name: "Transport", value: 1850, color: "#6C47FF" },
  { name: "Utilities", value: 1200, color: "#3B82F6" },
  { name: "Entertainment", value: 750, color: "#22C55E" },
  { name: "Health", value: 485, color: "#EC4899" },
];
const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

// ─── Recurring Expenses ────────────────────────
interface RecurringExpense {
  id: string;
  description: string;
  category: string;
  catIcon: React.ElementType;
  catColor: string;
  amount: number;
  frequency: "Monthly" | "Weekly";
  isSubscription: boolean;
}

const initialRecurring: RecurringExpense[] = [
  { id: "netflix", description: "Netflix Premium", category: "Entertainment", catIcon: Monitor, catColor: "#22C55E", amount: 649, frequency: "Monthly", isSubscription: true },
  { id: "spotify", description: "Spotify Premium", category: "Entertainment", catIcon: Music, catColor: "#22C55E", amount: 119, frequency: "Monthly", isSubscription: true },
  { id: "gym", description: "Cult.fit Membership", category: "Health", catIcon: Dumbbell, catColor: "#EC4899", amount: 999, frequency: "Monthly", isSubscription: false },
  { id: "wifi", description: "Airtel Broadband", category: "Utilities", catIcon: Wifi, catColor: "#3B82F6", amount: 799, frequency: "Monthly", isSubscription: true },
  { id: "coursera", description: "Coursera Plus", category: "Education", catIcon: GraduationCap, catColor: "#8B5CF6", amount: 750, frequency: "Monthly", isSubscription: false },
  { id: "metro", description: "Metro Card Recharge", category: "Transport", catIcon: Zap, catColor: "#6C47FF", amount: 300, frequency: "Weekly", isSubscription: false },
];

// ─── Pure SVG Stacked Bar Chart ────────────────
function StackedBarChart() {
  const [hovered, setHovered] = useState<{ weekIdx: number; catIdx: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const W = 520;
  const H = 280;
  const PAD = { top: 20, right: 20, bottom: 30, left: 50 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const catKeys = barCategories.map((c) => c.key);
  const weekTotals = weeklySpendData.map((w) =>
    catKeys.reduce((s, k) => s + ((w as any)[k] || 0), 0)
  );
  const maxVal = Math.ceil(Math.max(...weekTotals) / 1000) * 1000;
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxVal / 4) * i));

  const barCount = weeklySpendData.length;
  const barGroupW = plotW / barCount;
  const barW = barGroupW * 0.5;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "visible" }} onMouseLeave={() => setHovered(null)}>
        {/* Grid lines */}
        {yTicks.map((tick) => {
          const y = PAD.top + plotH - (tick / maxVal) * plotH;
          return (
            <g key={`grid-${tick}`}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="rgba(108,71,255,0.06)" strokeDasharray="4 4" />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" style={{ fontSize: 11, fill: "rgba(26,26,46,0.4)", fontFamily: "Inter, sans-serif" }}>
                {`₹${(tick / 1000).toFixed(0)}k`}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {weeklySpendData.map((w, i) => (
          <text
            key={`xlabel-${w.week}`}
            x={PAD.left + barGroupW * i + barGroupW / 2}
            y={H - 6}
            textAnchor="middle"
            style={{ fontSize: 11, fill: "rgba(26,26,46,0.4)", fontFamily: "Inter, sans-serif" }}
          >
            {w.week}
          </text>
        ))}

        {/* Bars */}
        {weeklySpendData.map((w, wi) => {
          let yOffset = 0;
          const groupX = PAD.left + barGroupW * wi + (barGroupW - barW) / 2;
          return (
            <g key={`bar-group-${w.week}`}>
              {catKeys.map((catKey, ci) => {
                const val = (w as any)[catKey] || 0;
                const barH = (val / maxVal) * plotH;
                const y = PAD.top + plotH - yOffset - barH;
                yOffset += barH;
                const isLast = ci === catKeys.length - 1;
                const isHovered = hovered?.weekIdx === wi && hovered?.catIdx === ci;
                return (
                  <rect
                    key={`bar-${w.week}-${catKey}`}
                    x={groupX}
                    y={y}
                    width={barW}
                    height={Math.max(barH, 0)}
                    rx={isLast ? 4 : 0}
                    ry={isLast ? 4 : 0}
                    fill={barCategories[ci].color}
                    opacity={hovered && !isHovered ? 0.5 : 1}
                    style={{ transition: "opacity 0.15s" }}
                    onMouseEnter={(e) => {
                      setHovered({ weekIdx: wi, catIdx: ci });
                      const rect = (e.target as SVGRectElement).closest("svg")?.getBoundingClientRect();
                      if (rect) {
                        setTooltipPos({
                          x: groupX + barW / 2,
                          y: y - 8,
                        });
                      }
                    }}
                  />
                );
              })}
            </g>
          );
        })}

        {/* Tooltip */}
        {hovered !== null && (() => {
          const w = weeklySpendData[hovered.weekIdx];
          const catKey = catKeys[hovered.catIdx];
          const val = (w as any)[catKey] || 0;
          const tooltipW = 120;
          const tooltipH = 44;
          const tx = Math.max(PAD.left, Math.min(tooltipPos.x - tooltipW / 2, W - PAD.right - tooltipW));
          const ty = tooltipPos.y - tooltipH - 4;
          return (
            <g>
              <rect x={tx} y={ty} width={tooltipW} height={tooltipH} rx={8} fill="#1A1A2E" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }} />
              <text x={tx + tooltipW / 2} y={ty + 16} textAnchor="middle" style={{ fontSize: 10, fill: "rgba(255,255,255,0.5)", fontFamily: "Inter, sans-serif" }}>
                {w.week} · {catKey}
              </text>
              <text x={tx + tooltipW / 2} y={ty + 34} textAnchor="middle" style={{ fontSize: 13, fill: "#fff", fontWeight: 700, fontFamily: "Inter, sans-serif" }}>
                ₹{val.toLocaleString()}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

// ─── Pure SVG Donut Chart ──────────────────────
function DonutChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 90;
  const innerR = 60;
  const gap = 3; // degrees gap

  // Build arcs
  let startAngle = 90; // start from top
  const arcs = pieData.map((d, i) => {
    const sweepDeg = (d.value / pieTotal) * 360 - gap;
    const start = startAngle;
    const end = startAngle - sweepDeg;
    startAngle = end - gap;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const outerStart = { x: cx + outerR * Math.cos(toRad(start)), y: cy - outerR * Math.sin(toRad(start)) };
    const outerEnd = { x: cx + outerR * Math.cos(toRad(end)), y: cy - outerR * Math.sin(toRad(end)) };
    const innerStart = { x: cx + innerR * Math.cos(toRad(end)), y: cy - innerR * Math.sin(toRad(end)) };
    const innerEnd = { x: cx + innerR * Math.cos(toRad(start)), y: cy - innerR * Math.sin(toRad(start)) };
    const largeArc = sweepDeg > 180 ? 1 : 0;

    const path = [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
      "Z",
    ].join(" ");

    // Label position
    const midAngle = (start + end) / 2;
    const labelR = outerR + 28;
    const labelX = cx + labelR * Math.cos(toRad(midAngle));
    const labelY = cy - labelR * Math.sin(toRad(midAngle));
    const pct = Math.round((d.value / pieTotal) * 100);

    return { path, labelX, labelY, midAngle, pct, ...d, index: i };
  });

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ overflow: "visible" }} onMouseLeave={() => setHoveredIdx(null)}>
        {arcs.map((arc) => (
          <g key={`donut-${arc.name}`}>
            <path
              d={arc.path}
              fill={arc.color}
              opacity={hoveredIdx !== null && hoveredIdx !== arc.index ? 0.4 : 1}
              style={{ transition: "opacity 0.15s, transform 0.15s", cursor: "pointer" }}
              onMouseEnter={() => setHoveredIdx(arc.index)}
            />
            <text
              x={arc.labelX}
              y={arc.labelY}
              textAnchor={arc.labelX > cx ? "start" : "end"}
              dominantBaseline="central"
              style={{ fontSize: 11, fontWeight: 600, fill: "#1A1A2E", fontFamily: "Inter, sans-serif" }}
            >
              {arc.name} ({arc.pct}%)
            </text>
          </g>
        ))}

        {/* Tooltip on hover */}
        {hoveredIdx !== null && (() => {
          const d = pieData[hoveredIdx];
          const pct = Math.round((d.value / pieTotal) * 100);
          return (
            <g>
              <text x={cx} y={cy - 10} textAnchor="middle" style={{ fontSize: 12, fontWeight: 600, fill: d.color, fontFamily: "Inter, sans-serif" }}>
                {d.name}
              </text>
              <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 15, fontWeight: 800, fill: "#1A1A2E", fontFamily: "Inter, sans-serif" }}>
                ₹{d.value.toLocaleString()}
              </text>
              <text x={cx} y={cy + 26} textAnchor="middle" style={{ fontSize: 11, fill: "rgba(26,26,46,0.4)", fontFamily: "Inter, sans-serif" }}>
                {pct}% of total
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

// ─── Legend ─────────────────────────────────────
function BarLegend() {
  return (
    <div className="flex items-center justify-center gap-5 mt-4 flex-wrap">
      {barCategories.map((c) => (
        <div key={c.key} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(26,26,46,0.5)" }}>{c.key}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Toggle Switch ─────────────────────────────
function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-10 h-[22px] rounded-full cursor-pointer border-none transition-colors duration-200"
      style={{
        backgroundColor: checked ? "#6C47FF" : "rgba(26,26,46,0.12)",
      }}
    >
      <span
        className="absolute top-[3px] w-4 h-4 rounded-full transition-all duration-200"
        style={{
          backgroundColor: "#fff",
          left: checked ? 21 : 3,
          boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        }}
      />
    </button>
  );
}

// ─── Main Page ─────────────────────────────────
export function InsightsPage() {
  const [recurring, setRecurring] = useState(initialRecurring);

  const toggleSubscription = (id: string) => {
    setRecurring((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isSubscription: !r.isSubscription } : r))
    );
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#F7F6FF" }}
    >
      <DashboardSidebar activePage="Insights" />

      <main className="flex-1 ml-16 p-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
            Insights
          </h1>
          <p style={{ fontSize: 14, color: "rgba(26,26,46,0.45)", marginTop: 4 }}>
            Understand your patterns.
          </p>
        </div>

        {/* ── Row 1: Spending Anomalies ──────── */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <TrendingUp size={18} color="#EF4444" />
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A2E" }}>
              Spending Spikes This Month
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {anomalies.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.id}
                  className="p-5 flex flex-col gap-4 transition-all hover:translate-y-[-2px]"
                  style={cardStyle}
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: a.iconBg }}
                      >
                        <Icon size={20} color={a.iconColor} />
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E" }}>
                        {a.category}
                      </span>
                    </div>
                    <span
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#EF4444",
                        backgroundColor: "rgba(239,68,68,0.08)",
                      }}
                    >
                      <ArrowUpRight size={13} />
                      +{a.percentIncrease}%
                    </span>
                  </div>

                  {/* Comparison */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-baseline gap-1.5">
                      <span style={{ fontSize: 24, fontWeight: 800, color: "#1A1A2E" }}>
                        ₹{a.spent.toLocaleString()}
                      </span>
                      <span style={{ fontSize: 13, color: "rgba(26,26,46,0.4)", fontWeight: 500 }}>
                        spent
                      </span>
                    </div>
                    <span style={{ fontSize: 13, color: "rgba(26,26,46,0.45)" }}>
                      vs ₹{a.avg.toLocaleString()} avg <span style={{ color: "rgba(26,26,46,0.25)" }}>(last 3 months)</span>
                    </span>
                  </div>

                  {/* Visual bar */}
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F0EEFF" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((a.spent / a.avg) * 70, 100)}%`,
                        backgroundColor: "#EF4444",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Row 2: Stacked Bar + Donut ──────── */}
        <div className="grid grid-cols-5 gap-5 mb-8">
          {/* Left: Stacked Bar */}
          <div className="col-span-3 p-6" style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E", marginBottom: 20 }}>
              Monthly Spend Breakdown
            </h3>
            <StackedBarChart />
            <BarLegend />
          </div>

          {/* Right: Pie/Donut */}
          <div className="col-span-2 p-6 flex flex-col" style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E", marginBottom: 8 }}>
              Category Split
            </h3>
            <div className="flex-1 flex items-center justify-center">
              <DonutChart />
            </div>
            {/* Mini Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 justify-center">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(26,26,46,0.5)" }}>
                    {d.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 3: Recurring Expenses ──────── */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <Repeat size={18} color="#6C47FF" />
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A2E" }}>
              Detected Recurring Expenses
            </h2>
          </div>
          <div style={cardStyle} className="overflow-hidden">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(108,71,255,0.06)" }}>
                  {["Description", "Category", "Amount", "Frequency", "Mark as Subscription"].map(
                    (h) => (
                      <th
                        key={h}
                        className={`py-4 px-5 ${h === "Amount" ? "text-right" : "text-left"} ${h === "Mark as Subscription" ? "text-center" : ""}`}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "rgba(26,26,46,0.4)",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {recurring.map((r, idx) => {
                  const CatIcon = r.catIcon;
                  return (
                    <tr
                      key={r.id}
                      className="transition-colors"
                      style={{
                        backgroundColor: idx % 2 === 1 ? "#FAFAFF" : "#fff",
                        borderBottom: "1px solid rgba(108,71,255,0.03)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(237,233,255,0.12)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          idx % 2 === 1 ? "#FAFAFF" : "#fff")
                      }
                    >
                      {/* Description */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${r.catColor}12` }}
                          >
                            <CatIcon size={16} color={r.catColor} />
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 500, color: "#1A1A2E" }}>
                            {r.description}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-5">
                        <span
                          className="px-3 py-1 rounded-full inline-block"
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: r.catColor,
                            backgroundColor: `${r.catColor}12`,
                          }}
                        >
                          {r.category}
                        </span>
                      </td>

                      {/* Amount */}
                      <td
                        className="py-3.5 px-5 text-right"
                        style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}
                      >
                        ₹{r.amount.toLocaleString()}
                      </td>

                      {/* Frequency */}
                      <td className="py-3.5 px-5">
                        <span
                          className="px-2.5 py-1 rounded-lg"
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: r.frequency === "Monthly" ? "#6C47FF" : "#F59E0B",
                            backgroundColor:
                              r.frequency === "Monthly"
                                ? "rgba(108,71,255,0.06)"
                                : "rgba(245,158,11,0.06)",
                          }}
                        >
                          {r.frequency}
                        </span>
                      </td>

                      {/* Toggle */}
                      <td className="py-3.5 px-5">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            checked={r.isSubscription}
                            onChange={() => toggleSubscription(r.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Row 4: AI Weekly Review ──────── */}
        <div
          className="p-7 relative overflow-hidden"
          style={{
            borderRadius: 20,
            background: "linear-gradient(135deg, #EDE9FF 0%, #F7F6FF 50%, #E8E3FF 100%)",
            border: "1px solid rgba(108,71,255,0.08)",
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(108,71,255,0.08) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(108,71,255,0.06) 0%, transparent 70%)" }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#6C47FF" }}
              >
                <Sparkles size={18} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A2E" }}>
                  Your Weekly Review
                </h3>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#6C47FF" }}>
                  AI Generated
                </span>
              </div>
            </div>

            <div
              className="p-5 rounded-2xl mb-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p style={{ fontSize: 15, color: "#1A1A2E", lineHeight: 1.7 }}>
                This week you spent{" "}
                <span style={{ fontWeight: 700, color: "#EF4444" }}>22% more on dining</span> than
                last week, mostly from Zomato and Swiggy orders. Your biggest win:{" "}
                <span style={{ fontWeight: 700, color: "#22C55E" }}>zero entertainment spend</span>{" "}
                — that's ₹750 saved compared to your usual pattern.{" "}
                <span style={{ fontWeight: 600, color: "#6C47FF" }}>
                  Tip: Try meal prepping on Sundays to cut Food costs by 30% next week.
                </span>
              </p>
            </div>

            <p style={{ fontSize: 12, color: "rgba(26,26,46,0.35)", fontWeight: 500 }}>
              Generated by Clutch AI · Every Sunday
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
