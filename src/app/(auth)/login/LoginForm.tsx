"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import AuthCard from "@/components/auth/AuthCard";
import GoogleButton from "@/components/auth/GoogleButton";
import FormInput from "@/components/auth/FormInput";
import RoleSelector from "@/components/auth/RoleSelector";
import type { UserRole } from "@/lib/roles";
import { ROLE_LABELS } from "@/lib/roles";
import { redirectAfterAuth } from "@/lib/auth-client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const expectedRole = searchParams.get("expected");
  const redirect = searchParams.get("redirect");

  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [error, setError] = useState(() => {
    if (oauthError === "role_mismatch" && expectedRole) {
      return `This account is registered as ${ROLE_LABELS[expectedRole as UserRole] || expectedRole}. Please select the correct role.`;
    }
    if (oauthError === "oauth_not_configured") {
      return "Google sign-in is not configured. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local.";
    }
    if (oauthError) return "Google sign-in failed. Please try again.";
    return "";
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setRoleError("");

    if (!role) {
      setRoleError("Please select your role");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
          rememberMe,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsVerification) {
          router.push(
            `/verify-otp?email=${encodeURIComponent(data.email.toLowerCase())}`,
          );
          return;
        }
        setError(data.error || "Login failed");
        return;
      }

      redirectAfterAuth(
        data.redirect || redirect || `/dashboard/${role}`,
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Select your role and sign in to your dashboard"
    >
      <AuthCard>
        <RoleSelector
          value={role}
          onChange={(r) => {
            setRole(r);
            setRoleError("");
          }}
          error={roleError}
        />

        <GoogleButton role={role} mode="login" />

        <div className="bb-divider">or continue with email</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <FormInput
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="mt-1 flex items-center gap-1 text-xs text-white/40 hover:text-white/60"
            >
              {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
              {showPassword ? "Hide" : "Show"} password
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-purple-300 hover:text-purple-200"
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bb-btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Sign In
          </button>
        </form>

        <p className="text-center text-xs text-white/50">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-purple-300 hover:text-purple-200">
            Sign up
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
