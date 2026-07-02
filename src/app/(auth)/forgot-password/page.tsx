"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import AuthCard from "@/components/auth/AuthCard";
import FormInput from "@/components/auth/FormInput";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reset email");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <AuthCard>
        {success ? (
          <div className="text-center">
            <p className="text-sm text-white/70">
              If an account exists for <strong>{email}</strong>, you&apos;ll
              receive a password reset link shortly.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-1 text-sm text-purple-300 hover:text-purple-200"
            >
              <ArrowLeft size={14} />
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              Send Reset Link
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-1 text-xs text-white/50 hover:text-white/70"
            >
              <ArrowLeft size={12} />
              Back to login
            </Link>
          </form>
        )}
      </AuthCard>
    </AuthShell>
  );
}
