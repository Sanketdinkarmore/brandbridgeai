"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileForm, { type ProfileFormData } from "./ProfileForm";
import PageHeader from "./PageHeader";
import type { UserRole } from "@/lib/roles";
import { getDashboardPath } from "@/lib/roles";

interface ProfilePageProps {
  role: UserRole;
}

export default function ProfilePage({ role }: ProfilePageProps) {
  const router = useRouter();
  const [initial, setInitial] = useState<ProfileFormData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        const p = d.profile ?? {};
        const fp = d.freelancerProfile ?? {};
        setInitial({
          companyName: p.companyName,
          bio: p.bio,
          industry: p.industry,
          location: p.location,
          website: p.website,
          targetAudience: p.targetAudience,
          marketingBudget: p.marketingBudget,
          hiringPreferences: p.hiringPreferences,
          avatar: p.avatar,
          logo: p.logo,
          skills: fp.skills,
          categories: fp.categories,
          hourlyRate: fp.hourlyRate,
          availability: fp.availability,
          experience: fp.experience,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(data: ProfileFormData & { profileComplete?: boolean }) {
    const { skills, categories, hourlyRate, availability, experience, ...profileData } = data;
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...profileData,
        profileComplete: true,
        freelancerProfile: role === "freelancer" ? { skills, categories, hourlyRate, availability, experience } : undefined,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    router.refresh();
  }

  if (loading) return <div className="text-white/50">Loading profile...</div>;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your public profile and preferences" />
      <ProfileForm role={role} initial={initial} onSubmit={handleSubmit} />
    </div>
  );
}
