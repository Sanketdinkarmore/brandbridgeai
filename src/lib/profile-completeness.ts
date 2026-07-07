import type { IProfile } from "@/models/Profile";

const BRAND_FIELDS: (keyof IProfile)[] = [
  "companyName",
  "logo",
  "bio",
  "industry",
  "location",
  "website",
  "targetAudience",
  "budgetRange",
  "collaborationLookingFor",
  "businessType",
];

export interface ProfileCompletenessResult {
  percent: number;
  missing: string[];
}

const FIELD_LABELS: Partial<Record<keyof IProfile, string>> = {
  companyName: "Add company name",
  logo: "Upload brand logo",
  bio: "Add brand description",
  industry: "Set your industry",
  location: "Add location",
  website: "Add website URL",
  targetAudience: "Define target audience",
  budgetRange: "Set budget range",
  collaborationLookingFor: "Add collaboration preferences",
  businessType: "Set business type",
};

export function calculateProfileCompleteness(
  profile: Partial<IProfile> | null,
  role: string,
  freelancerMeta?: { skills?: string[]; categories?: string[]; hourlyRate?: number; portfolioCount?: number },
): ProfileCompletenessResult {
  if (!profile) {
    return {
      percent: 0,
      missing: ["Complete your profile to get started"],
    };
  }

  if (role === "freelancer") {
    const checks: { label: string; done: boolean }[] = [
      { label: "Add profile photo", done: !!profile.avatar },
      { label: "Write a bio", done: !!profile.bio },
      { label: "Set your location", done: !!profile.location },
      { label: "Add at least one skill", done: (freelancerMeta?.skills?.length ?? 0) > 0 },
      { label: "Choose a category", done: (freelancerMeta?.categories?.length ?? 0) > 0 },
      { label: "Set hourly rate", done: freelancerMeta?.hourlyRate != null && freelancerMeta.hourlyRate > 0 },
      { label: "Upload portfolio work", done: (freelancerMeta?.portfolioCount ?? 0) > 0 },
    ];
    const missing = checks.filter((c) => !c.done).map((c) => c.label);
    const filled = checks.filter((c) => c.done).length;
    return { percent: Math.round((filled / checks.length) * 100), missing };
  }

  const fields: (keyof IProfile)[] =
    role === "brand"
      ? BRAND_FIELDS
      : (["companyName", "bio", "industry", "targetAudience"] as (keyof IProfile)[]);

  const missing: string[] = [];
  let filled = 0;

  for (const field of fields) {
    const val = profile[field as keyof IProfile];
    if (val != null && val !== "") {
      filled++;
    } else {
      missing.push(FIELD_LABELS[field] ?? `Add ${String(field)}`);
    }
  }

  const percent = Math.round((filled / fields.length) * 100);
  return { percent, missing };
}
