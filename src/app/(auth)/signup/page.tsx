"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import AuthCard from "@/components/auth/AuthCard";
import GoogleButton from "@/components/auth/GoogleButton";
import FormInput from "@/components/auth/FormInput";
import RoleSelector from "@/components/auth/RoleSelector";
import PasswordStrength from "@/components/auth/PasswordStrength";
import type { UserRole } from "@/lib/roles";

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setRoleError("");

    if (!role) {
      setRoleError("Please select your role");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the terms and conditions");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email: email.toLowerCase().trim(),
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push(`/verify-otp?email=${encodeURIComponent(email.toLowerCase().trim())}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Choose your role and join the marketplace"
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

        <GoogleButton role={role} mode="signup" />

        <div className="bb-divider">or continue with email</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordStrength password={password} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="mt-1 flex items-center gap-1 text-xs text-white/40 hover:text-white/60"
            >
              {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
              {showPassword ? "Hide" : "Show"} password
            </button>
          </div>

          <FormInput
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <label className="flex items-start gap-2 text-xs text-white/60">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 rounded border-white/20"
            />
            I agree to the{" "}
            <Link href="#" className="text-purple-300 hover:text-purple-200">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-purple-300 hover:text-purple-200">
              Privacy Policy
            </Link>
          </label>

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
            Create Account
          </button>
        </form>

        <p className="text-center text-xs text-white/50">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-300 hover:text-purple-200">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
