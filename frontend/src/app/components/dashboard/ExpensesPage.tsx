import { useState, useMemo } from "react";
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
} from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";

// ─── Types ────────────────────────────────────
interface Expense {
  id: number;
  date: string;
  description: string;
  category: string;
  categoryColor: string;
  mood: string;
  amount: number;
}

// ─── Mock Data ────────────────────────────────
const allExpenses: Expense[] = [
  { id: 1, date: "2026-03-08", description: "Zomato — Biryani", category: "Food", categoryColor: "#F59E0B", mood: "😋", amount: 349 },
  { id: 2, date: "2026-03-08", description: "Uber Ride to Office", category: "Transport", categoryColor: "#6C47FF", mood: "😐", amount: 185 },
  { id: 3, date: "2026-03-07", description: "Amazon — USB Cable", category: "Shopping", categoryColor: "#EF4444", mood: "🤷", amount: 499 },
  { id: 4, date: "2026-03-07", description: "Starbucks Coffee", category: "Food", categoryColor: "#F59E0B", mood: "☕", amount: 420 },
  { id: 5, date: "2026-03-06", description: "Netflix Subscription", category: "Entertainment", categoryColor: "#22C55E", mood: "🎬", amount: 649 },
  { id: 6, date: "2026-03-06", description: "Electricity Bill", category: "Utilities", categoryColor: "#3B82F6", mood: "😬", amount: 1200 },
  { id: 7, date: "2026-03-05", description: "Gym Membership", category: "Health", categoryColor: "#EC4899", mood: "💪", amount: 999 },
  { id: 8, date: "2026-03-05", description: "Swiggy — Pizza Night", category: "Food", categoryColor: "#F59E0B", mood: "🍕", amount: 580 },
  { id: 9, date: "2026-03-04", description: "Metro Card Recharge", category: "Transport", categoryColor: "#6C47FF", mood: "😐", amount: 300 },
  { id: 10, date: "2026-03-04", description: "Coursera Subscription", category: "Education", categoryColor: "#8B5CF6", mood: "📚", amount: 750 },
  { id: 11, date: "2026-03-03", description: "Groceries — BigBasket", category: "Food", categoryColor: "#F59E0B", mood: "🛒", amount: 1450 },
  { id: 12, date: "2026-03-03", description: "Ola Auto to Mall", category: "Transport", categoryColor: "#6C47FF", mood: "😊", amount: 120 },
  { id: 13, date: "2026-03-02", description: "Nike Running Shoes", category: "Shopping", categoryColor: "#EF4444", mood: "😤", amount: 4999 },
  { id: 14, date: "2026-03-02", description: "Spotify Premium", category: "Entertainment", categoryColor: "#22C55E", mood: "🎵", amount: 119 },
  { id: 15, date: "2026-03-01", description: "Rent — March", category: "Housing", categoryColor: "#78716C", mood: "😬", amount: 12000 },
  { id: 16, date: "2026-03-01", description: "Phone Bill", category: "Utilities", categoryColor: "#3B82F6", mood: "😐", amount: 499 },
  { id: 17, date: "2026-03-01", description: "Chai Point — Team Outing", category: "Food", categoryColor: "#F59E0B", mood: "😊", amount: 240 },
  { id: 18, date: "2026-02-28", description: "Myntra — T-Shirt", category: "Shopping", categoryColor: "#EF4444", mood: "💸", amount: 899 },
];

const categories = [
  { label: "All Categories", value: "all" },
  { label: "Food", value: "Food", icon: Utensils, color: "#F59E0B" },
  { label: "Transport", value: "Transport", icon: Car, color: "#6C47FF" },
  { label: "Shopping", value: "Shopping", icon: ShoppingBag, color: "#EF4444" },
  { label: "Entertainment", value: "Entertainment", icon: Gamepad2, color: "#22C55E" },
  { label: "Utilities", value: "Utilities", icon: Zap, color: "#3B82F6" },
  { label: "Health", value: "Health", icon: Heart, color: "#EC4899" },
  { label: "Housing", value: "Housing", icon: Home, color: "#78716C" },
  { label: "Education", value: "Education", icon: GraduationCap, color: "#8B5CF6" },
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const moodOptions = ["😊", "😐", "😬", "😤", "💸"];

const cardStyle = {
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 12px rgba(108,71,255,0.08)",
};

// ─── Log Expense Panel ────────────────────────
function LogExpensePanel({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [mood, setMood] = useState("😊");
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

  const handleSave = () => {
    if (!amount || !description) return;
    const cat = categories.find((c) => c.value === category);
    onSave({
      id: Date.now(),
      date,
      description,
      category,
      categoryColor: cat?.color || "#6C47FF",
      mood,
      amount: parseFloat(amount),
    });
    setAmount("");
    setDescription("");
    setCategory("Food");
    setDate(new Date().toISOString().split("T")[0]);
    setMood("😊");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[60]"
          style={{ backgroundColor: "rgba(26,26,46,0.15)" }}
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-screen z-[70] flex flex-col transition-transform duration-300"
        style={{
          width: 380,
          backgroundColor: "#fff",
          boxShadow: open ? "-8px 0 40px rgba(108,71,255,0.1)" : "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
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

        {/* Form */}
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
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>Category</label>
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

          {/* Mood Tag */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>Mood Tag</label>
            <div className="flex items-center gap-3">
              {moodOptions.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all"
                  style={{
                    fontSize: 22,
                    backgroundColor: mood === m ? "#EDE9FF" : "#F7F6FF",
                    border: mood === m ? "2px solid #6C47FF" : "2px solid transparent",
                    transform: mood === m ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 flex flex-col gap-3" style={{ borderTop: "1px solid rgba(108,71,255,0.06)" }}>
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90 border-none"
            style={{
              backgroundColor: "#6C47FF",
              fontSize: 15,
              fontWeight: 600,
              boxShadow: "0 4px 20px rgba(108,71,255,0.25)",
            }}
          >
            Save Expense
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
  const [expenses, setExpenses] = useState<Expense[]>(allExpenses);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(2); // March (0-indexed)
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPanel, setShowPanel] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [catFilterOpen, setCatFilterOpen] = useState(false);
  const perPage = 10;

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "all" || e.category === selectedCategory;
      const expMonth = new Date(e.date).getMonth();
      const matchesMonth = expMonth === selectedMonth;
      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [expenses, search, selectedCategory, selectedMonth]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSave = (expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
    setCurrentPage(1);
  };

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
              style={{
                ...cardStyle,
                fontSize: 14,
                fontWeight: 500,
                color: "#1A1A2E",
              }}
            >
              <Calendar size={15} color="#6C47FF" />
              {months[selectedMonth]} 2026
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
              style={{
                ...cardStyle,
                fontSize: 14,
                fontWeight: 500,
                color: "#1A1A2E",
              }}
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
            style={{
              ...cardStyle,
            }}
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
              <button
                onClick={() => setSearch("")}
                className="cursor-pointer border-none bg-transparent p-0"
              >
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
                {["Date", "Description", "Category", "Mood", "Amount"].map((h) => (
                  <th
                    key={h}
                    className={`py-4 px-5 ${h === "Amount" ? "text-right" : "text-left"}`}
                    style={{ fontSize: 12, fontWeight: 600, color: "rgba(26,26,46,0.4)", textTransform: "uppercase", letterSpacing: "0.04em" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <p style={{ fontSize: 15, color: "rgba(26,26,46,0.3)", fontWeight: 500 }}>
                      No expenses found.
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((exp, idx) => (
                  <tr
                    key={exp.id}
                    className="transition-colors cursor-default"
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
                          color: exp.categoryColor,
                          backgroundColor: `${exp.categoryColor}12`,
                        }}
                      >
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5" style={{ fontSize: 20 }}>
                      {exp.mood}
                    </td>
                    <td className="py-3.5 px-5 text-right" style={{ fontSize: 14, fontWeight: 600, color: "#EF4444" }}>
                      -₹{exp.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderTop: "1px solid rgba(108,71,255,0.06)" }}
          >
            <span style={{ fontSize: 13, color: "rgba(26,26,46,0.4)" }}>
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1}–
              {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} expenses
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

      {/* Log Expense side panel */}
      <LogExpensePanel open={showPanel} onClose={() => setShowPanel(false)} onSave={handleSave} />
    </div>
  );
}
