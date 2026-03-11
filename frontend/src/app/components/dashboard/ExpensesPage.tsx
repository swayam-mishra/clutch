import { useState, useMemo, useRef } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Calendar,
  ShoppingBag,
  Utensils,
  Car,
  Gamepad2,
  Zap,
  Heart,
  Home,
  GraduationCap,
  Trash2,
  Plane,
} from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { useExpenses, type AddExpenseInput } from "../../../hooks/useExpenses";
import { useAI } from "../../../hooks/useAI";

// ─── Types ────────────────────────────────────

const categories = [
  { label: "All Categories", value: "all" },
  { label: "Food & Dining", value: "Food & Dining", icon: Utensils, color: "#F59E0B" },
  { label: "Transport", value: "Transport", icon: Car, color: "#6C47FF" },
  { label: "Shopping", value: "Shopping", icon: ShoppingBag, color: "#EF4444" },
  { label: "Entertainment", value: "Entertainment", icon: Gamepad2, color: "#22C55E" },
  { label: "Utilities", value: "Utilities", icon: Zap, color: "#3B82F6" },
  { label: "Health & Fitness", value: "Health & Fitness", icon: Heart, color: "#EC4899" },
  { label: "Housing", value: "Housing", icon: Home, color: "#78716C" },
  { label: "Education", value: "Education", icon: GraduationCap, color: "#8B5CF6" },
  { label: "Travel", value: "Travel", icon: Plane, color: "#06B6D4" },
  { label: "Miscellaneous", value: "Miscellaneous", icon: ShoppingBag, color: "#9CA3AF" },
];

const categoryColorMap = Object.fromEntries(
  categories.filter((c) => c.value !== "all").map((c) => [c.value, c.color]),
);

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const cardStyle = {
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 12px rgba(108,71,255,0.08)",
};

// ─── Skeleton ─────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      {[130, 240, 100, 80].map((w, i) => (
        <td key={i} className="py-3.5 px-5">
          <div
            className="rounded-lg animate-pulse"
            style={{ height: 14, width: w, backgroundColor: "rgba(108,71,255,0.06)" }}
          />
        </td>
      ))}
      <td className="py-3.5 px-5 text-right">
        <div
          className="rounded-lg animate-pulse ml-auto"
          style={{ height: 14, width: 70, backgroundColor: "rgba(108,71,255,0.06)" }}
        />
      </td>
    </tr>
  );
}

// ─── Log Expense Panel ────────────────────────
function LogExpensePanel({
  open,
  onClose,
  onSave,
  isSaving,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (input: AddExpenseInput) => void;
  isSaving: boolean;
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food & Dining");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const { autoCategorize } = useAI();
  // Prevent duplicate calls for the same description+amount pair
  const lastCategorizedRef = useRef<string>("");

  const handleDescriptionBlur = () => {
    if (!description.trim() || !amount) return;
    const key = `${description}:${amount}`;
    if (lastCategorizedRef.current === key) return;
    lastCategorizedRef.current = key;
    autoCategorize.mutate(
      { description: description.trim(), amount: parseFloat(amount) },
      { onSuccess: (data) => setCategory(data.category) },
    );
  };

  const handleSave = () => {
    if (!amount || !description) return;
    onSave({
      amount: parseFloat(amount),
      description,
      category,
      date,
    });
    setAmount("");
    setDescription("");
    setCategory("Food & Dining");
    setDate(new Date().toISOString().split("T")[0]);
    lastCategorizedRef.current = "";
    onClose();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[60]"
          style={{ backgroundColor: "rgba(26,26,46,0.15)" }}
          onClick={onClose}
        />
      )}

      <div
        className="fixed top-0 right-0 h-screen z-[70] flex flex-col transition-transform duration-300"
        style={{
          width: 380,
          backgroundColor: "#fff",
          boxShadow: open ? "-8px 0 40px rgba(108,71,255,0.1)" : "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(108,71,255,0.06)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E" }}>Log New Expense</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none"
            style={{ backgroundColor: "#F7F6FF", color: "rgba(26,26,46,0.4)" }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
          {/* Amount */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>Amount</label>
            <div
              className="flex items-center rounded-xl px-4 overflow-hidden"
              style={{ backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.08)" }}
            >
              <span style={{ fontSize: 22, fontWeight: 700, color: "#6C47FF", marginRight: 4 }}>₹</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent py-4 outline-none"
                style={{ fontSize: 28, fontWeight: 700, color: "#1A1A2E", border: "none" }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>Description</label>
            <input
              type="text"
              placeholder="What did you spend on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              className="px-4 py-3 rounded-xl outline-none"
              style={{
                fontSize: 14,
                color: "#1A1A2E",
                backgroundColor: "#F7F6FF",
                border: "1px solid rgba(108,71,255,0.08)",
              }}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2 relative">
            <div className="flex items-center gap-2">
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>Category</label>
              {autoCategorize.isPending && (
                <span className="flex items-center gap-1" style={{ fontSize: 11, color: "#6C47FF", fontWeight: 500 }}>
                  <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  AI suggesting…
                </span>
              )}
            </div>
            <button
              onClick={() => setCatDropdownOpen(!catDropdownOpen)}
              className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer border-none"
              style={{
                fontSize: 14,
                color: "#1A1A2E",
                backgroundColor: "#F7F6FF",
                border: "1px solid rgba(108,71,255,0.08)",
              }}
            >
              <div className="flex items-center gap-2.5">
                {(() => {
                  const cat = categories.find((c) => c.value === category);
                  if (cat && cat.icon) {
                    const Icon = cat.icon;
                    return <Icon size={16} color={cat.color} />;
                  }
                  return null;
                })()}
                <span style={{ fontWeight: 500 }}>{category}</span>
              </div>
              <ChevronDown size={16} color="rgba(26,26,46,0.3)" />
            </button>

            {catDropdownOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-1 py-2 rounded-xl z-10"
                style={{
                  backgroundColor: "#fff",
                  boxShadow: "0 8px 32px rgba(108,71,255,0.12)",
                  border: "1px solid rgba(108,71,255,0.06)",
                }}
              >
                {categories
                  .filter((c) => c.value !== "all")
                  .map((cat) => {
                    const Icon = cat.icon!;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => {
                          setCategory(cat.value);
                          setCatDropdownOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 cursor-pointer border-none transition-colors"
                        style={{
                          backgroundColor: category === cat.value ? "#F7F6FF" : "transparent",
                          fontSize: 14,
                          color: "#1A1A2E",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F7F6FF")}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            category === cat.value ? "#F7F6FF" : "transparent")
                        }
                      >
                        <Icon size={16} color={cat.color} />
                        <span style={{ fontWeight: 500 }}>{cat.label}</span>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>Date</label>
            <div
              className="flex items-center rounded-xl px-4 overflow-hidden"
              style={{ backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.08)" }}
            >
              <Calendar size={16} color="rgba(26,26,46,0.3)" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 bg-transparent py-3 px-3 outline-none"
                style={{ fontSize: 14, color: "#1A1A2E", border: "none" }}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-3" style={{ borderTop: "1px solid rgba(108,71,255,0.06)" }}>
          <button
            onClick={handleSave}
            disabled={isSaving || !amount || !description}
            className="w-full py-3.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90 border-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#6C47FF",
              fontSize: 15,
              fontWeight: 600,
              boxShadow: "0 4px 20px rgba(108,71,255,0.25)",
            }}
          >
            {isSaving ? "Saving…" : "Save Expense"}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 cursor-pointer border-none transition-colors"
            style={{ backgroundColor: "transparent", fontSize: 14, fontWeight: 500, color: "rgba(26,26,46,0.4)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Expenses Page ───────────────────────
export function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [selectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(2); // 0-indexed, March
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPanel, setShowPanel] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [catFilterOpen, setCatFilterOpen] = useState(false);
  const perPage = 10;

  const monthParam = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
  const { expenses, isLoading, addExpense, removeExpense } = useExpenses({ month: monthParam });

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch = e.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "all" || e.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#F7F6FF" }}
    >
      <DashboardSidebar activePage="Expenses" />

      <main className="flex-1 ml-16 p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
              Expenses
            </h1>
            <p style={{ fontSize: 14, color: "rgba(26,26,46,0.45)", marginTop: 4 }}>
              Track every rupee.
            </p>
          </div>
          <button
            onClick={() => setShowPanel(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90 border-none"
            style={{
              backgroundColor: "#6C47FF",
              fontSize: 14,
              fontWeight: 600,
              boxShadow: "0 4px 20px rgba(108,71,255,0.25)",
            }}
          >
            <Plus size={16} />
            Log Expense
          </button>
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Month picker */}
          <div className="relative">
            <button
              onClick={() => { setMonthDropdownOpen(!monthDropdownOpen); setCatFilterOpen(false); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer border-none transition-colors"
              style={{ ...cardStyle, fontSize: 14, fontWeight: 500, color: "#1A1A2E" }}
            >
              <Calendar size={15} color="#6C47FF" />
              {months[selectedMonth]} {selectedYear}
              <ChevronDown size={14} color="rgba(26,26,46,0.3)" />
            </button>
            {monthDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-1 py-2 rounded-xl z-20 max-h-60 overflow-y-auto"
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
                    onClick={() => { setSelectedMonth(i); setMonthDropdownOpen(false); setCurrentPage(1); }}
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
            )}
          </div>

          {/* Category filter */}
          <div className="relative">
            <button
              onClick={() => { setCatFilterOpen(!catFilterOpen); setMonthDropdownOpen(false); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer border-none transition-colors"
              style={{ ...cardStyle, fontSize: 14, fontWeight: 500, color: "#1A1A2E" }}
            >
              {selectedCategory === "all" ? "All Categories" : selectedCategory}
              <ChevronDown size={14} color="rgba(26,26,46,0.3)" />
            </button>
            {catFilterOpen && (
              <div
                className="absolute top-full left-0 mt-1 py-2 rounded-xl z-20"
                style={{
                  width: 200,
                  backgroundColor: "#fff",
                  boxShadow: "0 8px 32px rgba(108,71,255,0.12)",
                  border: "1px solid rgba(108,71,255,0.06)",
                }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => { setSelectedCategory(cat.value); setCatFilterOpen(false); setCurrentPage(1); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 cursor-pointer border-none transition-colors"
                    style={{
                      fontSize: 14,
                      fontWeight: selectedCategory === cat.value ? 600 : 400,
                      color: selectedCategory === cat.value ? "#6C47FF" : "#1A1A2E",
                      backgroundColor: selectedCategory === cat.value ? "#EDE9FF" : "transparent",
                    }}
                    onMouseEnter={(e) => { if (selectedCategory !== cat.value) e.currentTarget.style.backgroundColor = "#F7F6FF"; }}
                    onMouseLeave={(e) => { if (selectedCategory !== cat.value) e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    {cat.icon && <cat.icon size={15} color={cat.color} />}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl flex-1 min-w-[220px] max-w-sm"
            style={cardStyle}
          >
            <Search size={16} color="rgba(26,26,46,0.3)" />
            <input
              type="text"
              placeholder="Search by description..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: 14, color: "#1A1A2E", border: "none" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="cursor-pointer border-none bg-transparent p-0">
                <X size={14} color="rgba(26,26,46,0.3)" />
              </button>
            )}
          </div>
        </div>

        {/* Close dropdowns on outside click */}
        {(monthDropdownOpen || catFilterOpen) && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => { setMonthDropdownOpen(false); setCatFilterOpen(false); }}
          />
        )}

        {/* Main table */}
        <div style={cardStyle} className="overflow-hidden">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(108,71,255,0.06)" }}>
                {["Date", "Description", "Category", "Amount", ""].map((h, i) => (
                  <th
                    key={i}
                    className={`py-4 px-5 ${h === "Amount" ? "text-right" : "text-left"}`}
                    style={{ fontSize: 12, fontWeight: 600, color: "rgba(26,26,46,0.4)", textTransform: "uppercase", letterSpacing: "0.04em" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <p style={{ fontSize: 15, color: "rgba(26,26,46,0.3)", fontWeight: 500 }}>
                      No expenses found.
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((exp, idx) => {
                  const color = categoryColorMap[exp.category] ?? "#9CA3AF";
                  return (
                    <tr
                      key={exp.id}
                      className="transition-colors group"
                      style={{
                        backgroundColor: idx % 2 === 1 ? "#FAFAFF" : "#fff",
                        borderBottom: "1px solid rgba(108,71,255,0.03)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#EDE9FF20")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 1 ? "#FAFAFF" : "#fff")}
                    >
                      <td className="py-3.5 px-5" style={{ fontSize: 13, color: "rgba(26,26,46,0.5)", fontWeight: 500 }}>
                        {formatDate(exp.date)}
                      </td>
                      <td className="py-3.5 px-5" style={{ fontSize: 14, fontWeight: 500, color: "#1A1A2E" }}>
                        {exp.description}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className="px-3 py-1 rounded-full inline-block"
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color,
                            backgroundColor: `${color}12`,
                          }}
                        >
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right" style={{ fontSize: 14, fontWeight: 600, color: "#EF4444" }}>
                        -₹{Number(exp.amount).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => removeExpense.mutate(exp.id)}
                          disabled={removeExpense.isPending}
                          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none transition-all ml-auto"
                          style={{ backgroundColor: "#FEF2F2", color: "#EF4444" }}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderTop: "1px solid rgba(108,71,255,0.06)" }}
          >
            <span style={{ fontSize: 13, color: "rgba(26,26,46,0.4)" }}>
              {isLoading
                ? "Loading…"
                : `Showing ${filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1}–${Math.min(currentPage * perPage, filtered.length)} of ${filtered.length} expenses`}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-all"
                style={{
                  backgroundColor: currentPage === 1 ? "#F7F6FF" : "#EDE9FF",
                  color: currentPage === 1 ? "rgba(26,26,46,0.2)" : "#6C47FF",
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-all"
                  style={{
                    backgroundColor: currentPage === page ? "#6C47FF" : "transparent",
                    color: currentPage === page ? "#fff" : "rgba(26,26,46,0.4)",
                    fontSize: 13,
                    fontWeight: currentPage === page ? 600 : 500,
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-all"
                style={{
                  backgroundColor: currentPage === totalPages ? "#F7F6FF" : "#EDE9FF",
                  color: currentPage === totalPages ? "rgba(26,26,46,0.2)" : "#6C47FF",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <LogExpensePanel
        open={showPanel}
        onClose={() => setShowPanel(false)}
        onSave={(input) => addExpense.mutate(input)}
        isSaving={addExpense.isPending}
      />
    </div>
  );
}
