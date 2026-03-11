import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
} from "motion/react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
import {
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer as RC2,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  Zap,
  CalendarCheck,
  RefreshCw,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import { useHealthScore } from "../../../hooks/useHealthScore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 75) return "#22C55E";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 25) return "At Risk";
  return "Critical";
}

// ─── Animated counter ─────────────────────────────────────────────────────────

function AnimatedScore({ target }: { target: number }) {
  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toString());

  useEffect(() => {
    raw.set(target);
  }, [target, raw]);

  return (
    <motion.span
      style={{ display: "inline-block" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span>{display}</motion.span>
    </motion.span>
  );
}

// ─── Factor progress bar ──────────────────────────────────────────────────────

function FactorBar({
  value,
  max,
  color,
  delay = 0,
}: {
  value: number;
  max: number;
  color: string;
  delay?: number;
}) {
  const pct = Math.round((value / max) * 100);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;
    const el = barRef.current;
    el.style.width = "0%";
    const timer = setTimeout(() => {
      el.style.transition = "width 0.8s cubic-bezier(0.34, 1.2, 0.64, 1)";
      el.style.width = `${pct}%`;
    }, delay);
    return () => clearTimeout(timer);
  }, [pct, delay]);

  return (
    <div className="flex items-center gap-3 mt-2">
      <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: "rgba(108,71,255,0.07)" }}>
        <div
          ref={barRef}
          className="h-2 rounded-full"
          style={{ backgroundColor: color, width: "0%" }}
        />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 36, textAlign: "right" }}>
        {value}/{max}
      </span>
    </div>
  );
}

// ─── Mini sparkline ──────────────────────────────────────────────────────────

function TrendSparkline({ data }: { data: { score: number }[] }) {
  if (data.length < 2) return null;
  const reversed = [...data].reverse(); // chronological order

  return (
    <RC2 width="100%" height={36}>
      <LineChart data={reversed}>
        <Line
          type="monotone"
          dataKey="score"
          stroke="#6C47FF"
          strokeWidth={2}
          dot={false}
          isAnimationActive
        />
        <Tooltip
          contentStyle={{ display: "none" }}
          cursor={false}
        />
      </LineChart>
    </RC2>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ w, h, radius = 8 }: { w: number | string; h: number; radius?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{ width: w, height: h, borderRadius: radius, backgroundColor: "rgba(108,71,255,0.07)" }}
    />
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────

export function HealthScoreCard() {
  const { score, breakdown, explanation, trend, trendHistory, isLoading, computedAt } =
    useHealthScore();

  const color = score !== null ? scoreColor(score) : "#9CA3AF";
  const label = score !== null ? scoreLabel(score) : "—";

  const radialData = [{ name: "Score", value: score ?? 0, fill: color }];

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up" ? "#22C55E" : trend === "down" ? "#EF4444" : "#9CA3AF";

  const lastUpdated = computedAt
    ? new Date(computedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        boxShadow: "0 2px 12px rgba(108,71,255,0.08)",
        overflow: "hidden",
      }}
    >
      {/* ── Top section ───────────────────────────────────────── */}
      <div
        className="px-7 pt-7 pb-6"
        style={{
          background: "linear-gradient(135deg, #F7F6FF 0%, #EDE9FF 100%)",
          borderBottom: "1px solid rgba(108,71,255,0.07)",
        }}
      >
        <div className="flex items-start justify-between gap-6">
          {/* Left: score + label */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${color}18` }}
              >
                <ShieldCheck size={16} color={color} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>
                Financial Health Score
              </span>
            </div>

            {isLoading ? (
              <Skeleton w={140} h={52} radius={12} />
            ) : (
              <div className="flex items-end gap-2">
                <span
                  style={{
                    fontSize: 64,
                    fontWeight: 800,
                    color: "#1A1A2E",
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  <AnimatedScore target={score ?? 0} />
                </span>
                <span style={{ fontSize: 22, fontWeight: 500, color: "rgba(26,26,46,0.25)", marginBottom: 6 }}>
                  /100
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              {isLoading ? (
                <Skeleton w={80} h={24} radius={20} />
              ) : (
                <>
                  <span
                    className="px-3 py-1 rounded-full"
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color,
                      backgroundColor: `${color}15`,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${trendColor}10` }}
                  >
                    <TrendIcon size={12} color={trendColor} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: trendColor }}>
                      {trend === "up" ? "Improving" : trend === "down" ? "Declining" : "Steady"}
                    </span>
                  </span>
                </>
              )}
            </div>

            {explanation && !isLoading && (
              <p
                className="mt-3 max-w-xs"
                style={{ fontSize: 13, color: "rgba(26,26,46,0.55)", lineHeight: 1.6 }}
              >
                {explanation}
              </p>
            )}

            {lastUpdated && !isLoading && (
              <div className="flex items-center gap-1 mt-2">
                <RefreshCw size={10} color="rgba(26,26,46,0.3)" />
                <span style={{ fontSize: 11, color: "rgba(26,26,46,0.3)", fontWeight: 500 }}>
                  Updated at {lastUpdated}
                </span>
              </div>
            )}
          </div>

          {/* Right: radial chart + sparkline */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            {/* Radial chart */}
            <div style={{ width: 170, height: 170 }}>
              {isLoading ? (
                <div
                  className="animate-pulse rounded-full"
                  style={{ width: 170, height: 170, backgroundColor: "rgba(108,71,255,0.07)" }}
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="65%"
                    outerRadius="100%"
                    startAngle={90}
                    endAngle={-270}
                    data={radialData}
                    barSize={14}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      background={{ fill: "rgba(108,71,255,0.07)" }}
                      dataKey="value"
                      angleAxisId={0}
                      cornerRadius={7}
                      isAnimationActive
                      animationBegin={200}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                    {/* Center label baked into SVG via foreignObject isn't needed — overlay with absolute */}
                  </RadialBarChart>
                </ResponsiveContainer>
              )}
              {/* Centered score overlay */}
              {!isLoading && score !== null && (
                <div
                  className="flex flex-col items-center justify-center"
                  style={{
                    position: "relative",
                    marginTop: -170,
                    height: 170,
                    pointerEvents: "none",
                  }}
                >
                  <span style={{ fontSize: 28, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
                    <AnimatedScore target={score} />
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(26,26,46,0.4)" }}>out of 100</span>
                </div>
              )}
            </div>

            {/* Sparkline */}
            {trendHistory.length >= 2 && !isLoading && (
              <div style={{ width: 170 }}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: 11, color: "rgba(26,26,46,0.4)", fontWeight: 500 }}>
                    Last {trendHistory.length} records
                  </span>
                </div>
                <TrendSparkline data={trendHistory} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Accordion breakdown ───────────────────────────────── */}
      <div className="px-7 py-5">
        <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(26,26,46,0.35)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>
          Score Breakdown
        </p>

        {isLoading ? (
          <div className="flex flex-col gap-3 mt-4">
            {[200, 160, 180].map((w, i) => (
              <Skeleton key={i} w="100%" h={20} radius={6} />
            ))}
          </div>
        ) : breakdown ? (
          <Accordion
            type="single"
            collapsible
            defaultValue="budgetAdherence"
            style={{ borderTop: "1px solid rgba(108,71,255,0.07)" }}
          >
            {/* Budget Adherence */}
            <AccordionItem
              value="budgetAdherence"
              style={{ borderColor: "rgba(108,71,255,0.07)" }}
            >
              <AccordionTrigger
                className="no-underline hover:no-underline"
                style={{ color: "#1A1A2E", fontSize: 14, fontWeight: 600 }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(108,71,255,0.08)" }}
                  >
                    <ShieldCheck size={14} color="#6C47FF" />
                  </div>
                  Budget Adherence
                  <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(26,26,46,0.4)" }}>
                    ({breakdown.budgetAdherence}/40 pts)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pb-1 pl-9">
                  <p style={{ fontSize: 13, color: "rgba(26,26,46,0.6)", lineHeight: 1.6 }}>
                    Measures how well your spending tracks against the month's time progression.
                    Full marks when spending pace matches calendar pace.
                  </p>
                  <FactorBar
                    value={breakdown.budgetAdherence}
                    max={40}
                    color={scoreColor((breakdown.budgetAdherence / 40) * 100)}
                    delay={50}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Spending Balance */}
            <AccordionItem
              value="spendingBalance"
              style={{ borderColor: "rgba(108,71,255,0.07)" }}
            >
              <AccordionTrigger
                className="no-underline hover:no-underline"
                style={{ color: "#1A1A2E", fontSize: 14, fontWeight: 600 }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(108,71,255,0.08)" }}
                  >
                    <Zap size={14} color="#6C47FF" />
                  </div>
                  Spending Balance
                  <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(26,26,46,0.4)" }}>
                    ({breakdown.spendingBalance}/30 pts)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pb-1 pl-9">
                  <p style={{ fontSize: 13, color: "rgba(26,26,46,0.6)", lineHeight: 1.6 }}>
                    Based on your daily spend velocity and projected run-out date.
                    Full marks when your budget lasts through the end of the month.
                  </p>
                  <FactorBar
                    value={breakdown.spendingBalance}
                    max={30}
                    color={scoreColor((breakdown.spendingBalance / 30) * 100)}
                    delay={100}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Consistency */}
            <AccordionItem
              value="consistency"
              style={{ borderColor: "rgba(108,71,255,0.07)" }}
            >
              <AccordionTrigger
                className="no-underline hover:no-underline"
                style={{ color: "#1A1A2E", fontSize: 14, fontWeight: 600 }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(108,71,255,0.08)" }}
                  >
                    <CalendarCheck size={14} color="#6C47FF" />
                  </div>
                  Logging Consistency
                  <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(26,26,46,0.4)" }}>
                    ({breakdown.consistency}/30 pts)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pb-1 pl-9">
                  <p style={{ fontSize: 13, color: "rgba(26,26,46,0.6)", lineHeight: 1.6 }}>
                    Rewards regular expense logging. You earn full marks by recording
                    at least one expense in the last 3 days.
                  </p>
                  <FactorBar
                    value={breakdown.consistency}
                    max={30}
                    color={scoreColor((breakdown.consistency / 30) * 100)}
                    delay={150}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <p style={{ fontSize: 13, color: "rgba(26,26,46,0.4)", paddingTop: 12 }}>
            No score data available. Set up a budget to calculate your health score.
          </p>
        )}
      </div>
    </motion.div>
  );
}
