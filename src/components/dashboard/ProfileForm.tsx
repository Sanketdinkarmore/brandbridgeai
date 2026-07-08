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

  function toggleArray(field: "skills" | "categories", value: string) {
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
          {(role === "brand" || role === "product_owner" || role === "hirer") && (
            <div>
              <label className="mb-1.5 block text-xs text-white/50">Company Name</label>
              <input
                className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                value={form.companyName ?? ""}
                onChange={(e) => update("companyName", e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Location</label>
            <input
              className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
              value={form.location ?? ""}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>
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
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Hiring Preferences</label>
            <textarea
              className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
              rows={2}
              value={form.hiringPreferences ?? ""}
              onChange={(e) => update("hiringPreferences", e.target.value)}
            />
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

      {(role === "brand" || role === "product_owner" || role === "hirer") && (
        <div className="bb-glass rounded-2xl p-6 space-y-4">
          <h2 className="bb-display text-lg font-medium">Enterprise & Verification</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-white/50">GST Identification Number (GSTIN)</label>
              <input
                className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                placeholder="27AAAPB1904H1Z4"
                defaultValue="27AAAPB1904H1Z4"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/50">Permanent Account Number (PAN)</label>
              <input
                className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                placeholder="AAPCB1289H"
                defaultValue="AAPCB1289H"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-white/5 pt-4">
            <div>
              <span className="block text-xs text-white/40 mb-1">Company Trust Reputation</span>
              <span className="text-sm font-bold text-green-400">96% Verified Score</span>
            </div>
            <div>
              <span className="block text-xs text-white/40 mb-1">Achievements & Verified Badges</span>
              <span className="inline-block text-[10px] bg-purple-500/15 text-purple-300 font-semibold px-2 py-0.5 rounded mr-2">Top Partner</span>
              <span className="inline-block text-[10px] bg-blue-500/15 text-blue-300 font-semibold px-2 py-0.5 rounded">Fast Responder</span>
            </div>
          </div>
        </div>
      )}

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
