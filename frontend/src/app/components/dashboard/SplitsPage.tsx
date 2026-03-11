import { useState } from "react";
import { Users, CheckCircle2, Clock, Plus, IndianRupee } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { useSplits, CreateSplitInput } from "../../../hooks/useSplits";

// ─── Create Split Modal ────────────────────────────────────────────────────────

function CreateSplitModal({
  onClose,
  onCreate,
  isPending,
}: {
  onClose: () => void;
  onCreate: (input: CreateSplitInput) => void;
  isPending: boolean;
}) {
  const [expenseId, setExpenseId] = useState("");
  const [splitWithName, setSplitWithName] = useState("");
  const [amountOwed, setAmountOwed] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseId || !splitWithName || !amountOwed) return;
    onCreate({
      expenseId: parseInt(expenseId),
      splitWithName: splitWithName.trim(),
      amountOwed: parseFloat(amountOwed),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 w-full max-w-md shadow-2xl"
        style={{ backgroundColor: "#1A1A2E", border: "1px solid rgba(108,71,255,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
          New Split Expense
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
              Expense ID
            </label>
            <input
              type="number"
              placeholder="e.g. 42"
              value={expenseId}
              onChange={(e) => setExpenseId(e.target.value)}
              required
              className="rounded-xl px-3 py-2.5 outline-none"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: 14,
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
              Split With
            </label>
            <input
              type="text"
              placeholder="Friend's name"
              value={splitWithName}
              onChange={(e) => setSplitWithName(e.target.value)}
              required
              className="rounded-xl px-3 py-2.5 outline-none"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: 14,
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
              Amount Owed (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 500"
              min="0.01"
              step="0.01"
              value={amountOwed}
              onChange={(e) => setAmountOwed(e.target.value)}
              required
              className="rounded-xl px-3 py-2.5 outline-none"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: 14,
              }}
            />
          </div>
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.6)",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                backgroundColor: "#6C47FF",
                color: "#fff",
                border: "none",
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? "Creating…" : "Create Split"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Split Card ────────────────────────────────────────────────────────────────

function SplitCard({
  split,
  onSettle,
  isSettling,
}: {
  split: ReturnType<typeof useSplits>["splits"][number];
  onSettle: (id: number) => void;
  isSettling: boolean;
}) {
  const amount = Number(split.amount_owed).toLocaleString("en-IN");
  const date = new Date(split.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className="flex items-center justify-between px-5 py-4 rounded-2xl"
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        border: split.is_settled
          ? "1px solid rgba(34,197,94,0.15)"
          : "1px solid rgba(108,71,255,0.12)",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: split.is_settled
              ? "rgba(34,197,94,0.12)"
              : "rgba(108,71,255,0.12)",
          }}
        >
          {split.is_settled ? (
            <CheckCircle2 size={18} color="#22c55e" />
          ) : (
            <Clock size={18} color="#6C47FF" />
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
            {split.split_with_name}
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            {split.expense_description} · {date}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div
            className="flex items-center gap-0.5"
            style={{ color: split.is_settled ? "#22c55e" : "#fff", fontWeight: 700, fontSize: 16 }}
          >
            <IndianRupee size={14} />
            {amount}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "right" }}>
            of ₹{Number(split.total_expense_amount).toLocaleString("en-IN")} total
          </div>
        </div>

        {!split.is_settled && (
          <button
            onClick={() => onSettle(split.split_id)}
            disabled={isSettling}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              backgroundColor: "rgba(34,197,94,0.12)",
              color: "#22c55e",
              border: "1px solid rgba(34,197,94,0.2)",
              cursor: isSettling ? "not-allowed" : "pointer",
              opacity: isSettling ? 0.6 : 1,
            }}
          >
            Settle
          </button>
        )}
        {split.is_settled && (
          <span
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              backgroundColor: "rgba(34,197,94,0.08)",
              color: "rgba(34,197,94,0.6)",
              border: "1px solid rgba(34,197,94,0.1)",
            }}
          >
            Settled
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function SplitsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "settled">("all");
  const { splits, pendingCount, pendingAmount, isLoading, createSplit, settleSplit } = useSplits();

  const filtered = splits.filter((s) => {
    if (filter === "pending") return !s.is_settled;
    if (filter === "settled") return s.is_settled;
    return true;
  });

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#0F0F1A", fontFamily: "Inter, sans-serif" }}>
      <DashboardSidebar activePage="Splits" />

      <main className="flex-1 ml-16 p-8">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
                Split Expenses
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                Track what friends owe you
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#6C47FF", color: "#fff", border: "none", cursor: "pointer" }}
            >
              <Plus size={16} />
              New Split
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div
              className="rounded-2xl px-5 py-4"
              style={{ backgroundColor: "rgba(108,71,255,0.08)", border: "1px solid rgba(108,71,255,0.15)" }}
            >
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                Pending settlements
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#6C47FF" }}>{pendingCount}</div>
            </div>
            <div
              className="rounded-2xl px-5 py-4"
              style={{ backgroundColor: "rgba(108,71,255,0.08)", border: "1px solid rgba(108,71,255,0.15)" }}
            >
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                Pending amount
              </div>
              <div className="flex items-center gap-1" style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>
                <IndianRupee size={20} />
                {pendingAmount.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-5">
            {(["all", "pending", "settled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold capitalize"
                style={{
                  backgroundColor: filter === f ? "#6C47FF" : "rgba(255,255,255,0.06)",
                  color: filter === f ? "#fff" : "rgba(255,255,255,0.4)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl animate-pulse"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 rounded-2xl"
              style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
            >
              <Users size={40} color="rgba(255,255,255,0.15)" style={{ marginBottom: 12 }} />
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                {filter === "all" ? "No splits yet." : `No ${filter} splits.`}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((split) => (
                <SplitCard
                  key={split.split_id}
                  split={split}
                  onSettle={(id) => settleSplit.mutate(id)}
                  isSettling={settleSplit.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <CreateSplitModal
          onClose={() => setShowCreate(false)}
          onCreate={(input) => createSplit.mutate(input)}
          isPending={createSplit.isPending}
        />
      )}
    </div>
  );
}
