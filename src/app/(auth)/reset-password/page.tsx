"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import AuthCard from "@/components/auth/AuthCard";
import FormInput from "@/components/auth/FormInput";
import PasswordStrength from "@/components/auth/PasswordStrength";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        return;
      }

      router.push("/login?reset=success");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthShell title="Invalid link" subtitle="This reset link is invalid or expired">
        <p className="text-center text-sm text-white/55">
          <Link href="/forgot-password" className="text-purple-300 hover:text-purple-200">
            Request a new reset link
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set new password"
      subtitle="Choose a strong password for your account"
    >
      <AuthCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <FormInput
              label="New Password"
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
            Reset Password
          </button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1 text-xs text-white/50 hover:text-white/70"
          >
            <ArrowLeft size={12} />
            Back to login
          </Link>
        </form>
      </AuthCard>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
