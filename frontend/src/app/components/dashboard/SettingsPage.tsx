import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  HelpCircle,
  ChevronRight,
  Mail,
  Smartphone,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Check,
  LogOut,
  Loader2,
  BellOff,
  AlertTriangle,
} from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { useNotifications } from "../../../hooks/useNotifications";

// ─── Design tokens ─────────────────────────────
const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 12px rgba(108,71,255,0.08)",
};

// ─── Toggle Switch ─────────────────────────────
function Toggle({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onToggle}
      className="relative w-11 h-6 rounded-full border-none transition-all"
      style={{
        backgroundColor: disabled ? "rgba(26,26,46,0.07)" : on ? "#6C47FF" : "rgba(26,26,46,0.12)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
        style={{
          left: on ? 22 : 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}
      />
    </button>
  );
}

// ─── Section Card ──────────────────────────────
function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1" style={cardStyle}>
      <div
        className="px-6 py-4"
        style={{ borderBottom: "1px solid rgba(108,71,255,0.06)" }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>{title}</h3>
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

// ─── Setting Row ───────────────────────────────
function SettingRow({
  icon: Icon,
  label,
  description,
  children,
  noBorder,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  children?: React.ReactNode;
  noBorder?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-6 py-4"
      style={{
        borderBottom: noBorder ? "none" : "1px solid rgba(108,71,255,0.04)",
      }}
    >
      <div className="flex items-center gap-3.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "#F7F6FF" }}
        >
          <Icon size={17} color="#6C47FF" />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>{label}</p>
          {description && (
            <p style={{ fontSize: 12, color: "rgba(26,26,46,0.4)", marginTop: 2 }}>
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Nav setting row (clickable) ───────────────
function NavRow({
  icon: Icon,
  label,
  value,
  noBorder,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  noBorder?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-6 py-4 cursor-pointer transition-colors hover:bg-[#FAFAFF]"
      style={{
        borderBottom: noBorder ? "none" : "1px solid rgba(108,71,255,0.04)",
      }}
    >
      <div className="flex items-center gap-3.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "#F7F6FF" }}
        >
          <Icon size={17} color="#6C47FF" />
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>{label}</p>
      </div>
      <div className="flex items-center gap-2">
        {value && (
          <span style={{ fontSize: 13, color: "rgba(26,26,46,0.4)" }}>{value}</span>
        )}
        <ChevronRight size={16} color="rgba(26,26,46,0.25)" />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────
// ─── Push notification status badge ────────────
function PushStatusBadge({ status }: { status: ReturnType<typeof useNotifications>["status"] }) {
  if (status === "active") {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full"
        style={{ fontSize: 11, fontWeight: 600, color: "#22C55E", backgroundColor: "rgba(34,197,94,0.08)" }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#22C55E" }} />
        Active
      </span>
    );
  }
  if (status === "denied") {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full"
        style={{ fontSize: 11, fontWeight: 600, color: "#EF4444", backgroundColor: "rgba(239,68,68,0.08)" }}>
        <AlertTriangle size={10} />
        Blocked
      </span>
    );
  }
  if (status === "unsupported") {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full"
        style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", backgroundColor: "rgba(156,163,175,0.08)" }}>
        <BellOff size={10} />
        Not supported
      </span>
    );
  }
  return null;
}

export function SettingsPage() {
  const {
    enabled: pushNotifications,
    status: pushStatus,
    isLoading: pushLoading,
    permissionDenied,
    unsupported,
    enable: enablePush,
    disable: disablePush,
  } = useNotifications();

  const [emailDigest, setEmailDigest] = useState(true);
  const [spendAlerts, setSpendAlerts] = useState(true);
  const [goalReminders, setGoalReminders] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#F7F6FF" }}
    >
      <DashboardSidebar activePage="Settings" />

      <main className="flex-1 ml-16 p-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#1A1A2E",
                letterSpacing: "-0.02em",
              }}
            >
              Settings
            </h1>
            <p style={{ fontSize: 14, color: "rgba(26,26,46,0.45)", marginTop: 4 }}>
              Manage your account and preferences.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90 border-none"
            style={{
              backgroundColor: saved ? "#22C55E" : "#6C47FF",
              fontSize: 14,
              fontWeight: 600,
              boxShadow: saved
                ? "0 4px 20px rgba(34,197,94,0.25)"
                : "0 4px 20px rgba(108,71,255,0.25)",
            }}
          >
            {saved ? <Check size={16} /> : null}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* ── Profile ──────────────────── */}
          <SettingSection title="Profile">
            <NavRow icon={User} label="Full Name" value="Swayam" />
            <NavRow icon={Mail} label="Email" value="swayam@clutch.app" />
            <NavRow icon={Smartphone} label="Phone" value="+91 98765 43210" />
            <NavRow icon={CreditCard} label="Monthly Income" value="₹45,000" noBorder />
          </SettingSection>

          {/* ── Notifications ────────────── */}
          <SettingSection title="Notifications">
            <SettingRow
              icon={Bell}
              label="Push Notifications"
              description={
                permissionDenied
                  ? "Blocked in browser — open Site Settings to allow"
                  : unsupported
                    ? "Not supported in this browser"
                    : "Get budget alerts and spend nudges on this device"
              }
            >
              <div className="flex items-center gap-2.5">
                <PushStatusBadge status={pushStatus} />
                {pushLoading ? (
                  <div className="w-11 h-6 flex items-center justify-center">
                    <Loader2 size={15} color="#6C47FF" className="animate-spin" />
                  </div>
                ) : (
                  <Toggle
                    on={pushNotifications}
                    onToggle={pushNotifications ? disablePush : enablePush}
                    disabled={unsupported || permissionDenied}
                  />
                )}
              </div>
            </SettingRow>
            <SettingRow
              icon={Mail}
              label="Weekly Email Digest"
              description="Summary of your week's spending"
            >
              <Toggle on={emailDigest} onToggle={() => setEmailDigest(!emailDigest)} />
            </SettingRow>
            <SettingRow
              icon={CreditCard}
              label="Spend Alerts"
              description="Notify when a category exceeds 80%"
            >
              <Toggle on={spendAlerts} onToggle={() => setSpendAlerts(!spendAlerts)} />
            </SettingRow>
            <SettingRow
              icon={Globe}
              label="Goal Reminders"
              description="Daily nudge to save towards goals"
              noBorder
            >
              <Toggle on={goalReminders} onToggle={() => setGoalReminders(!goalReminders)} />
            </SettingRow>
          </SettingSection>

          {/* ── Security ─────────────────── */}
          <SettingSection title="Security">
            <SettingRow
              icon={Lock}
              label="Two-Factor Authentication"
              description="Extra layer of account security"
            >
              <Toggle on={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} />
            </SettingRow>
            <SettingRow
              icon={Eye}
              label="Biometric Login"
              description="Use fingerprint or face to sign in"
              noBorder
            >
              <Toggle on={biometric} onToggle={() => setBiometric(!biometric)} />
            </SettingRow>
          </SettingSection>

          {/* ── Preferences ──────────────── */}
          <SettingSection title="Preferences">
            <NavRow icon={Globe} label="Currency" value="₹ INR" />
            <NavRow icon={Palette} label="Appearance" value="Light" />
            <NavRow icon={HelpCircle} label="Help & Support" noBorder />
          </SettingSection>

          {/* ── Danger Zone ──────────────── */}
          <div className="flex items-center justify-between px-6 py-4" style={cardStyle}>
            <div className="flex items-center gap-3.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(239,68,68,0.06)" }}
              >
                <LogOut size={17} color="#EF4444" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#EF4444" }}>Sign Out</p>
            </div>
            <ChevronRight size={16} color="rgba(239,68,68,0.4)" />
          </div>

          <p
            className="text-center pb-4"
            style={{ fontSize: 12, color: "rgba(26,26,46,0.25)" }}
          >
            Clutch v1.0.0 · Made with purpose
          </p>
        </div>
      </main>
    </div>
  );
}
