"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileForm, { type ProfileFormData } from "./ProfileForm";
import BrandProfileForm from "./brand/BrandProfileForm";
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
          ...p,
          skills: fp.skills,
          categories: fp.categories,
          hourlyRate: fp.hourlyRate,
          availability: fp.availability,
          experience: fp.experience,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(data: any) {
    const { skills, categories, hourlyRate, availability, experience, _id, createdAt, updatedAt, __v, ...profileData } = data;
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...profileData,
        profileComplete: true,
        freelancerProfile:
          role === "freelancer"
            ? {
                skills: skills ?? [],
                categories: categories ?? [],
                hourlyRate,
                availability,
                experience,
              }
            : undefined,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    const saved = await res.json();
    const p = saved.profile ?? {};
    const fp = saved.freelancerProfile ?? {};
    setInitial({
      ...p,
      skills: fp.skills,
      categories: fp.categories,
      hourlyRate: fp.hourlyRate,
      availability: fp.availability,
      experience: fp.experience,
    });
    router.refresh();
  }

  if (loading) return <div className="text-white/50">Loading profile...</div>;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your public profile and preferences" />
      {role === "brand" ? (
        <BrandProfileForm initial={initial} onSubmit={handleSubmit} />
      ) : (
        <ProfileForm role={role} initial={initial} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
