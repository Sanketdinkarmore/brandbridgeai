"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import AuthCard from "@/components/auth/AuthCard";
import OTPInput from "@/components/auth/OTPInput";
import { redirectAfterAuth } from "@/lib/auth-client";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        return;
      }

      redirectAfterAuth(data.redirect || "/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendTimer > 0) return;
    setResending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend OTP");
        return;
      }

      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
    } catch {
      setError("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  }

  if (!email) {
    return (
      <AuthShell title="Verify your email" subtitle="Email address is required">
        <p className="text-center text-sm text-white/55">
          <Link href="/signup" className="text-purple-300 hover:text-purple-200">
            Go back to sign up
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${email}`}
    >
      <AuthCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          <OTPInput value={otp} onChange={setOtp} error={error} />

          <button
            type="submit"
            disabled={loading}
            className="bb-btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Verify Email
          </button>
        </form>

        <p className="text-center text-xs text-white/50">
          Didn&apos;t receive the code?{" "}
          {resendTimer > 0 ? (
            <span>Resend in {resendTimer}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-purple-300 hover:text-purple-200"
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          )}
        </p>
      </AuthCard>
    </AuthShell>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
