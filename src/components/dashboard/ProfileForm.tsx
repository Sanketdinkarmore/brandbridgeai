"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import type { UserRole } from "@/lib/roles";

const FREELANCER_CATEGORIES = [
  "Graphic Design", "Video Editing", "Animation", "Content Writing",
  "Photography", "Social Media", "Motion Design", "UI Design", "Development",
];

const INDUSTRIES = [
  "Fashion", "Technology", "Food & Beverage", "Health & Wellness",
  "Sports", "Beauty", "Finance", "Education", "Entertainment", "Other",
];

export interface ProfileFormData {
  companyName?: string;
  bio?: string;
  industry?: string;
  location?: string;
  website?: string;
  targetAudience?: string;
  marketingBudget?: number;
  hiringPreferences?: string;
  avatar?: string;
  logo?: string;
  skills?: string[];
  categories?: string[];
  hourlyRate?: number;
  availability?: string;
  experience?: string;
  
  // Hirer Fields
  accountType?: string;
  projectBudgetRange?: string;
  preferredCategories?: string[];
  paymentVerified?: boolean;
  totalProjectsPosted?: number;
  hireSuccessRate?: number;
  avgRatingGiven?: number;
}

const EMPTY_INITIAL: ProfileFormData = {};

interface ProfileFormProps {
  role: UserRole;
  initial?: ProfileFormData;
  onSubmit: (data: ProfileFormData & { profileComplete?: boolean }) => Promise<void>;
  submitLabel?: string;
}

export default function ProfileForm({
  role,
  initial,
  onSubmit,
  submitLabel = "Save Profile",
}: ProfileFormProps) {
  const [form, setForm] = useState<ProfileFormData>(initial ?? EMPTY_INITIAL);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function update(field: keyof ProfileFormData, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, field: "avatar" | "logo") {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      if (data.url) {
        update(field, data.url);
        setSuccess(`${field === "avatar" ? "Avatar" : "Logo"} uploaded — click Save to keep it`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await onSubmit({ ...form, profileComplete: true });
      setSuccess("Profile saved successfully");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function toggleArray(field: "skills" | "categories" | "preferredCategories", value: string) {
    const arr = form[field] ?? [];
    update(field, arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(form.avatar || form.logo) && (
        <div className="bb-glass flex items-center gap-5 rounded-2xl p-5">
          {form.avatar && (
            <div className="text-center">
              <img
                src={form.avatar}
                alt="Avatar"
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-purple-500/30"
              />
              <p className="mt-1.5 text-[10px] text-white/40">Avatar</p>
            </div>
          )}
          {form.logo && (
            <div className="text-center">
              <img
                src={form.logo}
                alt="Logo"
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-purple-500/30"
              />
              <p className="mt-1.5 text-[10px] text-white/40">Logo</p>
            </div>
          )}
        </div>
      )}

      <div className="bb-glass rounded-2xl p-6 space-y-4">
        <h2 className="bb-display text-lg font-medium">Basic Information</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {role === "hirer" && (
            <div>
              <label className="mb-1.5 block text-xs text-white/50">Account Type</label>
              <select
                className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                value={form.accountType ?? "individual"}
                onChange={(e) => update("accountType", e.target.value)}
              >
                <option value="individual">Individual</option>
                <option value="business">Business</option>
              </select>
            </div>
          )}

          {(role === "brand" || role === "product_owner" || role === "hirer") && (
            <div>
              <label className="mb-1.5 block text-xs text-white/50">
                {role === "hirer" && form.accountType === "business" ? "Company Name" : role === "hirer" ? "Name" : "Company Name"}
              </label>
              <input
                className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                value={form.companyName ?? ""}
                onChange={(e) => update("companyName", e.target.value)}
                required
              />
            </div>
          )}
          
          {(role === "brand" || role === "product_owner" || role === "freelancer") && (
            <div>
              <label className="mb-1.5 block text-xs text-white/50">Location</label>
              <input
                className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                value={form.location ?? ""}
                onChange={(e) => update("location", e.target.value)}
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-white/50">Bio</label>
          <textarea
            className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
            rows={3}
            value={form.bio ?? ""}
            onChange={(e) => update("bio", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Industry</label>
            <select
              className="bb-input w-full rounded-xl px-4 py-2.5 text-sm "
              value={form.industry ?? ""}
              onChange={(e) => update("industry", e.target.value)}
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Website</label>
            <input
              className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
              value={form.website ?? ""}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://"
            />
          </div>
        </div>

        {(role === "brand" || role === "product_owner") && (
          <>
            <div>
              <label className="mb-1.5 block text-xs text-white/50">Target Audience</label>
              <textarea
                className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                rows={2}
                value={form.targetAudience ?? ""}
                onChange={(e) => update("targetAudience", e.target.value)}
              />
            </div>
            {role === "brand" && (
              <div>
                <label className="mb-1.5 block text-xs text-white/50">Marketing Budget ($)</label>
                <input
                  type="number"
                  className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                  value={form.marketingBudget ?? ""}
                  onChange={(e) => update("marketingBudget", Number(e.target.value))}
                />
              </div>
            )}
          </>
        )}

        {role === "hirer" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-white/50">Typical Project Budget Range</label>
              <select
                className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                value={form.projectBudgetRange ?? ""}
                onChange={(e) => update("projectBudgetRange", e.target.value)}
              >
                <option value="">Select range</option>
                <option value="under_500">Under $500</option>
                <option value="500_2k">$500 - $2,000</option>
                <option value="2k_10k">$2,000 - $10,000</option>
                <option value="10k_50k">$10,000 - $50,000</option>
                <option value="50k_plus">$50,000+</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex cursor-pointer items-center gap-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={form.paymentVerified ?? false}
                    onChange={(e) => update("paymentVerified", e.target.checked)}
                  />
                  <div className="block h-6 w-10 rounded-full bg-white/10 peer-checked:bg-purple-500 transition"></div>
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4"></div>
                </div>
                <div className="text-sm font-medium text-white/90">
                  Payment Method Verified
                  <p className="text-[10px] font-normal text-white/40">Shows a trust badge to freelancers</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {role === "hirer" && (
          <div>
            <label className="mb-2 block text-xs text-white/50">Preferred Freelancer Categories</label>
            <div className="flex flex-wrap gap-2">
              {FREELANCER_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleArray("preferredCategories", cat)}
                  className={`rounded-full px-3 py-1 text-xs transition ${(form.preferredCategories ?? []).includes(cat) ? "bg-purple-500/25 text-purple-200" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {role === "hirer" && (
          <div className="mt-6 border-t border-white/10 pt-6">
            <h3 className="mb-4 text-sm font-medium text-white">Hiring History Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <p className="text-xs text-white/50 mb-1">Total Projects</p>
                <p className="text-xl font-semibold text-white">{form.totalProjectsPosted ?? 0}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <p className="text-xs text-white/50 mb-1">Hire Success Rate</p>
                <p className="text-xl font-semibold text-white">{form.hireSuccessRate ?? 0}%</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <p className="text-xs text-white/50 mb-1">Avg Rating Given</p>
                <p className="text-xl font-semibold text-white">{form.avgRatingGiven ? form.avgRatingGiven.toFixed(1) : "N/A"}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs text-white/60 hover:bg-white/5">
            <Upload size={14} />
            {uploading ? "Uploading..." : "Avatar"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "avatar")} />
          </label>
          {(role === "brand" || role === "product_owner" || role === "hirer") && (
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs text-white/60 hover:bg-white/5">
              <Upload size={14} />
              Logo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "logo")} />
            </label>
          )}
        </div>
      </div>



      {role === "freelancer" && (
        <div className="bb-glass rounded-2xl p-6 space-y-4">
          <h2 className="bb-display text-lg font-medium">Freelancer Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-white/50">Hourly Rate ($)</label>
              <input
                type="number"
                className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                value={form.hourlyRate ?? ""}
                onChange={(e) => update("hourlyRate", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/50">Availability</label>
              <select
                className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                value={form.availability ?? ""}
                onChange={(e) => update("availability", e.target.value)}
              >
                <option value="">Select</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="project-based">Project-based</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Experience</label>
            <textarea
              className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
              rows={2}
              value={form.experience ?? ""}
              onChange={(e) => update("experience", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs text-white/50">Categories</label>
            <div className="flex flex-wrap gap-2">
              {FREELANCER_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleArray("categories", cat)}
                  className={`rounded-full px-3 py-1 text-xs transition ${(form.categories ?? []).includes(cat) ? "bg-purple-500/25 text-purple-200" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs text-white/50">Skills</label>
            <input
              className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
              placeholder="Type skill and press Enter"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) {
                    toggleArray("skills", val);
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {(form.skills ?? []).map((s) => (
                <span key={s} className="rounded-full bg-purple-500/15 px-2 py-0.5 text-xs text-purple-200">
                  {s}
                  <button type="button" onClick={() => toggleArray("skills", s)} className="ml-1 text-white/40">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-400">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bb-btn-primary flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}
