import { Target } from "lucide-react";

const goals = [
  {
    id: 1,
    name: "Emergency Fund",
    target: 100000,
    current: 62000,
    icon: "🛡️",
    color: "#6C47FF",
  },
  {
    id: 2,
    name: "New MacBook",
    target: 150000,
    current: 45000,
    icon: "💻",
    color: "#22C55E",
  },
];

export function ActiveGoals() {
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
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>Active Goals</h3>
        <Target size={18} color="rgba(26,26,46,0.3)" />
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {goals.map((goal) => {
          const percent = Math.round((goal.current / goal.target) * 100);
          return (
            <div
              key={goal.id}
              className="p-4 rounded-xl flex flex-col gap-3"
              style={{ backgroundColor: "#F7F6FF" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span style={{ fontSize: 20 }}>{goal.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>
                    {goal.name}
                  </span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: goal.color }}>
                  {percent}%
                </span>
              </div>

              <div className="w-full h-2 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.08)" }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${percent}%`, backgroundColor: goal.color }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span style={{ fontSize: 12, color: "rgba(26,26,46,0.5)" }}>
                  ₹{(goal.current / 1000).toFixed(0)}k saved
                </span>
                <span style={{ fontSize: 12, color: "rgba(26,26,46,0.5)" }}>
                  ₹{(goal.target / 1000).toFixed(0)}k target
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
