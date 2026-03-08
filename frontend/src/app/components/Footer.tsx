import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

const navLinks = ["Features", "Pricing", "About"];

export function Footer() {
  return (
    <footer className="py-16" style={{ backgroundColor: "#1A1A2E" }}>
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#6C47FF" }}
            >
              <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>
                C
              </span>
            </div>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.01em",
              }}
            >
              Clutch
            </span>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="transition-colors hover:text-white"
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* CTA */}
          <Link
            to="/auth"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white no-underline cursor-pointer transition-all hover:opacity-90"
            style={{
              backgroundColor: "#6C47FF",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Start for free
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Divider */}
        <div
          className="h-px w-full mb-8"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            © 2026 Clutch. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                className="transition-colors hover:text-white"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}