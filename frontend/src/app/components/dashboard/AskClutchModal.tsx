import { useState, useEffect } from "react";
import { X, Sparkles, Lightbulb, RotateCcw, ArrowRight, Zap } from "lucide-react";
import { apiClient } from '../../services/apiClient';

type Verdict = "YES" | "MAYBE" | "NO";
type Phase = "input" | "loading" | "result";

const categories = ["Food", "Shopping", "Entertainment", "Travel", "Other"] as const;
type Category = (typeof categories)[number];

interface VerdictResult {
  verdict: Verdict;
  explanation: string;
  tip?: string;
}

// ─── Mock AI responses ─────────────────────────
const mockResponses: Record<string, VerdictResult> = {
  default_yes: {
    verdict: "YES",
    explanation:
      "This looks like a reasonable purchase that fits within your current budget. Your spending this week is 18% below average, and this won't push any category over its limit.",
    tip: "Consider waiting 24 hours before buying — if you still want it tomorrow, go for it!",
  },
  default_maybe: {
    verdict: "MAYBE",
    explanation:
      "This purchase is borderline. You have the funds, but your Shopping category is already at 72% with 12 days left in the month. It could push you over budget.",
    tip: "Check if there's a sale coming up. A 10-15% discount would make this a much easier YES.",
  },
  default_no: {
    verdict: "NO",
    explanation:
      "This would put your monthly spending over budget by ₹2,400. Your Emergency Fund goal also needs ₹18,000 more, and this purchase directly competes with that priority.",
    tip: "Try the 30-day rule: add it to a wishlist and revisit in 30 days. 60% of impulse buys lose their appeal.",
  },
};

function getVerdictForInput(text: string): VerdictResult {
  const lower = text.toLowerCase();
  // Simulate smart responses based on keywords
  if (
    lower.includes("iphone") ||
    lower.includes("macbook") ||
    lower.includes("laptop") ||
    lower.includes("ps5") ||
    lower.includes("₹50") ||
    lower.includes("₹80") ||
    lower.includes("₹100")
  ) {
    return mockResponses.default_no;
  }
  if (
    lower.includes("shoes") ||
    lower.includes("headphone") ||
    lower.includes("shirt") ||
    lower.includes("₹2") ||
    lower.includes("₹3") ||
    lower.includes("course")
  ) {
    return mockResponses.default_maybe;
  }
  // Default to YES for smaller / generic items
  return mockResponses.default_yes;
}

// ─── Verdict color map ─────────────────────────
function getVerdictStyle(v: Verdict) {
  switch (v) {
    case "YES":
      return {
        color: "#22C55E",
        bg: "rgba(34,197,94,0.08)",
        border: "rgba(34,197,94,0.15)",
        glow: "0 0 24px rgba(34,197,94,0.15)",
      };
    case "MAYBE":
      return {
        color: "#F59E0B",
        bg: "rgba(245,158,11,0.08)",
        border: "rgba(245,158,11,0.15)",
        glow: "0 0 24px rgba(245,158,11,0.15)",
      };
    case "NO":
      return {
        color: "#EF4444",
        bg: "rgba(239,68,68,0.08)",
        border: "rgba(239,68,68,0.15)",
        glow: "0 0 24px rgba(239,68,68,0.15)",
      };
  }
}

// ─── Pulse Spinner ─────────────────────────────
function PulseSpinner() {
  return (
    <div className="flex flex-col items-center gap-5 py-10">
      <style>{`
        @keyframes clutchPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes clutchRing {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
      `}</style>
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "2px solid rgba(108,71,255,0.15)",
            animation: "clutchRing 2s ease-in-out infinite",
          }}
        />
        {/* Middle ring */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 8,
            border: "2px solid rgba(108,71,255,0.25)",
            animation: "clutchRing 2s ease-in-out 0.3s infinite",
          }}
        />
        {/* Core */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #6C47FF, #8B6AFF)",
            boxShadow: "0 4px 24px rgba(108,71,255,0.3)",
            animation: "clutchPulse 2s ease-in-out infinite",
          }}
        >
          <Sparkles size={22} color="#fff" />
        </div>
      </div>
      <div className="text-center">
        <p style={{ fontSize: 16, fontWeight: 600, color: "#1A1A2E" }}>Clutch is thinking...</p>
        <p style={{ fontSize: 13, color: "rgba(26,26,46,0.4)", marginTop: 4 }}>
          Analyzing your budget, goals, and spending patterns
        </p>
      </div>
    </div>
  );
}

// ─── Category Chip ─────────────────────────────
function CategoryChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-full cursor-pointer border-none transition-all"
      style={{
        fontSize: 13,
        fontWeight: selected ? 600 : 500,
        color: selected ? "#6C47FF" : "rgba(26,26,46,0.5)",
        backgroundColor: selected ? "#EDE9FF" : "#F7F6FF",
        border: selected ? "1px solid rgba(108,71,255,0.15)" : "1px solid transparent",
      }}
    >
      {label}
    </button>
  );
}

// ─── Main Modal ────────────────────────────────
export function AskClutchModal({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>("input");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [result, setResult] = useState<VerdictResult | null>(null);

  const [error, setError] = useState<string | null>(null);

  const handleGetVerdict = async () => {
    if (!query.trim()) return;
    setPhase("loading");
    setError(null);
    try {
      const aiVerdict = await apiClient('/ai/ask', {
        method: 'POST',
        body: JSON.stringify({ query, category: selectedCategory }),
      });
      setResult(aiVerdict);
      setPhase("result");
    } catch (err) {
      console.error('Ask Clutch failed:', err);
      setError('Something went wrong. Please try again.');
      setPhase("input");
    }
  };

  const handleReset = () => {
    setPhase("input");
    setQuery("");
    setSelectedCategory(null);
    setResult(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ backgroundColor: "rgba(26,26,46,0.45)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full flex flex-col"
        style={{
          maxWidth: 520,
          backgroundColor: "#fff",
          borderRadius: 20,
          boxShadow: "0 32px 80px rgba(108,71,255,0.2)",
          overflow: "hidden",
          animation: "modalIn 0.25s ease-out",
        }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.96) translateY(8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* ── Header ───────────────────────── */}
        <div
          className="flex items-center justify-between px-7 pt-6 pb-5"
          style={{ borderBottom: "1px solid rgba(108,71,255,0.06)" }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6C47FF, #8B6AFF)",
                boxShadow: "0 4px 16px rgba(108,71,255,0.25)",
              }}
            >
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E" }}>Ask Clutch</h2>
              <p style={{ fontSize: 13, color: "rgba(26,26,46,0.45)" }}>
                Should you buy this? Let AI decide.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all"
            style={{ backgroundColor: "#F7F6FF" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#EDE9FF")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F7F6FF")}
          >
            <X size={17} color="rgba(26,26,46,0.4)" />
          </button>
        </div>

        {/* ── Body ─────────────────────────── */}
        <div className="px-7 py-6">
          {/* INPUT PHASE */}
          {phase === "input" && (
            <div className="flex flex-col gap-5">
              {/* Text input */}
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>
                  What are you about to buy?
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹800 running shoes"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGetVerdict()}
                  autoFocus
                  className="w-full px-5 py-4 rounded-xl outline-none"
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "#1A1A2E",
                    backgroundColor: "#F7F6FF",
                    border: "1.5px solid rgba(108,71,255,0.1)",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(108,71,255,0.3)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(108,71,255,0.1)")}
                />
              </div>

              {/* Category chips */}
              <div className="flex flex-col gap-2.5">
                <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>
                  Category{" "}
                  <span style={{ fontWeight: 400, color: "rgba(26,26,46,0.3)" }}>(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <CategoryChip
                      key={cat}
                      label={cat}
                      selected={selectedCategory === cat}
                      onClick={() =>
                        setSelectedCategory((prev) => (prev === cat ? null : cat))
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Get Verdict button */}
              <button
                onClick={handleGetVerdict}
                disabled={!query.trim()}
                className="w-full py-3.5 rounded-xl text-white cursor-pointer transition-all border-none flex items-center justify-center gap-2.5"
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  backgroundColor: query.trim() ? "#6C47FF" : "rgba(108,71,255,0.3)",
                  boxShadow: query.trim() ? "0 4px 20px rgba(108,71,255,0.25)" : "none",
                  cursor: query.trim() ? "pointer" : "not-allowed",
                }}
              >
                <Zap size={16} />
                Get Verdict
              </button>

              {/* Error message */}
              {error && (
                <p
                  className="text-center"
                  style={{ fontSize: 13, color: "#EF4444", lineHeight: 1.5 }}
                >
                  {error}
                </p>
              )}

              {/* Helper text */}
              <p
                className="text-center"
                style={{ fontSize: 12, color: "rgba(26,26,46,0.3)", lineHeight: 1.5 }}
              >
                Clutch analyzes your budget, goals, and spending history to give you an honest
                verdict.
              </p>
            </div>
          )}

          {/* LOADING PHASE */}
          {phase === "loading" && <PulseSpinner />}

          {/* RESULT PHASE */}
          {phase === "result" && result && (
            <ResultView
              query={query}
              category={selectedCategory}
              result={result}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Result View Component ─────────────────────
function ResultView({
  query,
  category,
  result,
  onReset,
}: {
  query: string;
  category: Category | null;
  result: VerdictResult;
  onReset: () => void;
}) {
  const vs = getVerdictStyle(result.verdict);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowResult(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <style>{`
        @keyframes verdictPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* What was asked */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
        style={{ backgroundColor: "#F7F6FF" }}
      >
        <span style={{ fontSize: 13, color: "rgba(26,26,46,0.4)" }}>Asked about:</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E" }}>{query}</span>
        {category && (
          <span
            className="ml-auto px-2.5 py-0.5 rounded-full"
            style={{ fontSize: 11, fontWeight: 600, color: "#6C47FF", backgroundColor: "#EDE9FF" }}
          >
            {category}
          </span>
        )}
      </div>

      {/* Verdict Badge */}
      <div className="flex justify-center py-3">
        <div
          className="px-10 py-3.5 rounded-full flex items-center gap-3"
          style={{
            backgroundColor: vs.bg,
            border: `2px solid ${vs.border}`,
            boxShadow: vs.glow,
            animation: showResult ? "verdictPop 0.4s ease-out forwards" : "none",
            opacity: showResult ? 1 : 0,
          }}
        >
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: vs.color }}
          />
          <span style={{ fontSize: 28, fontWeight: 800, color: vs.color, letterSpacing: "0.08em" }}>
            {result.verdict}
          </span>
        </div>
      </div>

      {/* Explanation */}
      <p
        style={{
          fontSize: 14,
          color: "rgba(26,26,46,0.65)",
          lineHeight: 1.7,
          textAlign: "center",
          animation: showResult ? "fadeUp 0.4s ease-out 0.15s both" : "none",
        }}
      >
        {result.explanation}
      </p>

      {/* Tip card */}
      {result.tip && (
        <div
          className="flex items-start gap-3 px-5 py-4 rounded-xl"
          style={{
            backgroundColor: "#EDE9FF",
            border: "1px solid rgba(108,71,255,0.08)",
            animation: showResult ? "fadeUp 0.4s ease-out 0.3s both" : "none",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: "rgba(108,71,255,0.12)" }}
          >
            <Lightbulb size={16} color="#6C47FF" />
          </div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#6C47FF", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
              Pro Tip
            </span>
            <p style={{ fontSize: 13, color: "rgba(26,26,46,0.6)", lineHeight: 1.6, marginTop: 3 }}>
              {result.tip}
            </p>
          </div>
        </div>
      )}

      {/* Ask another */}
      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 mx-auto px-5 py-2.5 rounded-xl cursor-pointer border-none transition-all"
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#6C47FF",
          backgroundColor: "rgba(108,71,255,0.04)",
          border: "1px solid rgba(108,71,255,0.1)",
          animation: showResult ? "fadeUp 0.4s ease-out 0.45s both" : "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#EDE9FF";
          e.currentTarget.style.borderColor = "rgba(108,71,255,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(108,71,255,0.04)";
          e.currentTarget.style.borderColor = "rgba(108,71,255,0.1)";
        }}
      >
        <RotateCcw size={14} />
        Ask another
      </button>
    </div>
  );
}
