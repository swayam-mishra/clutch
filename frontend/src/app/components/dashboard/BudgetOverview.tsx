import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useBudget } from "../../../hooks/useBudget";

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#F59E0B",
  Transport: "#6C47FF",
  Shopping: "#EF4444",
  Entertainment: "#22C55E",
  Health: "#06B6D4",
  Utilities: "#8B5CF6",
  Other: "#9CA3AF",
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "#9CA3AF";
}

export function BudgetOverview() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { budgetStatus, isLoading, noBudget } = useBudget(currentMonth);

  if (isLoading) {
    return (
      <div
        className="p-6 flex flex-col gap-4 h-full animate-pulse"
        style={{ backgroundColor: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(108,71,255,0.08)" }}
      >
        <div className="h-5 w-32 rounded-lg" style={{ backgroundColor: "rgba(108,71,255,0.08)" }} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
        </div>
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3 w-24 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
              <div className="h-3 w-12 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (noBudget || !budgetStatus) {
    return (
      <div
        className="p-6 flex flex-col items-center justify-center gap-3 h-full"
        style={{ backgroundColor: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(108,71,255,0.08)" }}
      >
        <p style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E" }}>Budget Overview</p>
        <p style={{ fontSize: 13, color: "rgba(26,26,46,0.4)", textAlign: "center" }}>
          No budget set for this month. Set one in the Budget page.
        </p>
      </div>
    );
  }

  const { totalSpent, totalBudget, categoryStatus } = budgetStatus;
  const remaining = Math.max(totalBudget - totalSpent, 0);

  const topCategories = [...categoryStatus]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4);

  const pieData = [
    ...topCategories.map((cat) => ({
      name: cat.category,
      value: cat.spent,
      color: getCategoryColor(cat.category),
    })),
    { name: "Remaining", value: remaining, color: "#EDE9FF" },
  ];

  return (
    <div
      className="p-6 flex flex-col gap-4 h-full"
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(108,71,255,0.08)",
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>Budget Overview</h3>

      <div className="flex-1 flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {pieData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span style={{ fontSize: 24, fontWeight: 700, color: "#1A1A2E" }}>
            ₹{(totalSpent / 1000).toFixed(1)}k
          </span>
          <span style={{ fontSize: 12, color: "rgba(26,26,46,0.4)" }}>
            of ₹{(totalBudget / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {topCategories.map((item) => (
          <div key={item.category} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(item.category) }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: "#1A1A2E" }}>
                {item.category}
              </span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E" }}>
              ₹{item.spent.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
