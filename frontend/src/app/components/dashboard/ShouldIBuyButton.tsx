import { useState } from "react";
import { Sparkles, Loader2, X, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useAI, type ShouldIBuyResult, type AIVerdict } from "../../../hooks/useAI";

// ─── Verdict config ───────────────────────────────────────────────────────────

const VERDICT_CONFIG: Record<
  AIVerdict,
  { icon: React.ElementType; color: string; bg: string; badge: string; label: string }
> = {
  YES: {
    icon: CheckCircle2,
    color: "#22C55E",
    bg: "rgba(34,197,94,0.08)",
    badge: "rgba(34,197,94,0.12)",
    label: "Go for it",
  },
  MAYBE: {
    icon: AlertCircle,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    badge: "rgba(245,158,11,0.12)",
    label: "Think twice",
  },
  NO: {
    icon: XCircle,
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    badge: "rgba(239,68,68,0.12)",
    label: "Hold off",
  },
};

// ─── Result Dialog ────────────────────────────────────────────────────────────

function ResultDialog({
  open,
  onOpenChange,
  result,
  item,
  price,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  result: ShouldIBuyResult;
  item: string;
  price: string;
}) {
  const cfg = VERDICT_CONFIG[result.verdict];
  const VerdictIcon = cfg.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 overflow-hidden gap-0"
        style={{
          maxWidth: 480,
          borderRadius: 20,
          border: "none",
          boxShadow: "0 24px 64px rgba(108,71,255,0.18)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Verdict header */}
        <div
          className="px-8 pt-8 pb-6 flex flex-col items-center gap-3"
          style={{ backgroundColor: cfg.bg }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: cfg.badge }}
          >
            <VerdictIcon size={34} color={cfg.color} strokeWidth={1.8} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span
              className="px-4 py-1 rounded-full"
              style={{ fontSize: 12, fontWeight: 700, color: cfg.color, backgroundColor: cfg.badge, letterSpacing: "0.04em", textTransform: "uppercase" }}
            >
              {cfg.label}
            </span>
            <DialogHeader>
              <DialogTitle
                className="text-center mt-1"
                style={{ fontSize: 22, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.01em" }}
              >
                {item}
              </DialogTitle>
            </DialogHeader>
            <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>
              ₹{Number(price).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 flex flex-col gap-5" style={{ backgroundColor: "#fff" }}>
          {/* Explanation */}
          <p style={{ fontSize: 15, color: "#1A1A2E", lineHeight: 1.7, fontWeight: 450 }}>
            {result.explanation}
          </p>

          {/* Tip */}
          <div
            className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
            style={{ backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.08)" }}
          >
            <Sparkles size={15} color="#6C47FF" className="mt-0.5 shrink-0" />
            <p style={{ fontSize: 13, color: "rgba(26,26,46,0.7)", lineHeight: 1.6 }}>
              {result.tip}
            </p>
          </div>

          {/* Context strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Budget left", value: `₹${result.contextUsed.remainingBudget.toLocaleString()}` },
              { label: "Days remaining", value: `${result.contextUsed.daysLeft}d` },
              { label: "Daily spend", value: `₹${result.contextUsed.dailyVelocity}/day` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-0.5 py-3 rounded-xl"
                style={{ backgroundColor: "#F7F6FF" }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>{value}</span>
                <span style={{ fontSize: 11, color: "rgba(26,26,46,0.4)", fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="w-full py-3 rounded-xl border-none cursor-pointer transition-all hover:opacity-90"
            style={{ backgroundColor: "#6C47FF", color: "#fff", fontSize: 14, fontWeight: 600, boxShadow: "0 4px 20px rgba(108,71,255,0.25)" }}
          >
            Got it
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Input Dialog ─────────────────────────────────────────────────────────────

function InputDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (item: string, price: string) => void;
  isLoading: boolean;
}) {
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");

  const canSubmit = item.trim() && price && !isLoading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(item.trim(), price);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden"
        style={{
          maxWidth: 440,
          borderRadius: 20,
          border: "none",
          boxShadow: "0 24px 64px rgba(108,71,255,0.18)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5" style={{ borderBottom: "1px solid rgba(108,71,255,0.06)" }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EDE9FF" }}>
              <Sparkles size={17} color="#6C47FF" />
            </div>
            <DialogHeader>
              <DialogTitle style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E" }}>
                Should I Buy This?
              </DialogTitle>
            </DialogHeader>
          </div>
          <p style={{ fontSize: 13, color: "rgba(26,26,46,0.45)", paddingLeft: 48 }}>
            Clutch checks your budget and gives you an honest answer.
          </p>
        </div>

        {/* Form */}
        <div className="px-7 py-6 flex flex-col gap-4" style={{ backgroundColor: "#fff" }}>
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>
              What do you want to buy?
            </label>
            <input
              type="text"
              placeholder="e.g. AirPods Pro, PS5, new sneakers…"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
              className="px-4 py-3 rounded-xl outline-none"
              style={{
                fontSize: 14, color: "#1A1A2E",
                backgroundColor: "#F7F6FF",
                border: "1px solid rgba(108,71,255,0.08)",
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,46,0.5)" }}>
              How much does it cost?
            </label>
            <div
              className="flex items-center rounded-xl px-4 overflow-hidden"
              style={{ backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.08)" }}
            >
              <span style={{ fontSize: 18, fontWeight: 700, color: "#6C47FF", marginRight: 4 }}>₹</span>
              <input
                type="number"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="flex-1 bg-transparent py-3 outline-none"
                style={{ fontSize: 16, fontWeight: 600, color: "#1A1A2E", border: "none" }}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-3.5 rounded-xl text-white border-none transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: "#6C47FF", fontSize: 15, fontWeight: 600,
              boxShadow: canSubmit ? "0 4px 20px rgba(108,71,255,0.25)" : "none",
              marginTop: 4,
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Asking Clutch…
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Ask Clutch
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Floating Button ──────────────────────────────────────────────────────────

export function ShouldIBuyButton() {
  const { shouldIBuy } = useAI();
  const [inputOpen, setInputOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [lastItem, setLastItem] = useState("");
  const [lastPrice, setLastPrice] = useState("");

  const handleSubmit = (item: string, price: string) => {
    setLastItem(item);
    setLastPrice(price);
    shouldIBuy.mutate(
      { itemDescription: item, amount: Number(price) },
      {
        onSuccess: () => {
          setInputOpen(false);
          setResultOpen(true);
        },
      },
    );
  };

  const handleInputOpenChange = (v: boolean) => {
    if (!v) shouldIBuy.reset();
    setInputOpen(v);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setInputOpen(true)}
        className="fixed bottom-8 right-8 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-white border-none cursor-pointer transition-all hover:scale-105 hover:shadow-2xl active:scale-95 z-40"
        style={{
          backgroundColor: "#6C47FF",
          fontSize: 14,
          fontWeight: 700,
          boxShadow: "0 8px 32px rgba(108,71,255,0.4)",
          letterSpacing: "-0.01em",
        }}
      >
        <Sparkles size={17} />
        Should I Buy This?
      </button>

      {/* Input dialog */}
      <InputDialog
        open={inputOpen}
        onOpenChange={handleInputOpenChange}
        onSubmit={handleSubmit}
        isLoading={shouldIBuy.isPending}
      />

      {/* Result dialog */}
      {shouldIBuy.data && (
        <ResultDialog
          open={resultOpen}
          onOpenChange={(v) => {
            setResultOpen(v);
            if (!v) shouldIBuy.reset();
          }}
          result={shouldIBuy.data}
          item={lastItem}
          price={lastPrice}
        />
      )}
    </>
  );
}
