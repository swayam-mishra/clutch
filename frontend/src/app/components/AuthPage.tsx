import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../lib/authStore";
import type { AuthUser } from "../../lib/api";

function HealthScoreCard() {
  return (
    <div className="relative mt-12 flex justify-center">
      {/* Glow */}
      <div
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: "#fff", top: "50%", transform: "translateY(-50%)" }}
      />
      <div
        className="relative rounded-2xl p-6 flex flex-col items-center gap-4"
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 20,
          width: 240,
        }}
      >
        {/* Ring */}
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke="#22C55E" strokeWidth="8"
              strokeLinecap="round" strokeDasharray={`${84 * 2.639} ${100 * 2.639}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span style={{ fontSize: 32, fontWeight: 700, color: "#fff" }}>84</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: "rgba(34,197,94,0.2)", color: "#22C55E", fontSize: 12, fontWeight: 600 }}
          >
            Excellent
          </span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Finance Health Score</span>
        </div>
      </div>
    </div>
  );
}

function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthenticated } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch<{ user: AuthUser; token: string; refresh_token: string }>(
        "/api/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) }
      );

      await supabase.auth.setSession({ access_token: data.token, refresh_token: data.refresh_token });
      setAuthenticated(data.user);
      navigate("/dashboard");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleLogin}>
      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label style={{ fontSize: 14, fontWeight: 500, color: "#1A1A2E" }}>Email</label>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.1)" }}
        >
          <Mail size={18} color="#6C47FF" opacity={0.5} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 15, color: "#1A1A2E" }}
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label style={{ fontSize: 14, fontWeight: 500, color: "#1A1A2E" }}>Password</label>
          <a href="#" style={{ fontSize: 13, fontWeight: 500, color: "#6C47FF" }} className="hover:underline">
            Forgot password?
          </a>
        </div>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.1)" }}
        >
          <Lock size={18} color="#6C47FF" opacity={0.5} />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 15, color: "#1A1A2E" }}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="cursor-pointer p-0.5"
            style={{ background: "none", border: "none" }}
          >
            {showPassword ? <EyeOff size={18} color="#1A1A2E" opacity={0.4} /> : <Eye size={18} color="#1A1A2E" opacity={0.4} />}
          </button>
        </div>
      </div>

      {/* Sign In button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90 mt-1"
        style={{ backgroundColor: "#6C47FF", fontSize: 15, fontWeight: 600, boxShadow: "0 4px 20px rgba(108,71,255,0.3)", border: "none" }}
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-1">
        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(108,71,255,0.1)" }} />
        <span style={{ fontSize: 13, color: "#1A1A2E", opacity: 0.4 }}>or continue with</span>
        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(108,71,255,0.1)" }} />
      </div>

      {/* Google button */}
      <button
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl cursor-pointer transition-all hover:bg-[#F7F6FF]"
        style={{ backgroundColor: "#fff", border: "1px solid rgba(108,71,255,0.12)", fontSize: 15, fontWeight: 500, color: "#1A1A2E" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Google
      </button>
    </form>
  );
}

function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthenticated } = useAuthStore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch<{ user: AuthUser; session: { access_token: string; refresh_token: string } }>(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            password,
            monthlyIncome: Number(monthlyIncome.replace(/,/g, "")),
          }),
        }
      );

      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      setAuthenticated(data.user);
      navigate("/dashboard");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleRegister}>
      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <label style={{ fontSize: 14, fontWeight: 500, color: "#1A1A2E" }}>Full Name</label>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.1)" }}
        >
          <User size={18} color="#6C47FF" opacity={0.5} />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 15, color: "#1A1A2E" }}
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label style={{ fontSize: 14, fontWeight: 500, color: "#1A1A2E" }}>Email</label>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.1)" }}
        >
          <Mail size={18} color="#6C47FF" opacity={0.5} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 15, color: "#1A1A2E" }}
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label style={{ fontSize: 14, fontWeight: 500, color: "#1A1A2E" }}>Password</label>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.1)" }}
        >
          <Lock size={18} color="#6C47FF" opacity={0.5} />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 15, color: "#1A1A2E" }}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="cursor-pointer p-0.5"
            style={{ background: "none", border: "none" }}
          >
            {showPassword ? <EyeOff size={18} color="#1A1A2E" opacity={0.4} /> : <Eye size={18} color="#1A1A2E" opacity={0.4} />}
          </button>
        </div>
      </div>

      {/* Monthly Income */}
      <div className="flex flex-col gap-1.5">
        <label style={{ fontSize: 14, fontWeight: 500, color: "#1A1A2E" }}>Monthly Income</label>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ backgroundColor: "#F7F6FF", border: "1px solid rgba(108,71,255,0.1)" }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: "#6C47FF", opacity: 0.6 }}>₹</span>
          <input
            type="text"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            placeholder="50,000"
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 15, color: "#1A1A2E" }}
            required
          />
        </div>
      </div>

      {/* Create Account button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90 mt-1"
        style={{ backgroundColor: "#6C47FF", fontSize: 15, fontWeight: 600, boxShadow: "0 4px 20px rgba(108,71,255,0.3)", border: "none" }}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      {/* Terms */}
      <p className="text-center" style={{ fontSize: 12, color: "#1A1A2E", opacity: 0.4, lineHeight: 1.6 }}>
        By signing up, you agree to our{" "}
        <a href="#" style={{ color: "#6C47FF", fontWeight: 500 }} className="hover:underline">Terms</a>{" "}
        &{" "}
        <a href="#" style={{ color: "#6C47FF", fontWeight: 500 }} className="hover:underline">Privacy Policy</a>.
      </p>
    </form>
  );
}

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12" style={{ backgroundColor: "#6C47FF" }}>
        <div>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}
            >
              <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>C</span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Clutch</span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2
            style={{ fontSize: 40, fontWeight: 700, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.02em", maxWidth: 420 }}
          >
            Don't just track money.{" "}
            <span style={{ opacity: 0.7 }}>Understand it.</span>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 380, lineHeight: 1.7 }}>
            Join thousands of people who use Clutch to stay ahead of their finances with AI-powered insights.
          </p>
          <HealthScoreCard />
        </div>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>© 2026 Clutch. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ backgroundColor: "#fff" }}>
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#6C47FF" }}>
              <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>C</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#1A1A2E" }}>Clutch</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mb-10" style={{ borderBottom: "2px solid rgba(108,71,255,0.08)" }}>
            {[
              { key: "signin" as const, label: "Sign In" },
              { key: "signup" as const, label: "Create Account" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="pb-3 px-1 mr-8 cursor-pointer transition-all relative"
                style={{
                  fontSize: 16,
                  fontWeight: activeTab === tab.key ? 600 : 500,
                  color: activeTab === tab.key ? "#6C47FF" : "rgba(26,26,46,0.4)",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab.key ? "2px solid #6C47FF" : "2px solid transparent",
                  marginBottom: -2,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Welcome text */}
          <div className="mb-8">
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1A1A2E", lineHeight: 1.3 }}>
              {activeTab === "signin" ? "Welcome back" : "Get started"}
            </h1>
            <p style={{ fontSize: 15, color: "#1A1A2E", opacity: 0.5, marginTop: 6 }}>
              {activeTab === "signin" ? "Sign in to your Clutch account" : "Create your free Clutch account"}
            </p>
          </div>

          {/* Form */}
          {activeTab === "signin" ? <SignInForm /> : <SignUpForm />}
        </div>
      </div>
    </div>
  );
}
