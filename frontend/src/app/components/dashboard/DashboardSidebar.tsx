import { useState } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Lightbulb,
  Target,
  Trophy,
  Settings,
  Users,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useSplits } from "../../../hooks/useSplits";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Receipt, label: "Expenses", path: "/dashboard/expenses" },
  { icon: PiggyBank, label: "Budget", path: "/dashboard/budget" },
  { icon: Lightbulb, label: "Insights", path: "/dashboard/insights" },
  { icon: Target, label: "Goals", path: "/dashboard/goals" },
  { icon: Trophy, label: "Challenges", path: "/dashboard/challenges" },
  { icon: Users, label: "Splits", path: "/dashboard/splits" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

interface DashboardSidebarProps {
  activePage?: string;
}

export function DashboardSidebar({ activePage = "Dashboard" }: DashboardSidebarProps) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { pendingCount } = useSplits();

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col justify-between py-5 z-50 transition-all duration-300"
      style={{
        width: expanded ? 220 : 64,
        backgroundColor: "#fff",
        borderRight: "1px solid rgba(108,71,255,0.06)",
      }}
    >
      {/* Top */}
      <div className="flex flex-col gap-2">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 mb-4 overflow-hidden">
          <div
            className="min-w-9 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
            style={{ backgroundColor: "#6C47FF" }}
            onClick={() => navigate("/dashboard")}
          >
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>C</span>
          </div>
          {expanded && (
            <span
              className="whitespace-nowrap cursor-pointer"
              style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.01em" }}
              onClick={() => navigate("/dashboard")}
            >
              Clutch
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = item.label === activePage;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl cursor-pointer transition-all overflow-hidden border-none"
                style={{
                  backgroundColor: isActive ? "#EDE9FF" : "transparent",
                  color: isActive ? "#6C47FF" : "rgba(26,26,46,0.5)",
                }}
                title={!expanded ? item.label : undefined}
              >
                <div className="relative shrink-0">
                  <item.icon size={20} />
                  {item.label === "Splits" && pendingCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full"
                      style={{
                        minWidth: 16,
                        height: 16,
                        backgroundColor: "#6C47FF",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "0 3px",
                      }}
                    >
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                </div>
                {expanded && (
                  <span
                    className="whitespace-nowrap"
                    style={{ fontSize: 14, fontWeight: isActive ? 600 : 500 }}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-3 px-2">
        {/* Expand/collapse toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center w-8 h-8 rounded-lg mx-auto cursor-pointer border-none transition-all"
          style={{
            backgroundColor: "#F7F6FF",
            color: "#6C47FF",
          }}
        >
          {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl overflow-hidden" style={{ backgroundColor: "#F7F6FF" }}>
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1615724320397-9d4db10ec2a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGluZGlhbiUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MzAwODA5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Swayam"
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
          {expanded && (
            <div className="flex flex-col overflow-hidden">
              <span
                className="whitespace-nowrap truncate"
                style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E" }}
              >
                Swayam
              </span>
              <span
                className="whitespace-nowrap truncate"
                style={{ fontSize: 11, color: "rgba(26,26,46,0.4)" }}
              >
                Free Plan
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
