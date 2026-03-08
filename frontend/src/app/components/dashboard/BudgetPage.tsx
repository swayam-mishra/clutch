import { useState } from "react";
import {
  Plus,
  ChevronDown,
  Calendar,
  Pencil,
  Utensils,
  Coffee,
  Heart,
  Plane,
  TrendingUp,
  Gamepad2,
  ArrowDownRight,
  ArrowUpRight,
  X,
  Zap,
} from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";

// ─── Types ─────────────────────────────────────
interface BudgetCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  iconColor: string;
  spent: number;
  total: number;
}

interface TopExpense {
  name: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  amount: number;
  changePercent: number;
  direction: "up" | "down";
}

// ─── Data ──────────────────────────────────────
const budgetCategories: BudgetCategory[] = [
  { id: "food", name: "Food & Groceries", icon: Utensils, iconColor: "#F59E0B", spent: 2800, total: 4000 },
  { id: "cafe", name: "Cafe & Restaurants", icon: Coffee, iconColor: "#6C47FF", spent: 1600, total: 2100 },
  { id: "health", name: "Health & Beauty", icon: Heart, iconColor: "#EC4899", spent: 235, total: 500 },
  { id: "travel", name: "Traveling", icon: Plane, iconColor: "#3B82F6", spent: 350, total: 400 },
  { id: "invest", name: "Investments", icon: TrendingUp, iconColor: "#22C55E", spent: 200, total: 800 },
  { id: "entertain", name: "Entertainment", icon: Gamepad2, iconColor: "#EF4444", spent: 150, total: 1500 },
];

const topExpenses: TopExpense[] = [
  { name: "Food & Groceries", icon: Utensils, iconBg: "#FFF7ED", iconColor: "#F59E0B", amount: 2800, changePercent: 5.5, direction: "up" },
  { name: "Cafe & Restaurants", icon: Coffee, iconBg: "#EDE9FF", iconColor: "#6C47FF", amount: 1600, changePercent: 10.2, direction: "up" },
  { name: "Traveling", icon: Plane, iconBg: "#EFF6FF", iconColor: "#3B82F6", amount: 350, changePercent: 3.0, direction: "up" },
  { name: "Health & Beauty", icon: Heart, iconBg: "#FDF2F8", iconColor: "#EC4899", amount: 235, changePercent: 26.3, direction: "down" },
  { name: "Investments", icon: TrendingUp, iconBg: "#F0FDF4", iconColor: "#22C55E", amount: 200, changePercent: 6.2, direction: "up" },
  { name: "Entertainment", icon: Gamepad2, iconBg: "#FEF2F2", iconColor: "#EF4444", amount: 150, changePercent: 1.5, direction: "down" },
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const totalBudget = 15000;
const totalSpent = 6200;
const totalRemaining = totalBudget - totalSpent;
const spentPercent = Math.round((totalSpent / totalBudget) * 100);

const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 12px rgba(108,71,255,0.08)",
};

// ─── Circular Progress Component ───────────────
function CircularProgress({
  percent,
  size = 100,
  strokeWidth = 8,
  color,
  label,
  sublabel,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label?: string;
  sublabel?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F0EEFF"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span style={{ fontSize: size > 120 ? 24 : 13, fontWeight: 700, color: "#1A1A2E" }}>
            {label}
          </span>
        )}
        {sublabel && (
          <span style={{ fontSize: size > 120 ? 12 : 10, color: "rgba(26,26,46,0.4)", fontWeight: 500 }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Semi-circular Arc for Summary ─────────────
function SemiCircularArc({ percent, size = 160 }: { percent: number; size?: number }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // semicircle
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size / 2 + 20 }}>
      <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="#fff"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>{percent}%</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>used</span>
      </div>
    </div>
  );
}

// ─── Status Badge ──────────────────────────────
function StatusBadge({ percent }: { percent: number }) {
  let label: string;
  let bg: string;
  let color: string;

  if (percent >= 90) {
    label = "over budget";
    bg = "rgba(239,68,68,0.08)";
    color = "#EF4444";
  } else if (percent >= 75) {
    label = "need attention";
    bg = "rgba(245,158,11,0.08)";
    color = "#F59E0B";
  } else {
    label = "on track";
    bg = "rgba(34,197,94,0.08)";
    color = "#22C55E";
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
      style={{ fontSize: 12, fontWeight: 600, color, backgroundColor: bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

// ─── Get Progress Color ────────────────────────
function getProgressColor(percent: number): string {
  if (percent >= 90) return "#EF4444";
  if (percent >= 75) return "#F59E0B";
  return "#6C47FF";
}

// ─── Set Budget Modal ──────────────────────────
function SetBudgetModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [category, setCategory] = useState("Food & Groceries");
  const [amount, setAmount] = useState("");
  const [catOpen, setCatOpen] = useState(false);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60]"
        style={{ backgroundColor: "rgba(26,26,46,0.2)" }}
        onClick={onClose}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[420px] p-8 flex flex-col gap-6"
        style={{
          ...cardStyle,
          boxShadow: "0 24px 64px rgba(108,71,255,0.15)",
        }}
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

        {/* Category */}
        <div className="flex flex-col gap-2 relative">
          <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>Category</label>
          <button
            onClick={() => setCatOpen(!catOpen)}
            className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer border-none"
            style={{ fontSize: 14, fontWeight: 500, color: "#1A1A2E", backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.08)" }}
          >
            <span>{category}</span>
            <ChevronDown size={14} color="rgba(26,26,46,0.3)" />
          </button>
          {catOpen && (
            <div
              className="absolute top-full left-0 right-0 mt-1 py-2 rounded-xl z-10"
              style={{ backgroundColor: "#fff", boxShadow: "0 8px 32px rgba(108,71,255,0.12)", border: "1px solid rgba(108,71,255,0.06)" }}
            >
              {budgetCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setCategory(c.name); setCatOpen(false); }}
                  className="w-full text-left px-4 py-2.5 cursor-pointer border-none transition-colors"
                  style={{
                    fontSize: 14,
                    fontWeight: category === c.name ? 600 : 400,
                    color: category === c.name ? "#6C47FF" : "#1A1A2E",
                    backgroundColor: category === c.name ? "#EDE9FF" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (category !== c.name) e.currentTarget.style.backgroundColor = "#F7F6FF"; }}
                  onMouseLeave={(e) => { if (category !== c.name) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>Budget Amount</label>
          <div
            className="flex items-center rounded-xl px-4 overflow-hidden"
            style={{ backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.08)" }}
          >
            <span style={{ fontSize: 18, fontWeight: 700, color: "#6C47FF", marginRight: 4 }}>₹</span>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent py-3.5 outline-none"
              style={{ fontSize: 18, fontWeight: 600, color: "#1A1A2E", border: "none" }}
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90 border-none"
          style={{
            backgroundColor: "#6C47FF",
            fontSize: 15,
            fontWeight: 600,
            boxShadow: "0 4px 20px rgba(108,71,255,0.25)",
          }}
        >
          Save Budget
        </button>
      </div>
    </>
  );
}

// ─── Main Budget Page ──────────────────────────
export function BudgetPage() {
  const [selectedMonth, setSelectedMonth] = useState(2); // March
  const [monthOpen, setMonthOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#F7F6FF" }}
    >
      <DashboardSidebar activePage="Budget" />

      <main className="flex-1 ml-16 p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
              Budget
            </h1>
            <p style={{ fontSize: 14, color: "rgba(26,26,46,0.45)", marginTop: 4 }}>
              Set limits. Stay in control.
            </p>
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
                {months[selectedMonth]} 2026
                <ChevronDown size={14} color="rgba(26,26,46,0.3)" />
              </button>
              {monthOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMonthOpen(false)} />
                  <div
                    className="absolute top-full right-0 mt-1 py-2 rounded-xl z-20 max-h-60 overflow-y-auto"
                    style={{
                      width: 180,
                      backgroundColor: "#fff",
                      boxShadow: "0 8px 32px rgba(108,71,255,0.12)",
                      border: "1px solid rgba(108,71,255,0.06)",
                    }}
                  >
                    {months.map((m, i) => (
                      <button
                        key={m}
                        onClick={() => { setSelectedMonth(i); setMonthOpen(false); }}
                        className="w-full text-left px-4 py-2 cursor-pointer border-none transition-colors"
                        style={{
                          fontSize: 14,
                          fontWeight: selectedMonth === i ? 600 : 400,
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

            {/* Set Budget button */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90 border-none"
              style={{
                backgroundColor: "#6C47FF",
                fontSize: 14,
                fontWeight: 600,
                boxShadow: "0 4px 20px rgba(108,71,255,0.25)",
              }}
            >
              <Plus size={16} />
              Set Budget
            </button>
          </div>
        </div>

        {/* Content grid: main + sidebar */}
        <div className="flex gap-6">
          {/* Left: main content */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* Summary Card — Violet Gradient */}
            <div
              className="p-7 flex items-center justify-between"
              style={{
                borderRadius: 20,
                background: "linear-gradient(135deg, #6C47FF 0%, #8B6AFF 50%, #A78BFA 100%)",
                boxShadow: "0 8px 32px rgba(108,71,255,0.3)",
              }}
            >
              {/* Left */}
              <div className="flex flex-col gap-2">
                <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>
                  Monthly Budget
                </span>
                <span style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                  ₹{totalBudget.toLocaleString()}
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

              {/* Center — Arc */}
              <SemiCircularArc percent={spentPercent} size={160} />

              {/* Right */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <Zap size={16} color="rgba(255,255,255,0.7)" />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>
                    Spend Velocity
                  </span>
                </div>
                <span style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>
                  ₹412/day
                </span>
                <span
                  className="px-2.5 py-1 rounded-full mt-1"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#22C55E",
                    backgroundColor: "rgba(34,197,94,0.15)",
                  }}
                >
                  On track
                </span>
              </div>
            </div>

            {/* Category Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E" }}>Category Budgets</h2>
                <span style={{ fontSize: 13, color: "rgba(26,26,46,0.4)" }}>
                  {budgetCategories.length} categories
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {budgetCategories.map((cat) => {
                  const percent = Math.round((cat.spent / cat.total) * 100);
                  const progressColor = getProgressColor(percent);
                  const Icon = cat.icon;
                  const remaining = cat.total - cat.spent;

                  return (
                    <div
                      key={cat.id}
                      className="p-5 flex flex-col gap-4 transition-all hover:translate-y-[-2px]"
                      style={{
                        ...cardStyle,
                        cursor: "default",
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${cat.iconColor}12` }}
                          >
                            <Icon size={18} color={cat.iconColor} />
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>
                            {cat.name}
                          </span>
                        </div>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-colors"
                          style={{ backgroundColor: "#F7F6FF", color: "rgba(26,26,46,0.3)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#EDE9FF"; e.currentTarget.style.color = "#6C47FF"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F7F6FF"; e.currentTarget.style.color = "rgba(26,26,46,0.3)"; }}
                        >
                          <Pencil size={14} />
                        </button>
                      </div>

                      {/* Center: circular + amounts */}
                      <div className="flex items-center gap-5">
                        <CircularProgress
                          percent={Math.min(percent, 100)}
                          size={80}
                          strokeWidth={7}
                          color={progressColor}
                          label={`${percent}%`}
                          sublabel="spent"
                        />
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-baseline gap-1">
                            <span style={{ fontSize: 12, color: "rgba(26,26,46,0.4)", fontWeight: 500 }}>
                              Left
                            </span>
                          </div>
                          <div className="flex items-baseline gap-0.5">
                            <span style={{ fontSize: 22, fontWeight: 700, color: "#1A1A2E" }}>
                              ₹{remaining >= 0 ? remaining.toLocaleString() : 0}
                            </span>
                            <span style={{ fontSize: 12, color: "rgba(26,26,46,0.35)" }}>
                              /₹{cat.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <StatusBadge percent={percent} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Most Expenses Sidebar */}
          <div
            className="flex flex-col gap-5 p-6 shrink-0"
            style={{
              width: 280,
              ...cardStyle,
              height: "fit-content",
              position: "sticky",
              top: 32,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>Most Expenses</h3>
                <p style={{ fontSize: 12, color: "rgba(26,26,46,0.4)", marginTop: 2 }}>This Month</p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {topExpenses.map((exp) => {
                const Icon = exp.icon;
                return (
                  <div
                    key={exp.name}
                    className="flex items-center gap-3 py-3 px-2 rounded-xl transition-colors"
                    style={{ cursor: "default" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F7F6FF")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: exp.iconBg }}
                    >
                      <Icon size={18} color={exp.iconColor} />
                    </div>

                    {/* Name + Amount */}
                    <div className="flex-1 min-w-0">
                      <span
                        className="block truncate"
                        style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E" }}
                      >
                        ₹{exp.amount.toLocaleString()}
                      </span>
                      <span
                        className="block truncate"
                        style={{ fontSize: 11, color: "rgba(26,26,46,0.4)" }}
                      >
                        {exp.name}
                      </span>
                    </div>

                    {/* Change badge */}
                    <div className="flex items-center gap-1 shrink-0">
                      {exp.direction === "up" ? (
                        <ArrowUpRight size={13} color="#EF4444" />
                      ) : (
                        <ArrowDownRight size={13} color="#22C55E" />
                      )}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: exp.direction === "up" ? "#EF4444" : "#22C55E",
                        }}
                      >
                        {exp.changePercent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Set Budget Modal */}
      <SetBudgetModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
