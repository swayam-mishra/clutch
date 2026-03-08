import { useState } from "react";
import {
  Plus,
  X,
  Pencil,
  Wallet,
  Calendar,
  Target,
  Sparkles,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";

// ─── Design tokens ─────────────────────────────
const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 12px rgba(108,71,255,0.08)",
};

// ─── Types ─────────────────────────────────────
interface Goal {
  id: string;
  name: string;
  icon: string;
  target: number;
  saved: number;
  deadline: string;
  notes: string;
  createdAt: string;
}

// ─── Mock Data ─────────────────────────────────
const initialGoals: Goal[] = [
  {
    id: "emergency",
    name: "Emergency Fund",
    icon: "🛡️",
    target: 50000,
    saved: 18000,
    deadline: "2026-06-30",
    notes: "3 months of expenses as safety net.",
    createdAt: "2026-01-15",
  },
  {
    id: "laptop",
    name: "New Laptop",
    icon: "💻",
    target: 80000,
    saved: 52000,
    deadline: "2026-09-15",
    notes: "MacBook Air M4 for work.",
    createdAt: "2025-12-01",
  },
  {
    id: "goa",
    name: "Goa Trip",
    icon: "✈️",
    target: 25000,
    saved: 22500,
    deadline: "2026-04-20",
    notes: "Beach vacation with friends!",
    createdAt: "2026-02-10",
  },
  {
    id: "invest",
    name: "Investment Fund",
    icon: "📈",
    target: 100000,
    saved: 31000,
    deadline: "2026-12-31",
    notes: "Long-term equity fund contribution.",
    createdAt: "2026-01-01",
  },
];

// ─── Helper: format date ───────────────────────
function formatDeadline(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

function daysLeft(dateStr: string): number {
  const now = new Date("2026-03-08");
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ─── Contribution Modal ────────────────────────
function ContributionModal({
  open,
  goalName,
  onClose,
  onAdd,
}: {
  open: boolean;
  goalName: string;
  onClose: () => void;
  onAdd: (amount: number) => void;
}) {
  const [amount, setAmount] = useState("");

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60]"
        style={{ backgroundColor: "rgba(26,26,46,0.18)" }}
        onClick={onClose}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[400px] p-7 flex flex-col gap-5"
        style={{ ...cardStyle, boxShadow: "0 24px 64px rgba(108,71,255,0.18)" }}
      >
        <div className="flex items-center justify-between">
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E" }}>Add Contribution</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none"
            style={{ backgroundColor: "#F7F6FF", color: "rgba(26,26,46,0.4)" }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: 14, color: "rgba(26,26,46,0.5)" }}>
          Adding to <span style={{ fontWeight: 600, color: "#6C47FF" }}>{goalName}</span>
        </p>

        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>
            Amount
          </label>
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
          onClick={() => {
            const num = Number(amount);
            if (num > 0) {
              onAdd(num);
              setAmount("");
              onClose();
            }
          }}
          className="w-full py-3.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90 border-none"
          style={{
            backgroundColor: "#6C47FF",
            fontSize: 15,
            fontWeight: 600,
            boxShadow: "0 4px 20px rgba(108,71,255,0.25)",
          }}
        >
          Add Contribution
        </button>
      </div>
    </>
  );
}

// ─── Side Panel: New / Edit Goal ───────────────
function GoalPanel({
  open,
  onClose,
  onSave,
  editGoal,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, "id" | "saved" | "createdAt">) => void;
  editGoal?: Goal | null;
}) {
  const [name, setName] = useState(editGoal?.name || "");
  const [target, setTarget] = useState(editGoal?.target?.toString() || "");
  const [deadline, setDeadline] = useState(editGoal?.deadline || "");
  const [notes, setNotes] = useState(editGoal?.notes || "");

  // Reset when editGoal changes
  const resetKey = editGoal?.id || "new";

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[40]"
          style={{ backgroundColor: "rgba(26,26,46,0.15)" }}
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-[50] flex flex-col"
        style={{
          width: 380,
          backgroundColor: "#fff",
          boxShadow: open ? "-8px 0 40px rgba(108,71,255,0.12)" : "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{ borderBottom: "1px solid rgba(108,71,255,0.06)" }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E" }}>
            {editGoal ? "Edit Goal" : "New Goal"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none"
            style={{ backgroundColor: "#F7F6FF", color: "rgba(26,26,46,0.4)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-5" key={resetKey}>
          {/* Goal Name */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>
              Goal Name
            </label>
            <input
              type="text"
              placeholder="e.g. Emergency Fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#1A1A2E",
                backgroundColor: "#F7F6FF",
                border: "1px solid rgba(108,71,255,0.08)",
              }}
            />
          </div>

          {/* Target Amount */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>
              Target Amount
            </label>
            <div
              className="flex items-center rounded-xl px-4 overflow-hidden"
              style={{ backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.08)" }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: "#6C47FF", marginRight: 6 }}>
                ₹
              </span>
              <input
                type="number"
                placeholder="0"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="flex-1 bg-transparent py-3 outline-none"
                style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E", border: "none" }}
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>
              Deadline
            </label>
            <div
              className="flex items-center rounded-xl px-4 overflow-hidden"
              style={{ backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.08)" }}
            >
              <Calendar size={16} color="#6C47FF" style={{ marginRight: 8, flexShrink: 0 }} />
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="flex-1 bg-transparent py-3 outline-none cursor-pointer"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: deadline ? "#1A1A2E" : "rgba(26,26,46,0.35)",
                  border: "none",
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>
              Notes <span style={{ fontWeight: 400, color: "rgba(26,26,46,0.3)" }}>(optional)</span>
            </label>
            <textarea
              placeholder="Why is this goal important to you?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl outline-none resize-none"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#1A1A2E",
                backgroundColor: "#F7F6FF",
                border: "1px solid rgba(108,71,255,0.08)",
              }}
            />
          </div>
        </div>

        {/* Footer Button */}
        <div className="px-7 py-5" style={{ borderTop: "1px solid rgba(108,71,255,0.06)" }}>
          <button
            onClick={() => {
              if (name && target && deadline) {
                onSave({
                  name,
                  icon: editGoal?.icon || "🎯",
                  target: Number(target),
                  deadline,
                  notes,
                });
                setName("");
                setTarget("");
                setDeadline("");
                setNotes("");
                onClose();
              }
            }}
            className="w-full py-3.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90 border-none"
            style={{
              backgroundColor: "#6C47FF",
              fontSize: 15,
              fontWeight: 600,
              boxShadow: "0 4px 20px rgba(108,71,255,0.25)",
            }}
          >
            {editGoal ? "Save Changes" : "Create Goal"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Empty State ───────────────────────────────
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      {/* Illustration placeholder */}
      <div
        className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
        style={{ background: "linear-gradient(135deg, #EDE9FF 0%, #F7F6FF 100%)" }}
      >
        <Target size={52} color="#6C47FF" strokeWidth={1.5} />
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A2E", marginBottom: 8 }}>
        No goals yet
      </h3>
      <p
        style={{
          fontSize: 15,
          color: "rgba(26,26,46,0.45)",
          textAlign: "center",
          maxWidth: 340,
          lineHeight: 1.6,
          marginBottom: 28,
        }}
      >
        Start saving towards something meaningful. Set a goal, track your progress, and watch your
        savings grow.
      </p>
      <button
        onClick={onCreate}
        className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90 border-none"
        style={{
          backgroundColor: "#6C47FF",
          fontSize: 15,
          fontWeight: 600,
          boxShadow: "0 4px 24px rgba(108,71,255,0.3)",
        }}
      >
        <Plus size={18} />
        Create First Goal
      </button>
    </div>
  );
}

// ─── Goal Card ─────────────────────────────────
function GoalCard({
  goal,
  onContribute,
  onEdit,
}: {
  goal: Goal;
  onContribute: () => void;
  onEdit: () => void;
}) {
  const percent = Math.min(Math.round((goal.saved / goal.target) * 100), 100);
  const remaining = Math.max(goal.target - goal.saved, 0);
  const days = daysLeft(goal.deadline);
  const isAlmostDone = percent >= 90;
  const isComplete = percent >= 100;

  return (
    <div
      className="p-6 flex flex-col gap-5 transition-all hover:translate-y-[-2px]"
      style={{
        ...cardStyle,
        border: isComplete ? "1.5px solid rgba(34,197,94,0.2)" : "1px solid transparent",
      }}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: isComplete
                ? "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.15))"
                : "linear-gradient(135deg, #EDE9FF, #F7F6FF)",
            }}
          >
            <span style={{ fontSize: 24 }}>{goal.icon}</span>
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A2E" }}>{goal.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span style={{ fontSize: 13, color: "rgba(26,26,46,0.45)" }}>
                ₹{goal.target.toLocaleString()}
              </span>
              <span style={{ fontSize: 13, color: "rgba(26,26,46,0.2)" }}>·</span>
              <span style={{ fontSize: 13, color: "rgba(26,26,46,0.45)" }}>
                Due {formatDeadline(goal.deadline)}
              </span>
            </div>
          </div>
        </div>

        {/* Days left / Complete badge */}
        {isComplete ? (
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#22C55E",
              backgroundColor: "rgba(34,197,94,0.08)",
            }}
          >
            <Sparkles size={13} />
            Complete!
          </span>
        ) : (
          <span
            className="px-3 py-1.5 rounded-full"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: days <= 30 ? "#F59E0B" : "rgba(26,26,46,0.4)",
              backgroundColor: days <= 30 ? "rgba(245,158,11,0.08)" : "#F7F6FF",
            }}
          >
            {days}d left
          </span>
        )}
      </div>

      {/* Progress Section */}
      <div className="flex flex-col gap-2.5">
        {/* Progress bar with percentage */}
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: "#F0EEFF" }}
          >
            <div
              className="h-full rounded-full relative"
              style={{
                width: `${percent}%`,
                background: isComplete
                  ? "linear-gradient(90deg, #22C55E 0%, #4ADE80 100%)"
                  : isAlmostDone
                    ? "linear-gradient(90deg, #6C47FF 0%, #22C55E 100%)"
                    : "linear-gradient(90deg, #6C47FF 0%, #8B6AFF 100%)",
                transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </div>
          <span
            className="px-2.5 py-1 rounded-lg shrink-0"
            style={{
              fontSize: 13,
              fontWeight: 700,
              minWidth: 44,
              textAlign: "center",
              color: isComplete ? "#22C55E" : "#6C47FF",
              backgroundColor: isComplete ? "rgba(34,197,94,0.08)" : "#EDE9FF",
            }}
          >
            {percent}%
          </span>
        </div>

        {/* Amount label */}
        <div className="flex items-baseline gap-1">
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>
            ₹{goal.saved.toLocaleString()}
          </span>
          <span style={{ fontSize: 13, color: "rgba(26,26,46,0.35)" }}>
            saved of ₹{goal.target.toLocaleString()}
          </span>
        </div>

        {/* Subtle remaining info */}
        {!isComplete && (
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} color="rgba(26,26,46,0.3)" />
            <span style={{ fontSize: 12, color: "rgba(26,26,46,0.35)" }}>
              ₹{remaining.toLocaleString()} remaining
              {days > 0 && (
                <>
                  {" "}· ₹{Math.ceil(remaining / Math.max(days, 1)).toLocaleString()}/day needed
                </>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Notes (if any) */}
      {goal.notes && (
        <p
          className="px-3.5 py-2.5 rounded-xl"
          style={{
            fontSize: 13,
            color: "rgba(26,26,46,0.5)",
            backgroundColor: "#FAFAFF",
            lineHeight: 1.5,
          }}
        >
          {goal.notes}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onContribute}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer border-none transition-all"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#6C47FF",
            backgroundColor: "rgba(108,71,255,0.06)",
            border: "1px solid rgba(108,71,255,0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#EDE9FF";
            e.currentTarget.style.borderColor = "rgba(108,71,255,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(108,71,255,0.06)";
            e.currentTarget.style.borderColor = "rgba(108,71,255,0.1)";
          }}
        >
          <Wallet size={14} />
          Add Contribution
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer border-none transition-all"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(26,26,46,0.45)",
            backgroundColor: "rgba(26,26,46,0.03)",
            border: "1px solid rgba(26,26,46,0.06)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(26,26,46,0.06)";
            e.currentTarget.style.color = "rgba(26,26,46,0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(26,26,46,0.03)";
            e.currentTarget.style.color = "rgba(26,26,46,0.45)";
          }}
        >
          <Pencil size={14} />
          Edit Goal
        </button>
      </div>
    </div>
  );
}

// ─── Summary Stats Bar ─────────────────────────
function SummaryBar({ goals }: { goals: Goal[] }) {
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const completedCount = goals.filter((g) => g.saved >= g.target).length;

  const stats = [
    {
      label: "Total Saved",
      value: `₹${totalSaved.toLocaleString()}`,
      sub: `of ₹${totalTarget.toLocaleString()}`,
      color: "#6C47FF",
    },
    {
      label: "Overall Progress",
      value: `${overallPercent}%`,
      sub: "across all goals",
      color: "#6C47FF",
    },
    {
      label: "Active Goals",
      value: `${goals.length - completedCount}`,
      sub: `${completedCount} completed`,
      color: "#22C55E",
    },
    {
      label: "Remaining",
      value: `₹${(totalTarget - totalSaved).toLocaleString()}`,
      sub: "to reach all goals",
      color: "#F59E0B",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="p-5 flex flex-col gap-1.5" style={cardStyle}>
          <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(26,26,46,0.4)" }}>
            {s.label}
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#1A1A2E" }}>{s.value}</span>
          <span style={{ fontSize: 12, color: "rgba(26,26,46,0.35)" }}>{s.sub}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────
export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [contribModal, setContribModal] = useState<{ open: boolean; goalId: string; goalName: string }>({
    open: false,
    goalId: "",
    goalName: "",
  });

  const openNewPanel = () => {
    setEditGoal(null);
    setPanelOpen(true);
  };

  const openEditPanel = (goal: Goal) => {
    setEditGoal(goal);
    setPanelOpen(true);
  };

  const handleSave = (data: Omit<Goal, "id" | "saved" | "createdAt">) => {
    if (editGoal) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === editGoal.id
            ? { ...g, name: data.name, icon: data.icon, target: data.target, deadline: data.deadline, notes: data.notes }
            : g
        )
      );
    } else {
      const newGoal: Goal = {
        ...data,
        id: `goal-${Date.now()}`,
        saved: 0,
        createdAt: "2026-03-08",
      };
      setGoals((prev) => [...prev, newGoal]);
    }
  };

  const handleContribute = (amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === contribModal.goalId
          ? { ...g, saved: Math.min(g.saved + amount, g.target) }
          : g
      )
    );
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#F7F6FF" }}
    >
      <DashboardSidebar activePage="Goals" />

      <main className="flex-1 ml-16 p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#1A1A2E",
                letterSpacing: "-0.02em",
              }}
            >
              Goals
            </h1>
            <p style={{ fontSize: 14, color: "rgba(26,26,46,0.45)", marginTop: 4 }}>
              Save with purpose.
            </p>
          </div>
          {goals.length > 0 && (
            <button
              onClick={openNewPanel}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90 border-none"
              style={{
                backgroundColor: "#6C47FF",
                fontSize: 14,
                fontWeight: 600,
                boxShadow: "0 4px 20px rgba(108,71,255,0.25)",
              }}
            >
              <Plus size={16} />
              New Goal
            </button>
          )}
        </div>

        {goals.length === 0 ? (
          <EmptyState onCreate={openNewPanel} />
        ) : (
          <>
            {/* Summary Stats */}
            <SummaryBar goals={goals} />

            {/* Goals Grid */}
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A2E" }}>Your Goals</h2>
              <span style={{ fontSize: 13, color: "rgba(26,26,46,0.4)" }}>
                {goals.length} goal{goals.length !== 1 && "s"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onContribute={() =>
                    setContribModal({ open: true, goalId: goal.id, goalName: goal.name })
                  }
                  onEdit={() => openEditPanel(goal)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Slide-in Panel */}
      <GoalPanel
        open={panelOpen}
        onClose={() => {
          setPanelOpen(false);
          setEditGoal(null);
        }}
        onSave={handleSave}
        editGoal={editGoal}
      />

      {/* Contribution Modal */}
      <ContributionModal
        open={contribModal.open}
        goalName={contribModal.goalName}
        onClose={() => setContribModal({ open: false, goalId: "", goalName: "" })}
        onAdd={handleContribute}
      />
    </div>
  );
}
