import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

const navLinks = ["Features", "Pricing", "About"];

export function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: "rgba(247,246,255,0.85)",
        borderBottom: "1px solid rgba(108,71,255,0.06)",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#6C47FF" }}
          >
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>
              C
            </span>
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#1A1A2E",
              letterSpacing: "-0.01em",
            }}
          >
            Clutch
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="transition-colors"
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: "#1A1A2E",
                opacity: 0.6,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.opacity = "1")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.opacity = "0.6")
              }
            >
              {link}
            </a>
          ))}
        </div>

        {/* CTA */}
        <Link
          to="/auth"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white no-underline cursor-pointer transition-all hover:opacity-90"
          style={{
            backgroundColor: "#6C47FF",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Get Started
          <ArrowRight size={15} />
        </Link>
      </div>
    </nav>
  );
}