import { Brain, Gauge, BellRing } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Purchase Advisor",
    description:
      "Ask Clutch before any buy. Get a YES / MAYBE / NO verdict instantly based on your budget, goals, and spending history.",
    iconBg: "#6C47FF",
  },
  {
    icon: Gauge,
    title: "Spend Velocity Tracking",
    description:
      "Know exactly when your budget runs out before it does. Clutch calculates your burn rate and forecasts to the day.",
    iconBg: "#22C55E",
  },
  {
    icon: BellRing,
    title: "Proactive Nudges",
    description:
      "Get warned at 80% budget consumption, not after you've crossed it. Stay ahead with smart, timely alerts.",
    iconBg: "#F59E0B",
  },
];

export function Features() {
  return (
    <section className="py-24" style={{ backgroundColor: "#fff" }}>
      <div className="max-w-[1280px] mx-auto px-8">
        {/* Section header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p
            className="inline-block px-4 py-1.5 rounded-full mb-4"
            style={{
              backgroundColor: "#EDE9FF",
              color: "#6C47FF",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Features
          </p>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#1A1A2E",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            Finance tools that actually{" "}
            <span style={{ color: "#6C47FF" }}>think ahead</span>
          </h2>
          <p
            className="mt-4"
            style={{ fontSize: 17, color: "#1A1A2E", opacity: 0.6, lineHeight: 1.7 }}
          >
            Three pillars that make Clutch different from every other budgeting
            app you've tried.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-8 rounded-2xl flex flex-col gap-5 transition-all hover:-translate-y-1"
              style={{
                backgroundColor: "#fff",
                boxShadow: "0 2px 12px rgba(108,71,255,0.08)",
                borderRadius: 16,
              }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: f.iconBg + "14" }}
              >
                <f.icon size={26} color={f.iconBg} strokeWidth={1.8} />
              </div>
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#1A1A2E",
                  lineHeight: 1.3,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: "#1A1A2E",
                  opacity: 0.6,
                  lineHeight: 1.7,
                }}
              >
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
