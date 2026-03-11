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
  TriangleAlert,
  X,
  Car,
  Home,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { DashboardSidebar } from "./DashboardSidebar";
import { useInsights, type TrendRow } from "../../../hooks/useInsights";
import { useExpenseSummary } from "../../../hooks/useExpenses";
import { useAI } from "../../../hooks/useAI";

// ─── Design tokens ─────────────────────────────
const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 12px rgba(108,71,255,0.08)",
};

// ─── Category meta ─────────────────────────────
const CATEGORY_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Food & Dining":    { icon: Utensils,     color: "#F59E0B", bg: "#FFF7ED" },
  "Transport":        { icon: Car,          color: "#6C47FF", bg: "#EDE9FF" },
  "Shopping":         { icon: ShoppingBag,  color: "#EF4444", bg: "#FEF2F2" },
  "Entertainment":    { icon: Gamepad2,     color: "#22C55E", bg: "#F0FDF4" },
  "Utilities":        { icon: Zap,          color: "#3B82F6", bg: "#EFF6FF" },
  "Health & Fitness": { icon: Heart,        color: "#EC4899", bg: "#FDF2F8" },
  "Housing":          { icon: Home,         color: "#78716C", bg: "#F5F5F4" },
  "Education":        { icon: GraduationCap,color: "#8B5CF6", bg: "#F5F3FF" },
  "Travel":           { icon: Plane,        color: "#06B6D4", bg: "#ECFEFF" },
  "Miscellaneous":    { icon: HelpCircle,   color: "#9CA3AF", bg: "#F9FAFB" },
};

const DEFAULT_META = { icon: HelpCircle, color: "#9CA3AF", bg: "#F9FAFB" };

function getCategoryMeta(cat: string) {
  return CATEGORY_META[cat] ?? DEFAULT_META;
}

// ─── localStorage helpers ───────────────────────
const DISMISS_KEY = "clutch:dismissed_anomalies";

function loadDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveDismissed(ids: Set<string>) {
  try {
    localStorage.setItem(DISMISS_KEY, JSON.stringify([...ids]));
  } catch {}
}

// ─── Chart colour map (category → hex) ─────────
const CAT_COLOR: Record<string, string> = {
  "Food & Dining": "#F59E0B",
  "Transport":     "#6C47FF",
  "Shopping":      "#EF4444",
  "Entertainment": "#22C55E",
  "Utilities":     "#3B82F6",
  "Health & Fitness": "#EC4899",
  "Housing":       "#78716C",
  "Education":     "#8B5CF6",
  "Travel":        "#06B6D4",
  "Miscellaneous": "#9CA3AF",
};

// ─── Transform raw TrendRow[] → stacked bar format ─
function buildBarData(trends: TrendRow[]) {
  // Group by week label, accumulate category totals
  const weekMap = new Map<string, Record<string, number>>();
  for (const row of trends) {
    const label = new Date(row.week).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    if (!weekMap.has(label)) weekMap.set(label, {});
    weekMap.get(label)![row.category] = (weekMap.get(label)![row.category] ?? 0) + row.total;
  }
  // Most-recent 4 weeks, chronological order
  const entries = [...weekMap.entries()].slice(-4);
  return entries.map(([week, cats]) => ({ week, ...cats }));
}

// ─── Pure SVG Stacked Bar Chart ────────────────
function StackedBarChart({ data }: { data: Record<string, any>[] }) {
  const [hovered, setHovered] = useState<{ weekIdx: number; catIdx: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Derive category keys and colours from the data itself
  const catKeys = [...new Set(data.flatMap((w) => Object.keys(w).filter((k) => k !== "week")))];
  const barCategories = catKeys.map((key) => ({ key, color: CAT_COLOR[key] ?? "#9CA3AF" }));

  const W = 520, H = 280;
  const PAD = { top: 20, right: 20, bottom: 30, left: 50 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const weeklySpendData = data;
  const weekTotals = weeklySpendData.map((w) => catKeys.reduce((s, k) => s + ((w as any)[k] || 0), 0));
  const maxVal = Math.ceil(Math.max(...weekTotals, 1000) / 1000) * 1000;
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxVal / 4) * i));
  const barGroupW = plotW / Math.max(weeklySpendData.length, 1);
  const barW = barGroupW * 0.5;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "visible" }} onMouseLeave={() => setHovered(null)}>
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
        {weeklySpendData.map((w, i) => (
          <text key={`xlabel-${w.week}`} x={PAD.left + barGroupW * i + barGroupW / 2} y={H - 6}
            textAnchor="middle" style={{ fontSize: 11, fill: "rgba(26,26,46,0.4)", fontFamily: "Inter, sans-serif" }}>
            {w.week}
          </text>
        ))}
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
                  <rect key={`bar-${w.week}-${catKey}`} x={groupX} y={y} width={barW}
                    height={Math.max(barH, 0)} rx={isLast ? 4 : 0} ry={isLast ? 4 : 0}
                    fill={barCategories[ci].color} opacity={hovered && !isHovered ? 0.5 : 1}
                    style={{ transition: "opacity 0.15s" }}
                    onMouseEnter={(e) => {
                      setHovered({ weekIdx: wi, catIdx: ci });
                      setTooltipPos({ x: groupX + barW / 2, y: y - 8 });
                    }} />
                );
              })}
            </g>
          );
        })}
        {hovered !== null && (() => {
          const w = weeklySpendData[hovered.weekIdx];
          const catKey = catKeys[hovered.catIdx];
          const val = (w as any)[catKey] || 0;
          const tooltipW = 120, tooltipH = 44;
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
function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const pieData = data;
  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);
  const size = 280, cx = size / 2, cy = size / 2, outerR = 90, innerR = 60, gap = 3;
  let startAngle = 90;
  const arcs = pieData.map((d, i) => {
    const sweepDeg = (d.value / pieTotal) * 360 - gap;
    const start = startAngle, end = startAngle - sweepDeg;
    startAngle = end - gap;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const outerStart = { x: cx + outerR * Math.cos(toRad(start)), y: cy - outerR * Math.sin(toRad(start)) };
    const outerEnd = { x: cx + outerR * Math.cos(toRad(end)), y: cy - outerR * Math.sin(toRad(end)) };
    const innerStart = { x: cx + innerR * Math.cos(toRad(end)), y: cy - innerR * Math.sin(toRad(end)) };
    const innerEnd = { x: cx + innerR * Math.cos(toRad(start)), y: cy - innerR * Math.sin(toRad(start)) };
    const largeArc = sweepDeg > 180 ? 1 : 0;
    const path = [`M ${outerStart.x} ${outerStart.y}`, `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerStart.x} ${innerStart.y}`, `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`, "Z"].join(" ");
    const midAngle = (start + end) / 2, labelR = outerR + 28;
    const labelX = cx + labelR * Math.cos(toRad(midAngle)), labelY = cy - labelR * Math.sin(toRad(midAngle));
    return { path, labelX, labelY, pct: Math.round((d.value / pieTotal) * 100), ...d, index: i };
  });

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ overflow: "visible" }} onMouseLeave={() => setHoveredIdx(null)}>
        {arcs.map((arc) => (
          <g key={`donut-${arc.name}`}>
            <path d={arc.path} fill={arc.color} opacity={hoveredIdx !== null && hoveredIdx !== arc.index ? 0.4 : 1}
              style={{ transition: "opacity 0.15s", cursor: "pointer" }} onMouseEnter={() => setHoveredIdx(arc.index)} />
            <text x={arc.labelX} y={arc.labelY} textAnchor={arc.labelX > cx ? "start" : "end"} dominantBaseline="central"
              style={{ fontSize: 11, fontWeight: 600, fill: "#1A1A2E", fontFamily: "Inter, sans-serif" }}>
              {arc.name} ({arc.pct}%)
            </text>
          </g>
        ))}
        {hoveredIdx !== null && (() => {
          const d = pieData[hoveredIdx];
          const pct = Math.round((d.value / pieTotal) * 100);
          return (
            <g>
              <text x={cx} y={cy - 10} textAnchor="middle" style={{ fontSize: 12, fontWeight: 600, fill: d.color, fontFamily: "Inter, sans-serif" }}>{d.name}</text>
              <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 15, fontWeight: 800, fill: "#1A1A2E", fontFamily: "Inter, sans-serif" }}>₹{d.value.toLocaleString()}</text>
              <text x={cx} y={cy + 26} textAnchor="middle" style={{ fontSize: 11, fill: "rgba(26,26,46,0.4)", fontFamily: "Inter, sans-serif" }}>{pct}% of total</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

function BarLegend({ cats }: { cats: { key: string; color: string }[] }) {
  return (
    <div className="flex items-center justify-center gap-5 mt-4 flex-wrap">
      {cats.map((c) => (
        <div key={c.key} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(26,26,46,0.5)" }}>{c.key}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Anomaly skeleton ──────────────────────────
function AnomalySkeleton() {
  return (
    <div className="p-5 flex flex-col gap-4 animate-pulse" style={cardStyle}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: "rgba(108,71,255,0.07)" }} />
          <div className="h-4 w-28 rounded" style={{ backgroundColor: "rgba(108,71,255,0.07)" }} />
        </div>
        <div className="h-6 w-16 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.07)" }} />
      </div>
      <div className="h-7 w-32 rounded" style={{ backgroundColor: "rgba(108,71,255,0.07)" }} />
      <div className="h-3 w-48 rounded" style={{ backgroundColor: "rgba(108,71,255,0.07)" }} />
      <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.07)" }} />
    </div>
  );
}

// ─── Habit skeleton ────────────────────────────
function HabitSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl animate-pulse" style={{ backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(108,71,255,0.06)" }}>
      <div className="w-11 h-11 rounded-xl shrink-0" style={{ backgroundColor: "rgba(108,71,255,0.07)" }} />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 w-40 rounded" style={{ backgroundColor: "rgba(108,71,255,0.07)" }} />
        <div className="h-3 w-24 rounded" style={{ backgroundColor: "rgba(108,71,255,0.07)" }} />
      </div>
      <div className="h-5 w-16 rounded" style={{ backgroundColor: "rgba(108,71,255,0.07)" }} />
    </div>
  );
}

// ─── Dismissible anomaly card ──────────────────
function AnomalyCard({
  category,
  current_total,
  avg_monthly_spend,
  spike_percentage,
  onDismiss,
}: {
  category: string;
  current_total: number;
  avg_monthly_spend: number;
  spike_percentage: number;
  onDismiss: () => void;
}) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;
  const pct = Math.round(spike_percentage);
  // severity: >100% = critical, >50% = high, else medium
  const severity = pct >= 100 ? "critical" : pct >= 50 ? "high" : "medium";
  const alertColor = severity === "critical" ? "#EF4444" : severity === "high" ? "#F59E0B" : "#F59E0B";
  const alertBg = severity === "critical" ? "rgba(239,68,68,0.05)" : "rgba(245,158,11,0.05)";
  const alertBorder = severity === "critical" ? "rgba(239,68,68,0.18)" : "rgba(245,158,11,0.18)";

  return (
    <Alert
      className="relative overflow-hidden border"
      style={{
        backgroundColor: alertBg,
        borderColor: alertBorder,
        borderRadius: 14,
        padding: "18px 20px",
      }}
    >
      {/* Top row: icon + category + % badge + dismiss */}
      <div className="flex items-start justify-between gap-3 col-span-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: meta.bg }}>
            <Icon size={20} color={meta.color} />
          </div>
          <div>
            <AlertTitle style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E", marginBottom: 0 }}>
              {category}
            </AlertTitle>
            <div className="flex items-center gap-1.5 mt-0.5">
              <TriangleAlert size={12} color={alertColor} />
              <span style={{ fontSize: 12, fontWeight: 600, color: alertColor }}>
                Spending spike detected
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ fontSize: 12, fontWeight: 700, color: alertColor, backgroundColor: `${alertColor}14` }}>
            <ArrowUpRight size={12} />
            +{pct}%
          </span>
          <button
            onClick={onDismiss}
            aria-label="Dismiss alert"
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none transition-colors"
            style={{ backgroundColor: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.35)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(26,26,46,0.12)"; e.currentTarget.style.color = "#1A1A2E"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(26,26,46,0.06)"; e.currentTarget.style.color = "rgba(26,26,46,0.35)"; }}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Amounts */}
      <AlertDescription className="col-span-2">
        <div className="flex items-baseline gap-1.5 mb-1.5">
          <span style={{ fontSize: 22, fontWeight: 800, color: "#1A1A2E" }}>
            ₹{Math.round(current_total).toLocaleString()}
          </span>
          <span style={{ fontSize: 13, color: "rgba(26,26,46,0.4)", fontWeight: 500 }}>spent</span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(26,26,46,0.5)" }}>
          vs ₹{Math.round(avg_monthly_spend).toLocaleString()} avg{" "}
          <span style={{ color: "rgba(26,26,46,0.3)" }}>(last 3 months)</span>
        </p>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(26,26,46,0.07)" }}>
          <div className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min((current_total / (avg_monthly_spend * 2)) * 100, 100)}%`,
              backgroundColor: alertColor,
            }} />
        </div>
      </AlertDescription>
    </Alert>
  );
}

// ─── Habit card ────────────────────────────────
function HabitCard({ habit, index }: { habit: { category: string; description: string; amount: number; frequency: number }; index: number }) {
  const meta = getCategoryMeta(habit.category);
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl"
      style={{
        backgroundColor: "#fff",
        boxShadow: "0 2px 8px rgba(108,71,255,0.06)",
        border: "1px solid rgba(108,71,255,0.05)",
      }}
    >
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: meta.bg }}>
        <Icon size={20} color={meta.color} />
      </div>

      {/* Description + category */}
      <div className="flex-1 min-w-0">
        <p className="truncate" style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>
          {habit.description}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="px-2 py-0.5 rounded-full"
            style={{ fontSize: 11, fontWeight: 600, color: meta.color, backgroundColor: `${meta.color}12` }}>
            {habit.category}
          </span>
          <span style={{ fontSize: 11, color: "rgba(26,26,46,0.35)", fontWeight: 500 }}>
            {habit.frequency}× in last 2 months
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>
          ₹{Math.round(habit.amount).toLocaleString()}
        </p>
        <p style={{ fontSize: 11, color: "rgba(26,26,46,0.35)", fontWeight: 500 }}>per occurrence</p>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────
export function InsightsPage() {
  const { anomalies, habits, trends, isLoading, trendsLoading } = useInsights();
  const { weeklyReview } = useAI();

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const summaryQuery = useExpenseSummary(currentMonth);

  // Build chart data from live sources
  const barData = buildBarData(trends);
  const barCats = [...new Set(trends.map((t) => t.category))].map((key) => ({
    key,
    color: CAT_COLOR[key] ?? "#9CA3AF",
  }));

  const pieData = Object.entries(summaryQuery.data?.categoryBreakdown ?? {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, color: CAT_COLOR[name] ?? "#9CA3AF" }))
    .sort((a, b) => b.value - a.value);

  // Dismissed anomaly IDs (by category) — initialised once from localStorage
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissed);

  const visibleAnomalies = anomalies.filter((a) => !dismissed.has(a.category));

  const handleDismiss = (category: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(category);
      saveDismissed(next);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#F7F6FF" }}>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <TrendingUp size={18} color="#EF4444" />
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A2E" }}>
                Spending Spikes This Month
              </h2>
            </div>
            {visibleAnomalies.length > 0 && !isLoading && (
              <span className="px-2.5 py-1 rounded-full"
                style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", backgroundColor: "rgba(239,68,68,0.08)" }}>
                {visibleAnomalies.length} active
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => <AnomalySkeleton key={i} />)}
            </div>
          ) : visibleAnomalies.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 rounded-2xl"
              style={{ backgroundColor: "rgba(34,197,94,0.05)", border: "1.5px dashed rgba(34,197,94,0.2)" }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
                <TrendingUp size={22} color="#22C55E" />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#22C55E" }}>No spending spikes</p>
              <p style={{ fontSize: 13, color: "rgba(26,26,46,0.4)", marginTop: 4 }}>
                {dismissed.size > 0
                  ? `${dismissed.size} alert${dismissed.size > 1 ? "s" : ""} dismissed · `
                  : ""}
                Your spending looks normal this month.
              </p>
              {dismissed.size > 0 && (
                <button
                  onClick={() => { setDismissed(new Set()); saveDismissed(new Set()); }}
                  className="mt-3 flex items-center gap-1.5 border-none bg-transparent cursor-pointer"
                  style={{ fontSize: 12, color: "#6C47FF", fontWeight: 600 }}
                >
                  <RefreshCw size={12} />
                  Restore dismissed alerts
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <AnimatePresence>
                {visibleAnomalies.map((a) => (
                  <motion.div
                    key={a.category}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0, overflow: "hidden" }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <AnomalyCard
                      category={a.category}
                      current_total={a.current_total}
                      avg_monthly_spend={a.avg_monthly_spend}
                      spike_percentage={a.spike_percentage}
                      onDismiss={() => handleDismiss(a.category)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Row 2: Stacked Bar + Donut ──────── */}
        <div className="grid grid-cols-5 gap-5 mb-8">
          <div className="col-span-3 p-6" style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E", marginBottom: 20 }}>
              Weekly Spend Breakdown
            </h3>
            {trendsLoading ? (
              <div className="h-[280px] rounded-xl animate-pulse" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
            ) : barData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center">
                <p style={{ fontSize: 14, color: "rgba(26,26,46,0.35)", fontWeight: 500 }}>No trend data yet.</p>
              </div>
            ) : (
              <>
                <StackedBarChart data={barData} />
                <BarLegend cats={barCats} />
              </>
            )}
          </div>
          <div className="col-span-2 p-6 flex flex-col" style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E", marginBottom: 8 }}>
              Category Split
            </h3>
            {summaryQuery.isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-[280px] h-[280px] rounded-full animate-pulse" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
              </div>
            ) : pieData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p style={{ fontSize: 14, color: "rgba(26,26,46,0.35)", fontWeight: 500 }}>No expenses this month.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 flex items-center justify-center">
                  <DonutChart data={pieData} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 justify-center">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(26,26,46,0.5)" }}>{d.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Row 3: Recurring Habits ──────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Repeat size={18} color="#6C47FF" />
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A2E" }}>
                Detected Spending Habits
              </h2>
            </div>
            {!isLoading && habits.length > 0 && (
              <span style={{ fontSize: 13, color: "rgba(26,26,46,0.4)" }}>
                {habits.length} pattern{habits.length !== 1 ? "s" : ""} detected
              </span>
            )}
          </div>

          <div
            className="flex flex-col gap-3 overflow-y-auto pr-1"
            style={{ maxHeight: 480 }}
          >
            {isLoading ? (
              [0, 1, 2, 3, 4].map((i) => <HabitSkeleton key={i} />)
            ) : habits.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 rounded-2xl"
                style={{ backgroundColor: "#fff", border: "1.5px dashed rgba(108,71,255,0.12)" }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: "#EDE9FF" }}>
                  <Repeat size={22} color="#6C47FF" />
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>No recurring habits yet</p>
                <p style={{ fontSize: 13, color: "rgba(26,26,46,0.4)", marginTop: 4 }}>
                  Habits appear after an expense recurs twice in the last 2 months.
                </p>
              </motion.div>
            ) : (
              habits.map((habit, i) => (
                <HabitCard key={`${habit.description}-${habit.amount}`} habit={habit} index={i} />
              ))
            )}
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
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(108,71,255,0.08) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(108,71,255,0.06) 0%, transparent 70%)" }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#6C47FF" }}>
                <Sparkles size={18} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A2E" }}>Your Weekly Review</h3>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#6C47FF" }}>AI Generated</span>
              </div>
            </div>

            {weeklyReview.isLoading ? (
              <div className="flex flex-col gap-3 animate-pulse">
                <div className="h-4 rounded-lg w-3/4" style={{ backgroundColor: "rgba(108,71,255,0.1)" }} />
                <div className="h-4 rounded-lg w-full" style={{ backgroundColor: "rgba(108,71,255,0.1)" }} />
                <div className="h-4 rounded-lg w-5/6" style={{ backgroundColor: "rgba(108,71,255,0.1)" }} />
              </div>
            ) : weeklyReview.data ? (
              <>
                <div className="p-5 rounded-2xl mb-4"
                  style={{ backgroundColor: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)" }}>
                  <p style={{ fontSize: 15, color: "#1A1A2E", lineHeight: 1.7 }}>
                    {weeklyReview.data.summary}
                  </p>
                  {weeklyReview.data.highlights?.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-1.5">
                      {weeklyReview.data.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2" style={{ fontSize: 13, color: "rgba(26,26,46,0.6)" }}>
                          <span style={{ color: "#6C47FF", marginTop: 2 }}>•</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p style={{ fontSize: 12, color: "rgba(26,26,46,0.35)", fontWeight: 500 }}>
                  Week of {new Date(weeklyReview.data.week_start_date).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })} · Generated by Clutch AI
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 rounded-2xl"
                style={{ backgroundColor: "rgba(255,255,255,0.5)" }}>
                <Sparkles size={28} color="rgba(108,71,255,0.3)" />
                <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(26,26,46,0.4)", marginTop: 12 }}>
                  No weekly review yet
                </p>
                <p style={{ fontSize: 13, color: "rgba(26,26,46,0.3)", marginTop: 4 }}>
                  Reviews are generated every Sunday by the Clutch worker.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
