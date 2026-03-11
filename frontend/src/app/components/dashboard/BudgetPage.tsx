import { useState } from "react";
import {
  Plus,
  ChevronDown,
  Calendar,
  Pencil,
  Utensils,
  Heart,
  Plane,
  TrendingUp,
  Gamepad2,
  ArrowDownRight,
  ArrowUpRight,
  X,
  Zap,
  Car,
  Home,
  ShoppingBag,
  GraduationCap,
  HelpCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DashboardSidebar } from "./DashboardSidebar";
import { useBudget, type BudgetStatus, type CategoryStatus } from "../../../hooks/useBudget";

// ─── Constants ─────────────────────────────────

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Backend category names → icon + color
const CATEGORY_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Food & Dining":    { icon: Utensils,    color: "#F59E0B", bg: "#FFF7ED" },
  "Transport":        { icon: Car,         color: "#6C47FF", bg: "#EDE9FF" },
  "Shopping":         { icon: ShoppingBag, color: "#EF4444", bg: "#FEF2F2" },
  "Entertainment":    { icon: Gamepad2,    color: "#22C55E", bg: "#F0FDF4" },
  "Utilities":        { icon: Zap,         color: "#3B82F6", bg: "#EFF6FF" },
  "Health & Fitness": { icon: Heart,       color: "#EC4899", bg: "#FDF2F8" },
  "Housing":          { icon: Home,        color: "#78716C", bg: "#F5F5F4" },
  "Education":        { icon: GraduationCap, color: "#8B5CF6", bg: "#F5F3FF" },
  "Travel":           { icon: Plane,       color: "#06B6D4", bg: "#ECFEFF" },
  "Investments":      { icon: TrendingUp,  color: "#22C55E", bg: "#F0FDF4" },
  "Miscellaneous":    { icon: HelpCircle,  color: "#9CA3AF", bg: "#F9FAFB" },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_META);

const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 12px rgba(108,71,255,0.08)",
};

// ─── Helpers ───────────────────────────────────

function getProgressColor(percent: number): string {
  if (percent >= 90) return "#EF4444";
  if (percent >= 75) return "#F59E0B";
  return "#6C47FF";
}

// ─── Circular Progress ─────────────────────────

function CircularProgress({
  percent, size = 100, strokeWidth = 8, color, label, sublabel,
}: {
  percent: number; size?: number; strokeWidth?: number;
  color: string; label?: string; sublabel?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F0EEFF" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span style={{ fontSize: size > 120 ? 24 : 13, fontWeight: 700, color: "#1A1A2E" }}>{label}</span>}
        {sublabel && <span style={{ fontSize: size > 120 ? 12 : 10, color: "rgba(26,26,46,0.4)", fontWeight: 500 }}>{sublabel}</span>}
      </div>
    </div>
  );
}

// ─── Semi-circular Arc ─────────────────────────

function SemiCircularArc({ percent, size = 160 }: { percent: number; size?: number }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size / 2 + 20 }}>
      <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
        <path d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none" stroke="#fff" strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>{Math.min(percent, 100)}%</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>used</span>
      </div>
    </div>
  );
}

// ─── Status Badge ──────────────────────────────

function StatusBadge({ percent }: { percent: number }) {
  const { label, bg, color } =
    percent >= 100 ? { label: "over budget",    bg: "rgba(239,68,68,0.08)",   color: "#EF4444" }
    : percent >= 75 ? { label: "need attention", bg: "rgba(245,158,11,0.08)",  color: "#F59E0B" }
    :                 { label: "on track",        bg: "rgba(34,197,94,0.08)",   color: "#22C55E" };

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
      style={{ fontSize: 12, fontWeight: 600, color, backgroundColor: bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

// ─── Skeleton ──────────────────────────────────

function CategoryCardSkeleton() {
  return (
    <div className="p-5 flex flex-col gap-4" style={cardStyle}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
          <div className="h-4 w-28 rounded-lg animate-pulse" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-full animate-pulse" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-16 rounded animate-pulse" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
          <div className="h-6 w-24 rounded animate-pulse" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
        </div>
      </div>
      <div className="h-6 w-20 rounded-full animate-pulse" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
    </div>
  );
}

// ─── Bar Chart ─────────────────────────────────

function BudgetBarChart({ categoryStatus }: { categoryStatus: CategoryStatus[] }) {
  const data = categoryStatus.map((cat) => ({
    name: cat.category.replace(" & ", " &\n"),
    Used: Math.round(cat.spent),
    Limit: Math.round(cat.limit),
    pct: cat.percentUsed,
  }));

  return (
    <div style={cardStyle} className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E" }}>Spending vs Limit</h2>
        <span style={{ fontSize: 12, color: "rgba(26,26,46,0.4)", fontWeight: 500 }}>per category · this month</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={4} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,71,255,0.06)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "rgba(26,26,46,0.45)", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "rgba(26,26,46,0.4)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            width={48}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`₹${value.toLocaleString()}`, name]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(108,71,255,0.08)",
              boxShadow: "0 8px 24px rgba(108,71,255,0.1)",
              fontSize: 13,
              fontWeight: 500,
            }}
            cursor={{ fill: "rgba(108,71,255,0.03)" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 16 }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="Used" fill="#6C47FF" radius={[5, 5, 0, 0]} maxBarSize={32} />
          <Bar dataKey="Limit" fill="rgba(108,71,255,0.15)" radius={[5, 5, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Set Budget Modal ──────────────────────────

function SetBudgetModal({
  open,
  onClose,
  onSave,
  isSaving,
  budgetStatus,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (category: string, limit: number, totalIncome: number) => void;
  isSaving: boolean;
  budgetStatus: BudgetStatus | null;
}) {
  const [category, setCategory] = useState(ALL_CATEGORIES[0]);
  const [limitAmount, setLimitAmount] = useState("");
  const [income, setIncome] = useState("");
  const [catOpen, setCatOpen] = useState(false);

  if (!open) return null;

  const existingLimit = budgetStatus?.categoryStatus.find((c) => c.category === category)?.limit;
  const existingIncome = budgetStatus?.totalBudget;

  const handleSave = () => {
    const limit = parseFloat(limitAmount) || existingLimit || 0;
    const totalIncome = parseFloat(income) || existingIncome || 0;
    if (!limit || !totalIncome) return;
    onSave(category, limit, totalIncome);
    setLimitAmount("");
    setIncome("");
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[60]"
        style={{ backgroundColor: "rgba(26,26,46,0.2)" }}
        onClick={onClose}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[440px] p-8 flex flex-col gap-6"
        style={{ ...cardStyle, boxShadow: "0 24px 64px rgba(108,71,255,0.15)" }}
      >
        <div className="flex items-center justify-between">
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A2E" }}>Set Budget</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none"
            style={{ backgroundColor: "#F7F6FF", color: "rgba(26,26,46,0.4)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Monthly income */}
        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>
            Monthly Income / Total Budget
          </label>
          <div
            className="flex items-center rounded-xl px-4 overflow-hidden"
            style={{ backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.08)" }}
          >
            <span style={{ fontSize: 18, fontWeight: 700, color: "#6C47FF", marginRight: 4 }}>₹</span>
            <input
              type="number"
              placeholder={existingIncome ? String(existingIncome) : "0"}
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="flex-1 bg-transparent py-3.5 outline-none"
              style={{ fontSize: 18, fontWeight: 600, color: "#1A1A2E", border: "none" }}
            />
          </div>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2 relative">
          <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>Category</label>
          <button
            onClick={() => setCatOpen(!catOpen)}
            className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer border-none"
            style={{ fontSize: 14, fontWeight: 500, color: "#1A1A2E", backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.08)" }}
          >
            <div className="flex items-center gap-2.5">
              {(() => {
                const meta = CATEGORY_META[category];
                if (meta) { const Icon = meta.icon; return <Icon size={15} color={meta.color} />; }
                return null;
              })()}
              <span>{category}</span>
            </div>
            <ChevronDown size={14} color="rgba(26,26,46,0.3)" />
          </button>
          {catOpen && (
            <div
              className="absolute top-full left-0 right-0 mt-1 py-2 rounded-xl z-10 max-h-52 overflow-y-auto"
              style={{ backgroundColor: "#fff", boxShadow: "0 8px 32px rgba(108,71,255,0.12)", border: "1px solid rgba(108,71,255,0.06)" }}
            >
              {ALL_CATEGORIES.map((c) => {
                const meta = CATEGORY_META[c];
                const Icon = meta?.icon ?? HelpCircle;
                return (
                  <button
                    key={c}
                    onClick={() => { setCategory(c); setCatOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 cursor-pointer border-none transition-colors"
                    style={{
                      fontSize: 14,
                      fontWeight: category === c ? 600 : 400,
                      color: category === c ? "#6C47FF" : "#1A1A2E",
                      backgroundColor: category === c ? "#EDE9FF" : "transparent",
                    }}
                    onMouseEnter={(e) => { if (category !== c) e.currentTarget.style.backgroundColor = "#F7F6FF"; }}
                    onMouseLeave={(e) => { if (category !== c) e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <Icon size={15} color={meta?.color ?? "#9CA3AF"} />
                    <span>{c}</span>
                    {budgetStatus?.categoryStatus.find((s) => s.category === c) && (
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(26,26,46,0.35)" }}>
                        ₹{budgetStatus.categoryStatus.find((s) => s.category === c)!.limit.toLocaleString()} set
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Limit amount */}
        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>
            Category Limit
            {existingLimit && (
              <span style={{ fontWeight: 400, color: "rgba(26,26,46,0.35)", marginLeft: 6 }}>
                (current: ₹{existingLimit.toLocaleString()})
              </span>
            )}
          </label>
          <div
            className="flex items-center rounded-xl px-4 overflow-hidden"
            style={{ backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.08)" }}
          >
            <span style={{ fontSize: 18, fontWeight: 700, color: "#6C47FF", marginRight: 4 }}>₹</span>
            <input
              type="number"
              placeholder={existingLimit ? String(existingLimit) : "0"}
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              className="flex-1 bg-transparent py-3.5 outline-none"
              style={{ fontSize: 18, fontWeight: 600, color: "#1A1A2E", border: "none" }}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90 border-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#6C47FF", fontSize: 15, fontWeight: 600, boxShadow: "0 4px 20px rgba(108,71,255,0.25)" }}
        >
          {isSaving ? "Saving…" : "Save Budget"}
        </button>
      </div>
    </>
  );
}

// ─── Main Budget Page ──────────────────────────

export function BudgetPage() {
  const [selectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(2); // March (0-indexed)
  const [monthOpen, setMonthOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const monthParam = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
  const { budgetStatus, isLoading, noBudget, setBudget } = useBudget(monthParam);

  const totalBudget = budgetStatus?.totalBudget ?? 0;
  const totalSpent = budgetStatus?.totalSpent ?? 0;
  const totalRemaining = totalBudget - totalSpent;
  const spentPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const handleSetBudget = (category: string, limit: number, totalIncome: number) => {
    // Merge new category limit into existing limits
    const existingLimits = Object.fromEntries(
      (budgetStatus?.categoryStatus ?? []).map((c) => [c.category, c.limit]),
    );
    setBudget.mutate({
      month: monthParam,
      totalIncome,
      categoryLimits: { ...existingLimits, [category]: limit },
    });
  };

  // Sort categoryStatus by spent descending for the sidebar
  const topCategories = budgetStatus
    ? [...budgetStatus.categoryStatus].sort((a, b) => b.spent - a.spent).slice(0, 6)
    : [];

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#F7F6FF" }}>
      <DashboardSidebar activePage="Budget" />

      <main className="flex-1 ml-16 p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.02em" }}>Budget</h1>
            <p style={{ fontSize: 14, color: "rgba(26,26,46,0.45)", marginTop: 4 }}>Set limits. Stay in control.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Month picker */}
            <div className="relative">
              <button
                onClick={() => setMonthOpen(!monthOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer border-none"
                style={{ ...cardStyle, fontSize: 14, fontWeight: 500, color: "#1A1A2E" }}
              >
                <Calendar size={15} color="#6C47FF" />
                {months[selectedMonth]} {selectedYear}
                <ChevronDown size={14} color="rgba(26,26,46,0.3)" />
              </button>
              {monthOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMonthOpen(false)} />
                  <div
                    className="absolute top-full right-0 mt-1 py-2 rounded-xl z-20 max-h-60 overflow-y-auto"
                    style={{ width: 180, backgroundColor: "#fff", boxShadow: "0 8px 32px rgba(108,71,255,0.12)", border: "1px solid rgba(108,71,255,0.06)" }}
                  >
                    {months.map((m, i) => (
                      <button
                        key={m}
                        onClick={() => { setSelectedMonth(i); setMonthOpen(false); }}
                        className="w-full text-left px-4 py-2 cursor-pointer border-none transition-colors"
                        style={{
                          fontSize: 14, fontWeight: selectedMonth === i ? 600 : 400,
                          color: selectedMonth === i ? "#6C47FF" : "#1A1A2E",
                          backgroundColor: selectedMonth === i ? "#EDE9FF" : "transparent",
                        }}
                        onMouseEnter={(e) => { if (selectedMonth !== i) e.currentTarget.style.backgroundColor = "#F7F6FF"; }}
                        onMouseLeave={(e) => { if (selectedMonth !== i) e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90 border-none"
              style={{ backgroundColor: "#6C47FF", fontSize: 14, fontWeight: 600, boxShadow: "0 4px 20px rgba(108,71,255,0.25)" }}
            >
              <Plus size={16} />
              Set Budget
            </button>
          </div>
        </div>

        {/* No budget state */}
        {noBudget && (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-2xl mb-6"
            style={{ ...cardStyle, border: "2px dashed rgba(108,71,255,0.15)" }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: "#EDE9FF" }}>
              <Zap size={26} color="#6C47FF" />
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#1A1A2E" }}>No budget set for {months[selectedMonth]}</p>
            <p style={{ fontSize: 14, color: "rgba(26,26,46,0.45)", marginTop: 6 }}>
              Click "Set Budget" to configure your monthly limits.
            </p>
          </div>
        )}

        {!noBudget && (
          <div className="flex gap-6">
            {/* Left: main content */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
              {/* Summary gradient card */}
              <div
                className="p-7 flex items-center justify-between"
                style={{
                  borderRadius: 20,
                  background: "linear-gradient(135deg, #6C47FF 0%, #8B6AFF 50%, #A78BFA 100%)",
                  boxShadow: "0 8px 32px rgba(108,71,255,0.3)",
                }}
              >
                <div className="flex flex-col gap-2">
                  <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>Monthly Budget</span>
                  <span style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                    {isLoading ? "—" : `₹${totalBudget.toLocaleString()}`}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                      ₹{totalSpent.toLocaleString()} spent
                    </span>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>·</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                      ₹{totalRemaining.toLocaleString()} remaining
                    </span>
                  </div>
                </div>

                <SemiCircularArc percent={spentPercent} size={160} />

                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <Zap size={16} color="rgba(255,255,255,0.7)" />
                    <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>Spend Velocity</span>
                  </div>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>
                    {isLoading ? "—" : `₹${(budgetStatus?.spendVelocity ?? 0).toLocaleString()}/day`}
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-full mt-1"
                    style={{
                      fontSize: 12, fontWeight: 600,
                      color: spentPercent >= 90 ? "#EF4444" : spentPercent >= 75 ? "#F59E0B" : "#22C55E",
                      backgroundColor: spentPercent >= 90 ? "rgba(239,68,68,0.15)" : spentPercent >= 75 ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)",
                    }}
                  >
                    {spentPercent >= 90 ? "Over budget" : spentPercent >= 75 ? "Near limit" : "On track"}
                  </span>
                </div>
              </div>

              {/* Category cards */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E" }}>Category Budgets</h2>
                  {budgetStatus && (
                    <span style={{ fontSize: 13, color: "rgba(26,26,46,0.4)" }}>
                      {budgetStatus.categoryStatus.length} categories
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => <CategoryCardSkeleton key={i} />)
                    : budgetStatus?.categoryStatus.map((cat) => {
                        const meta = CATEGORY_META[cat.category];
                        const Icon = meta?.icon ?? HelpCircle;
                        const iconColor = meta?.color ?? "#9CA3AF";
                        const iconBg = meta?.bg ?? "#F9FAFB";
                        const progressColor = getProgressColor(cat.percentUsed);
                        const remaining = Math.max(0, cat.limit - cat.spent);

                        return (
                          <div
                            key={cat.category}
                            className="p-5 flex flex-col gap-4 transition-all hover:translate-y-[-2px]"
                            style={{ ...cardStyle, cursor: "default" }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                  style={{ backgroundColor: iconBg }}>
                                  <Icon size={18} color={iconColor} />
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E" }}>
                                  {cat.category}
                                </span>
                              </div>
                              <button
                                onClick={() => setShowModal(true)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-colors"
                                style={{ backgroundColor: "#F7F6FF", color: "rgba(26,26,46,0.3)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#EDE9FF"; e.currentTarget.style.color = "#6C47FF"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F7F6FF"; e.currentTarget.style.color = "rgba(26,26,46,0.3)"; }}
                              >
                                <Pencil size={14} />
                              </button>
                            </div>

                            <div className="flex items-center gap-5">
                              <CircularProgress
                                percent={Math.min(cat.percentUsed, 100)}
                                size={80}
                                strokeWidth={7}
                                color={progressColor}
                                label={`${cat.percentUsed}%`}
                                sublabel="spent"
                              />
                              <div className="flex flex-col gap-1 min-w-0">
                                <span style={{ fontSize: 12, color: "rgba(26,26,46,0.4)", fontWeight: 500 }}>Left</span>
                                <div className="flex items-baseline gap-0.5">
                                  <span style={{ fontSize: 22, fontWeight: 700, color: "#1A1A2E" }}>
                                    ₹{remaining.toLocaleString()}
                                  </span>
                                  <span style={{ fontSize: 12, color: "rgba(26,26,46,0.35)" }}>
                                    /₹{cat.limit.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <StatusBadge percent={cat.percentUsed} />
                          </div>
                        );
                      })}
                </div>
              </div>

              {/* Recharts bar chart */}
              {budgetStatus && budgetStatus.categoryStatus.length > 0 && (
                <BudgetBarChart categoryStatus={budgetStatus.categoryStatus} />
              )}
            </div>

            {/* Right sidebar: top spend */}
            <div
              className="flex flex-col gap-5 p-6 shrink-0"
              style={{ width: 280, ...cardStyle, height: "fit-content", position: "sticky", top: 32 }}
            >
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>Most Expenses</h3>
                <p style={{ fontSize: 12, color: "rgba(26,26,46,0.4)", marginTop: 2 }}>This Month</p>
              </div>

              <div className="flex flex-col gap-1">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-3 px-2">
                        <div className="w-10 h-10 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(108,71,255,0.06)", flexShrink: 0 }} />
                        <div className="flex-1 flex flex-col gap-1.5">
                          <div className="h-3.5 w-20 rounded animate-pulse" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
                          <div className="h-3 w-28 rounded animate-pulse" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
                        </div>
                      </div>
                    ))
                  : topCategories.map((cat) => {
                      const meta = CATEGORY_META[cat.category];
                      const Icon = meta?.icon ?? HelpCircle;
                      const pctVsLimit = cat.percentUsed;
                      return (
                        <div
                          key={cat.category}
                          className="flex items-center gap-3 py-3 px-2 rounded-xl transition-colors"
                          style={{ cursor: "default" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F7F6FF")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: meta?.bg ?? "#F9FAFB" }}>
                            <Icon size={18} color={meta?.color ?? "#9CA3AF"} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block truncate" style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E" }}>
                              ₹{Math.round(cat.spent).toLocaleString()}
                            </span>
                            <span className="block truncate" style={{ fontSize: 11, color: "rgba(26,26,46,0.4)" }}>
                              {cat.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {pctVsLimit >= 80 ? (
                              <ArrowUpRight size={13} color="#EF4444" />
                            ) : (
                              <ArrowDownRight size={13} color="#22C55E" />
                            )}
                            <span style={{ fontSize: 12, fontWeight: 600, color: pctVsLimit >= 80 ? "#EF4444" : "#22C55E" }}>
                              {pctVsLimit}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>
        )}
      </main>

      <SetBudgetModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSetBudget}
        isSaving={setBudget.isPending}
        budgetStatus={budgetStatus}
      />
    </div>
  );
}
