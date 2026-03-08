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
} from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";

// ─── Design tokens ─────────────────────────────
const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 12px rgba(108,71,255,0.08)",
};

// ─── Toggle Switch ─────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-11 h-6 rounded-full cursor-pointer border-none transition-all"
      style={{ backgroundColor: on ? "#6C47FF" : "rgba(26,26,46,0.12)" }}
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
export function SettingsPage() {
  const [pushNotifications, setPushNotifications] = useState(true);
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
              description="Get alerts on your device"
            >
              <Toggle on={pushNotifications} onToggle={() => setPushNotifications(!pushNotifications)} />
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
