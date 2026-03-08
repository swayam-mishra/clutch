import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router";
import { DashboardMockup } from "./DashboardMockup";

export function Hero() {
  return (
    <section
      className="min-h-[90vh] flex items-center"
      style={{ backgroundColor: "#F7F6FF" }}
    >
      <div className="max-w-[1280px] mx-auto px-8 py-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="flex flex-col gap-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit"
            style={{ backgroundColor: "#EDE9FF", color: "#6C47FF" }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: "#6C47FF" }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: "#6C47FF" }}
              />
            </span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              AI-Powered Finance
            </span>
          </div>

          <h1
            style={{
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.1,
              color: "#1A1A2E",
              letterSpacing: "-0.02em",
            }}
          >
            Your money.{" "}
            <span style={{ color: "#6C47FF" }}>Finally working</span> for you.
          </h1>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: "#1A1A2E",
              opacity: 0.7,
              maxWidth: 520,
            }}
          >
            Clutch watches your spending in real-time, warns you before you
            overspend, and gives you AI advice on every purchase.
          </p>

          <div className="flex items-center gap-4 mt-2">
            <Link
              to="/auth"
              className="flex items-center gap-2 px-7 py-4 rounded-xl text-white no-underline cursor-pointer transition-all hover:opacity-90"
              style={{
                backgroundColor: "#6C47FF",
                fontSize: 16,
                fontWeight: 600,
                boxShadow: "0 4px 20px rgba(108,71,255,0.35)",
              }}
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <button
              className="flex items-center gap-2 px-7 py-4 rounded-xl cursor-pointer transition-all hover:bg-[#EDE9FF]"
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#6C47FF",
                border: "2px solid #6C47FF",
                backgroundColor: "transparent",
              }}
            >
              <Play size={16} fill="#6C47FF" />
              See how it works
            </button>
          </div>

          <div className="flex items-center gap-6 mt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-white"
                  style={{
                    backgroundColor: "#EDE9FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6C47FF",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1A1A2E",
                }}
              >
                12,000+ users
              </p>
              <p style={{ fontSize: 13, color: "#1A1A2E", opacity: 0.5 }}>
                already saving smarter
              </p>
            </div>
          </div>
        </div>

        {/* Right — floating dashboard mockup */}
        <div className="flex justify-center lg:justify-end">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}