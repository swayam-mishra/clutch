import { Target } from "lucide-react";
import { useGoals } from "../../../hooks/useGoals";

const GOAL_COLORS = ["#6C47FF", "#22C55E", "#F59E0B", "#06B6D4", "#EF4444"];

export function ActiveGoals() {
  const { goals, isLoading } = useGoals();

  if (isLoading) {
    return (
      <div
        className="p-6 flex flex-col gap-4 h-full animate-pulse"
        style={{ backgroundColor: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(108,71,255,0.08)" }}
      >
        <div className="flex items-center justify-between">
          <div className="h-5 w-28 rounded-lg" style={{ backgroundColor: "rgba(108,71,255,0.08)" }} />
        </div>
        <div className="flex flex-col gap-4 flex-1">
          {[0, 1].map((i) => (
            <div key={i} className="p-4 rounded-xl flex flex-col gap-3" style={{ backgroundColor: "#F7F6FF" }}>
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.08)" }} />
                <div className="h-3 w-8 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.08)" }} />
              </div>
              <div className="w-full h-2 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.08)" }} />
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
                <div className="h-3 w-16 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeGoals = goals.slice(0, 4);

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

      {activeGoals.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p style={{ fontSize: 13, color: "rgba(26,26,46,0.4)", textAlign: "center" }}>
            No goals yet. Create one in the Goals page.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-1">
          {activeGoals.map((goal, idx) => {
            const percent = Math.min(
              Math.round((goal.saved_amount / goal.target_amount) * 100),
              100
            );
            const color = GOAL_COLORS[idx % GOAL_COLORS.length];
            return (
              <div
                key={goal.id}
                className="p-4 rounded-xl flex flex-col gap-3"
                style={{ backgroundColor: "#F7F6FF" }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>
                    {goal.title}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color }}>
                    {percent}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.08)" }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${percent}%`, backgroundColor: color }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 12, color: "rgba(26,26,46,0.5)" }}>
                    ₹{(goal.saved_amount / 1000).toFixed(1)}k saved
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(26,26,46,0.5)" }}>
                    ₹{(goal.target_amount / 1000).toFixed(0)}k target
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
