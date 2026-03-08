const expenses = [
  {
    id: 1,
    date: "Mar 8",
    description: "Zomato — Biryani",
    category: "Food",
    categoryColor: "#F59E0B",
    amount: "₹349",
    mood: "😋",
  },
  {
    id: 2,
    date: "Mar 7",
    description: "Uber Ride to Office",
    category: "Transport",
    categoryColor: "#6C47FF",
    amount: "₹185",
    mood: "😐",
  },
  {
    id: 3,
    date: "Mar 7",
    description: "Amazon — USB Cable",
    category: "Shopping",
    categoryColor: "#EF4444",
    amount: "₹499",
    mood: "🤷",
  },
  {
    id: 4,
    date: "Mar 6",
    description: "Starbucks Coffee",
    category: "Food",
    categoryColor: "#F59E0B",
    amount: "₹420",
    mood: "☕",
  },
  {
    id: 5,
    date: "Mar 5",
    description: "Netflix Subscription",
    category: "Entertainment",
    categoryColor: "#22C55E",
    amount: "₹649",
    mood: "🎬",
  },
];

export function RecentExpenses() {
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
            {["Date", "Description", "Category", "Amount", "Mood"].map((h) => (
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
          {expenses.map((exp) => (
            <tr
              key={exp.id}
              className="transition-colors"
              style={{ borderRadius: 10 }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F7F6FF")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <td className="py-2.5 px-3 rounded-l-lg" style={{ fontSize: 13, color: "rgba(26,26,46,0.5)" }}>
                {exp.date}
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
                    color: exp.categoryColor,
                    backgroundColor: `${exp.categoryColor}15`,
                  }}
                >
                  {exp.category}
                </span>
              </td>
              <td className="py-2.5 px-3" style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>
                {exp.amount}
              </td>
              <td className="py-2.5 px-3 rounded-r-lg" style={{ fontSize: 18 }}>
                {exp.mood}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
