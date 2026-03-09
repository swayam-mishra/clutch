import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Food", value: 2800, color: "#F59E0B" },
  { name: "Transport", value: 1600, color: "#6C47FF" },
  { name: "Shopping", value: 1800, color: "#EF4444" },
  { name: "Remaining", value: 8800, color: "#EDE9FF" },
];

const spent = 6200;
const total = 15000;

interface BudgetOverviewProps {
  currentScore?: number | null;
  loading?: boolean;
}

export function BudgetOverview({ currentScore: _currentScore, loading: _loading }: BudgetOverviewProps = {}) {
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
              data={data}
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
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span style={{ fontSize: 24, fontWeight: 700, color: "#1A1A2E" }}>
            ₹{(spent / 1000).toFixed(1)}k
          </span>
          <span style={{ fontSize: 12, color: "rgba(26,26,46,0.4)" }}>
            of ₹{(total / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3">
        {data
          .filter((d) => d.name !== "Remaining")
          .map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: "#1A1A2E" }}>
                  {item.name}
                </span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E" }}>
                ₹{item.value.toLocaleString()}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}