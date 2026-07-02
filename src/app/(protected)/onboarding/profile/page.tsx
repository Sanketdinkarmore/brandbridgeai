"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import ProfileForm, { type ProfileFormData } from "@/components/dashboard/ProfileForm";
import { ROLE_LABELS, getDashboardPath, type UserRole } from "@/lib/roles";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.role) setRole(d.user.role);
        else router.replace("/signup");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSubmit(data: ProfileFormData & { profileComplete?: boolean }) {
    const { skills, categories, hourlyRate, availability, experience, ...profileData } = data;
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...profileData,
        profileComplete: true,
        freelancerProfile:
          role === "freelancer"
            ? { skills, categories, hourlyRate, availability, experience }
            : undefined,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    router.replace(getDashboardPath(role!));
  }

  if (loading || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#8b5cf6,#4f8cff)" }}>
          <Sparkles size={22} className="text-white" />
        </div>
        <h1 className="bb-display text-2xl font-semibold">Complete Your Profile</h1>
        <p className="mt-2 text-sm text-white/55">
          Set up your {ROLE_LABELS[role]} profile to start using BrandBridge AI
        </p>
      </div>
      <ProfileForm role={role} onSubmit={handleSubmit} submitLabel="Complete Setup" />
    </div>
  );
}
