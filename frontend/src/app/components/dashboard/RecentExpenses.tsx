import { useExpenses } from "../../../hooks/useExpenses";

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

const HEADERS = ["Date", "Description", "Category", "Amount"];

export function RecentExpenses() {
  const { expenses, isLoading } = useExpenses();
  const recent = expenses.slice(0, 5);

  return (
    <div
      className="p-6 flex flex-col gap-4 h-full"
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(108,71,255,0.08)",
      }}
    >
      <div className="flex items-center justify-between">
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>Recent Expenses</h3>
        <button
          className="cursor-pointer border-none"
          style={{ fontSize: 13, fontWeight: 600, color: "#6C47FF", backgroundColor: "transparent" }}
        >
          View all
        </button>
      </div>

      <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: "0 4px" }}>
        <thead>
          <tr>
            {HEADERS.map((h) => (
              <th
                key={h}
                className="text-left py-2 px-3"
                style={{ fontSize: 12, fontWeight: 500, color: "rgba(26,26,46,0.4)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[0, 1, 2, 3].map((j) => (
                    <td key={j} className="py-3 px-3">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: j === 1 ? "80%" : j === 2 ? "60%" : "50%",
                          backgroundColor: "rgba(108,71,255,0.07)",
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            : recent.map((exp) => (
                <tr
                  key={exp.id}
                  className="transition-colors"
                  style={{ borderRadius: 10 }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F7F6FF")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td className="py-2.5 px-3 rounded-l-lg" style={{ fontSize: 13, color: "rgba(26,26,46,0.5)" }}>
                    {formatDate(exp.date)}
                  </td>
                  <td className="py-2.5 px-3" style={{ fontSize: 14, fontWeight: 500, color: "#1A1A2E" }}>
                    {exp.description}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className="px-2.5 py-1 rounded-full"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: getCategoryColor(exp.category),
                        backgroundColor: `${getCategoryColor(exp.category)}15`,
                      }}
                    >
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 rounded-r-lg" style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>
                    ₹{Number(exp.amount).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
