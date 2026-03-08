import { useState } from "react";
import {
  Trophy,
  Flame,
  Clock,
  ArrowRight,
  Zap,
  PiggyBank,
  ShoppingBag,
  Utensils,
  CreditCard,
  Heart,
  Bike,
  BookOpen,
  Coffee,
  Star,
  ChevronRight,
  Sparkles,
  Medal,
  Target,
} from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";

// ─── Design tokens ─────────────────────────────
const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 12px rgba(108,71,255,0.08)",
};

// ─── Types ─────────────────────────────────────
interface ActiveChallenge {
  id: string;
  name: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  target: number;
  saved: number;
  endsIn: string;
  description: string;
}

interface AvailableChallenge {
  id: string;
  name: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  description: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reward: string;
}

// ─── Data ──────────────────────────────────────
const activeChallenges: ActiveChallenge[] = [
  {
    id: "no-spend",
    name: "No-Spend Weekend",
    icon: CreditCard,
    iconColor: "#6C47FF",
    iconBg: "#EDE9FF",
    target: 1000,
    saved: 620,
    endsIn: "3 days",
    description: "Avoid all non-essential spending this weekend.",
  },
  {
    id: "meal-prep",
    name: "Meal Prep Master",
    icon: Utensils,
    iconColor: "#F59E0B",
    iconBg: "#FFF7ED",
    target: 2000,
    saved: 1480,
    endsIn: "5 days",
    description: "Cook all meals at home for a full week.",
  },
  {
    id: "bike-week",
    name: "Bike to Work Week",
    icon: Bike,
    iconColor: "#22C55E",
    iconBg: "#F0FDF4",
    target: 800,
    saved: 350,
    endsIn: "4 days",
    description: "Skip cabs and metro — cycle to work all week.",
  },
  {
    id: "cafe-detox",
    name: "Café Detox",
    icon: Coffee,
    iconColor: "#EC4899",
    iconBg: "#FDF2F8",
    target: 1500,
    saved: 1500,
    endsIn: "Completed",
    description: "No café purchases for 10 days straight.",
  },
];

const availableChallenges: AvailableChallenge[] = [
  {
    id: "save-1k",
    name: "Save ₹1,000 Sprint",
    icon: PiggyBank,
    iconColor: "#6C47FF",
    iconBg: "#EDE9FF",
    description: "Save ₹1,000 in just 7 days.",
    duration: "7 days",
    difficulty: "Easy",
    reward: "+50 XP",
  },
  {
    id: "zero-shopping",
    name: "Zero Shopping Week",
    icon: ShoppingBag,
    iconColor: "#EF4444",
    iconBg: "#FEF2F2",
    description: "No online or offline shopping for 7 days.",
    duration: "7 days",
    difficulty: "Medium",
    reward: "+75 XP",
  },
  {
    id: "fitness-fund",
    name: "Fitness Fund",
    icon: Heart,
    iconColor: "#EC4899",
    iconBg: "#FDF2F8",
    description: "Save ₹500 by skipping gym supplements.",
    duration: "14 days",
    difficulty: "Easy",
    reward: "+60 XP",
  },
  {
    id: "reading-save",
    name: "Read, Don't Spend",
    icon: BookOpen,
    iconColor: "#3B82F6",
    iconBg: "#EFF6FF",
    description: "Replace impulse buys with reading time.",
    duration: "21 days",
    difficulty: "Hard",
    reward: "+120 XP",
  },
  {
    id: "energy-saver",
    name: "Energy Saver",
    icon: Zap,
    iconColor: "#F59E0B",
    iconBg: "#FFF7ED",
    description: "Cut utility bills by 15% this month.",
    duration: "30 days",
    difficulty: "Hard",
    reward: "+150 XP",
  },
  {
    id: "streak-saver",
    name: "5-Day Saving Streak",
    icon: Flame,
    iconColor: "#EF4444",
    iconBg: "#FEF2F2",
    description: "Save something every day for 5 days straight.",
    duration: "5 days",
    difficulty: "Easy",
    reward: "+40 XP",
  },
];

const completedCount = 3;
const totalXP = 285;

// ─── Difficulty badge colors ───────────────────
function getDifficultyStyle(d: "Easy" | "Medium" | "Hard") {
  switch (d) {
    case "Easy":
      return { color: "#22C55E", bg: "rgba(34,197,94,0.08)" };
    case "Medium":
      return { color: "#F59E0B", bg: "rgba(245,158,11,0.08)" };
    case "Hard":
      return { color: "#EF4444", bg: "rgba(239,68,68,0.08)" };
  }
}

// ─── Trophy Banner SVG decoration ──────────────
function TrophyDecoration() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 120, height: 100 }}>
      {/* Confetti dots */}
      {[
        { x: 10, y: 8, size: 6, color: "#F59E0B", delay: 0 },
        { x: 95, y: 12, size: 5, color: "#22C55E", delay: 0.1 },
        { x: 20, y: 70, size: 4, color: "#EF4444", delay: 0.2 },
        { x: 100, y: 65, size: 7, color: "#6C47FF", delay: 0.15 },
        { x: 55, y: 5, size: 5, color: "#EC4899", delay: 0.05 },
        { x: 5, y: 40, size: 4, color: "#3B82F6", delay: 0.25 },
        { x: 110, y: 38, size: 5, color: "#F59E0B", delay: 0.3 },
      ].map((dot, i) => (
        <div
          key={`dot-${i}`}
          className="absolute rounded-full"
          style={{
            width: dot.size,
            height: dot.size,
            backgroundColor: dot.color,
            left: dot.x,
            top: dot.y,
            opacity: 0.7,
            animation: `confettiBounce 2s ease-in-out ${dot.delay}s infinite`,
          }}
        />
      ))}
      {/* Trophy icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
          backdropFilter: "blur(8px)",
        }}
      >
        <Trophy size={32} color="#fff" strokeWidth={1.8} />
      </div>
    </div>
  );
}

// ─── Active Challenge Card ─────────────────────
function ActiveCard({ challenge }: { challenge: ActiveChallenge }) {
  const percent = Math.min(Math.round((challenge.saved / challenge.target) * 100), 100);
  const isComplete = percent >= 100;
  const Icon = challenge.icon;

  return (
    <div
      className="p-6 flex flex-col gap-4 transition-all hover:translate-y-[-2px]"
      style={{
        ...cardStyle,
        border: isComplete ? "1.5px solid rgba(34,197,94,0.15)" : "1px solid transparent",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: challenge.iconBg }}
          >
            <Icon size={20} color={challenge.iconColor} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>{challenge.name}</h3>
            <p style={{ fontSize: 13, color: "rgba(26,26,46,0.4)", marginTop: 2 }}>
              {challenge.description}
            </p>
          </div>
        </div>
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-2.5">
        {/* Deadline */}
        <span
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: isComplete ? "#22C55E" : "rgba(26,26,46,0.5)",
            backgroundColor: isComplete ? "rgba(34,197,94,0.06)" : "#F7F6FF",
          }}
        >
          {isComplete ? <Sparkles size={13} /> : <Clock size={13} />}
          {challenge.endsIn}
        </span>

        {/* Status chip */}
        <span
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: isComplete ? "#22C55E" : "#F59E0B",
            backgroundColor: isComplete ? "rgba(34,197,94,0.06)" : "rgba(245,158,11,0.06)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: isComplete ? "#22C55E" : "#F59E0B" }}
          />
          {isComplete ? "Completed" : "In Progress"}
        </span>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F0EEFF" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${percent}%`,
                background: isComplete
                  ? "linear-gradient(90deg, #22C55E 0%, #4ADE80 100%)"
                  : "linear-gradient(90deg, #6C47FF 0%, #8B6AFF 100%)",
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <span
            className="px-2 py-0.5 rounded-md"
            style={{
              fontSize: 12,
              fontWeight: 700,
              minWidth: 40,
              textAlign: "center",
              color: isComplete ? "#22C55E" : "#6C47FF",
              backgroundColor: isComplete ? "rgba(34,197,94,0.08)" : "#EDE9FF",
            }}
          >
            {percent}%
          </span>
        </div>
        <span style={{ fontSize: 13, color: "rgba(26,26,46,0.45)" }}>
          <span style={{ fontWeight: 600, color: "#1A1A2E" }}>₹{challenge.saved.toLocaleString()}</span> saved
          of ₹{challenge.target.toLocaleString()} target
        </span>
      </div>

      {/* View Details link */}
      <button
        className="flex items-center gap-1.5 self-start cursor-pointer border-none bg-transparent px-0 py-1 transition-all"
        style={{ fontSize: 13, fontWeight: 600, color: "#6C47FF" }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        View Details
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

// ─── Available Challenge Card ──────────────────
function AvailableCard({
  challenge,
  onJoin,
}: {
  challenge: AvailableChallenge;
  onJoin: (id: string) => void;
}) {
  const Icon = challenge.icon;
  const diff = getDifficultyStyle(challenge.difficulty);

  return (
    <div
      className="p-5 flex flex-col gap-4 transition-all hover:translate-y-[-2px] group"
      style={cardStyle}
    >
      {/* Icon + Difficulty */}
      <div className="flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: challenge.iconBg }}
        >
          <Icon size={22} color={challenge.iconColor} />
        </div>
        <span
          className="px-2.5 py-1 rounded-full"
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: diff.color,
            backgroundColor: diff.bg,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {challenge.difficulty}
        </span>
      </div>

      {/* Name + Description */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E", marginBottom: 4 }}>
          {challenge.name}
        </h3>
        <p style={{ fontSize: 13, color: "rgba(26,26,46,0.45)", lineHeight: 1.5 }}>
          {challenge.description}
        </p>
      </div>

      {/* Duration + Reward */}
      <div className="flex items-center gap-3">
        <span
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{ fontSize: 12, fontWeight: 500, color: "rgba(26,26,46,0.5)", backgroundColor: "#F7F6FF" }}
        >
          <Clock size={12} />
          {challenge.duration}
        </span>
        <span
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{ fontSize: 12, fontWeight: 600, color: "#6C47FF", backgroundColor: "#EDE9FF" }}
        >
          <Star size={12} />
          {challenge.reward}
        </span>
      </div>

      {/* Join Button */}
      <button
        onClick={() => onJoin(challenge.id)}
        className="w-full py-2.5 rounded-xl cursor-pointer transition-all border-none flex items-center justify-center gap-2"
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#fff",
          backgroundColor: "#6C47FF",
          boxShadow: "0 4px 16px rgba(108,71,255,0.2)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 24px rgba(108,71,255,0.35)")}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(108,71,255,0.2)")}
      >
        Join Challenge
        <ArrowRight size={15} />
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────
export function ChallengesPage() {
  const [tab, setTab] = useState<"active" | "available">("active");
  const [joined, setJoined] = useState<string[]>([]);

  const handleJoin = (id: string) => {
    setJoined((prev) => [...prev, id]);
  };

  const filteredAvailable = availableChallenges.filter((c) => !joined.includes(c.id));

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#F7F6FF" }}
    >
      {/* Confetti animation keyframes */}
      <style>{`
        @keyframes confettiBounce {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
          50% { transform: translateY(-6px) scale(1.2); opacity: 1; }
        }
      `}</style>

      <DashboardSidebar activePage="Challenges" />

      <main className="flex-1 ml-16 p-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
            Challenges
          </h1>
          <p style={{ fontSize: 14, color: "rgba(26,26,46,0.45)", marginTop: 4 }}>
            Level up your finances.
          </p>
        </div>

        {/* ── Achievement Banner ──────────── */}
        <div
          className="p-6 mb-7 flex items-center justify-between overflow-hidden relative"
          style={{
            borderRadius: 20,
            background: "linear-gradient(135deg, #6C47FF 0%, #8B6AFF 50%, #A78BFA 100%)",
            boxShadow: "0 8px 32px rgba(108,71,255,0.3)",
          }}
        >
          {/* Decorative glow */}
          <div
            className="absolute -top-20 -left-20 w-60 h-60 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }}
          />

          <div className="relative z-10 flex items-center gap-5">
            {/* Medal icon */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
            >
              <Medal size={28} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
                You've completed {completedCount} challenges. Keep going!
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <span
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    backgroundColor: "rgba(255,255,255,0.15)",
                  }}
                >
                  <Star size={13} />
                  {totalXP} XP earned
                </span>
                <span
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    backgroundColor: "rgba(255,255,255,0.15)",
                  }}
                >
                  <Flame size={13} />
                  3-day streak
                </span>
                <span
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    backgroundColor: "rgba(255,255,255,0.15)",
                  }}
                >
                  <Target size={13} />
                  {activeChallenges.length} active
                </span>
              </div>
            </div>
          </div>

          {/* Trophy + Confetti */}
          <div className="relative z-10">
            <TrophyDecoration />
          </div>
        </div>

        {/* ── Tabs ────────────────────────── */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl inline-flex" style={{ backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(108,71,255,0.06)" }}>
          {(["active", "available"] as const).map((t) => {
            const isActive = tab === t;
            const label = t === "active" ? "Active Challenges" : "Available Challenges";
            const count = t === "active" ? activeChallenges.length : filteredAvailable.length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg cursor-pointer border-none transition-all"
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#fff" : "rgba(26,26,46,0.5)",
                  backgroundColor: isActive ? "#6C47FF" : "transparent",
                  boxShadow: isActive ? "0 2px 10px rgba(108,71,255,0.25)" : "none",
                }}
              >
                {label}
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isActive ? "#6C47FF" : "rgba(26,26,46,0.35)",
                    backgroundColor: isActive ? "rgba(255,255,255,0.9)" : "rgba(26,26,46,0.05)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Active Challenges ─────────── */}
        {tab === "active" && (
          <div className="grid grid-cols-2 gap-5">
            {activeChallenges.map((ch) => (
              <ActiveCard key={ch.id} challenge={ch} />
            ))}
            {/* Joined cards from available */}
            {joined.map((id) => {
              const ch = availableChallenges.find((c) => c.id === id);
              if (!ch) return null;
              const active: ActiveChallenge = {
                id: ch.id,
                name: ch.name,
                icon: ch.icon,
                iconColor: ch.iconColor,
                iconBg: ch.iconBg,
                target: 1000,
                saved: 0,
                endsIn: ch.duration,
                description: ch.description,
              };
              return <ActiveCard key={active.id} challenge={active} />;
            })}
          </div>
        )}

        {/* ── Available Challenges ──────── */}
        {tab === "available" && (
          <>
            {filteredAvailable.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                  style={{ background: "linear-gradient(135deg, #EDE9FF, #F7F6FF)" }}
                >
                  <Trophy size={36} color="#6C47FF" strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginBottom: 6 }}>
                  All challenges joined!
                </h3>
                <p style={{ fontSize: 14, color: "rgba(26,26,46,0.4)" }}>
                  You've joined every available challenge. Check back soon for new ones.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-5">
                {filteredAvailable.map((ch) => (
                  <AvailableCard key={ch.id} challenge={ch} onJoin={handleJoin} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
