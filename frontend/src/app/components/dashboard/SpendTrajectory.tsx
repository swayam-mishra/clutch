import { useState } from "react";

const data = [
  { day: "Mon", spend: 320 },
  { day: "Tue", spend: 580 },
  { day: "Wed", spend: 210 },
  { day: "Thu", spend: 450 },
  { day: "Fri", spend: 690 },
  { day: "Sat", spend: 380 },
  { day: "Sun", spend: 412 },
];

// ─── Chart dimensions ──────────────────────────
const CHART_W = 520;
const CHART_H = 180;
const PAD = { top: 20, right: 20, bottom: 30, left: 50 };
const PLOT_W = CHART_W - PAD.left - PAD.right;
const PLOT_H = CHART_H - PAD.top - PAD.bottom;

const maxVal = Math.ceil(Math.max(...data.map((d) => d.spend)) / 100) * 100;
const minVal = 0;
const yTicks = [0, 200, 400, 600, 800].filter((t) => t <= maxVal);

function toX(i: number) {
  return PAD.left + (i / (data.length - 1)) * PLOT_W;
}
function toY(v: number) {
  return PAD.top + PLOT_H - ((v - minVal) / (maxVal - minVal)) * PLOT_H;
}

const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.spend)}`).join(" ");
const areaPath = `${linePath} L${toX(data.length - 1)},${toY(0)} L${toX(0)},${toY(0)} Z`;

export function SpendTrajectory() {
  const [hovered, setHovered] = useState<number | null>(null);

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

          {/* Horizontal grid lines */}
          {yTicks.map((tick) => (
            <line
              key={`grid-${tick}`}
              x1={PAD.left}
              y1={toY(tick)}
              x2={CHART_W - PAD.right}
              y2={toY(tick)}
              stroke="rgba(108,71,255,0.06)"
              strokeDasharray="4 4"
            />
          ))}

          {/* Y-axis labels */}
          {yTicks.map((tick) => (
            <text
              key={`ylabel-${tick}`}
              x={PAD.left - 10}
              y={toY(tick) + 4}
              textAnchor="end"
              style={{ fontSize: 11, fill: "rgba(26,26,46,0.4)", fontFamily: "Inter, sans-serif" }}
            >
              ₹{tick}
            </text>
          ))}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={`xlabel-${d.day}`}
              x={toX(i)}
              y={CHART_H - 4}
              textAnchor="middle"
              style={{ fontSize: 11, fill: "rgba(26,26,46,0.4)", fontFamily: "Inter, sans-serif" }}
            >
              {d.day}
            </text>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#spendAreaGrad)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#6C47FF"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots + hit zones */}
          {data.map((d, i) => (
            <g key={`point-${d.day}`}>
              {/* Invisible hit area */}
              <rect
                x={toX(i) - 25}
                y={PAD.top}
                width={50}
                height={PLOT_H}
                fill="transparent"
                onMouseEnter={() => setHovered(i)}
              />
              {/* Vertical indicator line on hover */}
              {hovered === i && (
                <line
                  x1={toX(i)}
                  y1={PAD.top}
                  x2={toX(i)}
                  y2={PAD.top + PLOT_H}
                  stroke="rgba(108,71,255,0.12)"
                  strokeDasharray="3 3"
                />
              )}
              {/* Dot */}
              <circle
                cx={toX(i)}
                cy={toY(d.spend)}
                r={hovered === i ? 6 : 4}
                fill="#6C47FF"
                stroke="#fff"
                strokeWidth={hovered === i ? 3 : 2}
                style={{ transition: "r 0.15s ease, stroke-width 0.15s ease" }}
              />
            </g>
          ))}

          {/* Tooltip */}
          {hovered !== null && (
            <g>
              <rect
                x={toX(hovered) - 38}
                y={toY(data[hovered].spend) - 46}
                width={76}
                height={38}
                rx={8}
                fill="#1A1A2E"
                style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}
              />
              {/* Tooltip arrow */}
              <polygon
                points={`${toX(hovered) - 5},${toY(data[hovered].spend) - 8} ${toX(hovered) + 5},${toY(data[hovered].spend) - 8} ${toX(hovered)},${toY(data[hovered].spend) - 2}`}
                fill="#1A1A2E"
              />
              <text
                x={toX(hovered)}
                y={toY(data[hovered].spend) - 33}
                textAnchor="middle"
                style={{ fontSize: 10, fill: "rgba(255,255,255,0.6)", fontFamily: "Inter, sans-serif" }}
              >
                {data[hovered].day}
              </text>
              <text
                x={toX(hovered)}
                y={toY(data[hovered].spend) - 17}
                textAnchor="middle"
                style={{ fontSize: 13, fill: "#fff", fontWeight: 700, fontFamily: "Inter, sans-serif" }}
              >
                ₹{data[hovered].spend}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
