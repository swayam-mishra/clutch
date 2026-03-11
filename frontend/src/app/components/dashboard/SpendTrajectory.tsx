import { useState } from "react";
import { useExpenses } from "../../../hooks/useExpenses";

// ─── Chart dimensions ──────────────────────────
const CHART_W = 520;
const CHART_H = 180;
const PAD = { top: 20, right: 20, bottom: 30, left: 50 };
const PLOT_W = CHART_W - PAD.left - PAD.right;
const PLOT_H = CHART_H - PAD.top - PAD.bottom;

function toX(i: number, len: number) {
  return PAD.left + (i / Math.max(len - 1, 1)) * PLOT_W;
}
function toY(v: number, maxVal: number) {
  const min = 0;
  return PAD.top + PLOT_H - ((v - min) / Math.max(maxVal - min, 1)) * PLOT_H;
}

interface DayPoint { day: string; spend: number }

function buildLast7Days(expenses: { date: string; amount: number }[]): DayPoint[] {
  const days: DayPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 3);
    const spend = expenses
      .filter((e) => e.date.slice(0, 10) === key)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    days.push({ day: dayLabel, spend });
  }
  return days;
}

export function SpendTrajectory() {
  const [hovered, setHovered] = useState<number | null>(null);
  const { expenses, isLoading } = useExpenses();

  const data = buildLast7Days(expenses);
  const maxVal = Math.max(Math.ceil(Math.max(...data.map((d) => d.spend), 100) / 100) * 100, 200);
  const yTicks = [0, 200, 400, 600, 800].filter((t) => t <= maxVal);

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i, data.length)},${toY(d.spend, maxVal)}`).join(" ");
  const areaPath = `${linePath} L${toX(data.length - 1, data.length)},${toY(0, maxVal)} L${toX(0, data.length)},${toY(0, maxVal)} Z`;

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
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>Weekly Spend Trajectory</h3>
        <span
          className="px-2.5 py-1 rounded-full"
          style={{ fontSize: 12, fontWeight: 600, color: "#6C47FF", backgroundColor: "#EDE9FF" }}
        >
          Last 7 days
        </span>
      </div>

      {isLoading ? (
        <div className="flex-1 w-full flex items-center justify-center animate-pulse">
          <div className="w-full h-32 rounded-xl" style={{ backgroundColor: "rgba(108,71,255,0.06)" }} />
        </div>
      ) : (
        <div className="flex-1 w-full">
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            width="100%"
            height="100%"
            style={{ overflow: "visible" }}
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              <linearGradient id="spendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6C47FF" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#6C47FF" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            {yTicks.map((tick) => (
              <line
                key={`grid-${tick}`}
                x1={PAD.left}
                y1={toY(tick, maxVal)}
                x2={CHART_W - PAD.right}
                y2={toY(tick, maxVal)}
                stroke="rgba(108,71,255,0.06)"
                strokeDasharray="4 4"
              />
            ))}

            {yTicks.map((tick) => (
              <text
                key={`ylabel-${tick}`}
                x={PAD.left - 10}
                y={toY(tick, maxVal) + 4}
                textAnchor="end"
                style={{ fontSize: 11, fill: "rgba(26,26,46,0.4)", fontFamily: "Inter, sans-serif" }}
              >
                ₹{tick}
              </text>
            ))}

            {data.map((d, i) => (
              <text
                key={`xlabel-${d.day}`}
                x={toX(i, data.length)}
                y={CHART_H - 4}
                textAnchor="middle"
                style={{ fontSize: 11, fill: "rgba(26,26,46,0.4)", fontFamily: "Inter, sans-serif" }}
              >
                {d.day}
              </text>
            ))}

            <path d={areaPath} fill="url(#spendAreaGrad)" />

            <path
              d={linePath}
              fill="none"
              stroke="#6C47FF"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {data.map((d, i) => (
              <g key={`point-${d.day}`}>
                <rect
                  x={toX(i, data.length) - 25}
                  y={PAD.top}
                  width={50}
                  height={PLOT_H}
                  fill="transparent"
                  onMouseEnter={() => setHovered(i)}
                />
                {hovered === i && (
                  <line
                    x1={toX(i, data.length)}
                    y1={PAD.top}
                    x2={toX(i, data.length)}
                    y2={PAD.top + PLOT_H}
                    stroke="rgba(108,71,255,0.12)"
                    strokeDasharray="3 3"
                  />
                )}
                <circle
                  cx={toX(i, data.length)}
                  cy={toY(d.spend, maxVal)}
                  r={hovered === i ? 6 : 4}
                  fill="#6C47FF"
                  stroke="#fff"
                  strokeWidth={hovered === i ? 3 : 2}
                  style={{ transition: "r 0.15s ease, stroke-width 0.15s ease" }}
                />
              </g>
            ))}

            {hovered !== null && (
              <g>
                <rect
                  x={toX(hovered, data.length) - 38}
                  y={toY(data[hovered].spend, maxVal) - 46}
                  width={76}
                  height={38}
                  rx={8}
                  fill="#1A1A2E"
                  style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}
                />
                <polygon
                  points={`${toX(hovered, data.length) - 5},${toY(data[hovered].spend, maxVal) - 8} ${toX(hovered, data.length) + 5},${toY(data[hovered].spend, maxVal) - 8} ${toX(hovered, data.length)},${toY(data[hovered].spend, maxVal) - 2}`}
                  fill="#1A1A2E"
                />
                <text
                  x={toX(hovered, data.length)}
                  y={toY(data[hovered].spend, maxVal) - 33}
                  textAnchor="middle"
                  style={{ fontSize: 10, fill: "rgba(255,255,255,0.6)", fontFamily: "Inter, sans-serif" }}
                >
                  {data[hovered].day}
                </text>
                <text
                  x={toX(hovered, data.length)}
                  y={toY(data[hovered].spend, maxVal) - 17}
                  textAnchor="middle"
                  style={{ fontSize: 13, fill: "#fff", fontWeight: 700, fontFamily: "Inter, sans-serif" }}
                >
                  ₹{data[hovered].spend}
                </text>
              </g>
            )}
          </svg>
        </div>
      )}
    </div>
  );
}
