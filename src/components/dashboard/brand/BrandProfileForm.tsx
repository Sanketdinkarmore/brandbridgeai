"use client";

import { useState, useEffect } from "react";
import { Loader2, Upload, User, Target, Handshake, ShieldCheck, CheckCircle2, ChevronDown, Camera, Tv, Users, Smartphone, Globe } from "lucide-react";
import type { ProfileFormData } from "@/components/dashboard/ProfileForm";

const INDUSTRIES_CONFIG: Record<string, string[]> = {
  "Fashion & Apparel": ["Clothing", "Shoes", "Accessories", "Jewelry", "Activewear"],
  "Beauty & Personal Care": ["Skincare", "Haircare", "Makeup", "Fragrance", "Wellness"],
  "Health & Fitness": ["Supplements", "Fitness Equipment", "Gym", "Nutrition"],
  "Food & Beverage": ["Snacks", "Drinks", "Alcohol", "Restaurant", "Groceries"],
  "Technology & Electronics": ["Software", "Hardware", "Gadgets", "Apps"],
  "Automotive": ["Vehicle Sales", "Auto Parts", "Service & Repair", "EV", "Auto Detailing"],
  "Home & Lifestyle": ["Furniture", "Decor", "Appliances", "Cleaning"],
  "Education": ["Courses", "Tutoring", "Books", "School"],
  "Finance": ["Banking", "Investing", "Crypto", "Insurance"],
  "Travel & Hospitality": ["Hotels", "Flights", "Tours", "Booking"],
  "Entertainment": ["Movies", "Music", "Gaming", "Events"],
  "Other": ["Other"],
};

const COMPANY_SIZES = ["Solo/Freelancer", "2–10", "11–50", "51–200", "200+"];
const BUSINESS_TYPES = ["Manufacturer", "Retailer", "Service Provider", "D2C Brand", "Reseller/Dealer", "Agency"];
const TARGET_AGE_GROUPS = ["13–17", "18–24", "25–34", "35–44", "45–54", "55+"];
const TARGET_GENDERS = ["All", "Male-leaning", "Female-leaning", "Non-binary inclusive"];
const PRIMARY_MARKETS = ["Local", "Regional", "National", "International"];
const LOOKING_FOR = ["Brand Collaboration", "Product Promotion", "Freelancer Hiring", "Influencer Marketing", "Co-branded Campaign"];
const COLLAB_TYPES = ["Barter", "Paid Partnership", "Revenue Share", "Sponsorship", "Open to Discuss"];
const BUDGET_RANGES = ["Under $1K", "$1K–$5K", "$5K–$20K", "$20K–$50K", "$50K+"];
const AVAILABILITY_STATUSES = ["Actively looking", "Open to offers", "Not currently available"];

const CORE_FIELDS = ["companyName", "bio", "industry", "logo", "website", "budgetRange", "businessType"];

export interface BrandProfileFormData extends ProfileFormData {
  companySize?: string;
  foundedYear?: number;
  businessType?: string;
  isRegisteredBusiness?: boolean;
  businessRegistrationNumber?: string;
  taxId?: string;
  subCategory?: string;
  targetAgeGroups?: string[];
  targetGender?: string;
  primaryMarket?: string;
  socialMediaReach?: {
    instagram?: number;
    youtube?: number;
    facebook?: number;
    tiktok?: number;
  };
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    github?: string;
  };
  collaborationLookingFor?: string[];
  preferredCollaborationType?: string;
  budgetRange?: string;
  availabilityStatus?: string;
}

interface BrandProfileFormProps {
  initial?: BrandProfileFormData;
  onSubmit: (data: BrandProfileFormData) => Promise<void>;
}

export default function BrandProfileForm({ initial, onSubmit }: BrandProfileFormProps) {
  const [form, setForm] = useState<BrandProfileFormData>(initial ?? {});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [isDirty, setIsDirty] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (initial) {
      setForm(initial);
      setIsDirty(false);
    }
  }, [initial]);

  const update = (field: keyof BrandProfileFormData, value: any) => {
    setForm((f) => {
      const newForm = { ...f, [field]: value };
      if (field === "industry" && f.industry !== value) {
        newForm.subCategory = "";
      }
      return newForm;
    });
    setIsDirty(true);
  };

  const updateNested = (parent: "socialMediaReach" | "socialLinks", field: string, value: any) => {
    setForm((f) => ({
      ...f,
      [parent]: {
        ...(f[parent] as any),
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  const toggleArray = (field: "targetAgeGroups" | "collaborationLookingFor", value: string) => {
    const arr = form[field] ?? [];
    update(field, arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, field: "avatar" | "logo") {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      if (data.url) update(field, data.url);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      setIsDirty(false);
      setToastMessage("Profile saved successfully");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  let filledFields = 0;
  let missingFields: string[] = [];
  CORE_FIELDS.forEach((f) => {
    if (form[f as keyof BrandProfileFormData]) {
      filledFields++;
    } else {
      missingFields.push(f);
    }
  });
  const completenessPercent = Math.round((filledFields / CORE_FIELDS.length) * 100);

  const formatFieldName = (name: string) => {
    const map: Record<string, string> = {
      companyName: "Company Name",
      bio: "Bio",
      industry: "Industry",
      logo: "Logo",
      website: "Website",
      budgetRange: "Budget Range",
      businessType: "Business Type",
    };
    return map[name] || name;
  };

  return (
    <div className="relative pb-24">
      {/* Completeness Bar */}
      <div className="bb-glass mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl p-4">
        <div className="w-full sm:w-1/3">
          <div className="mb-2 flex items-center justify-between text-sm font-medium">
            <span>Profile Completeness</span>
            <span className="text-purple-300">{completenessPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
              style={{ width: `\${completenessPercent}%` }}
            />
          </div>
        </div>
        <div className="flex-1">
          {missingFields.length > 0 ? (
            <div className="text-xs text-white/50">
              <span className="mr-2">Missing:</span>
              {missingFields.slice(0, 3).map((f) => (
                <span key={f} className="mr-2 rounded-full bg-white/5 px-2 py-1 text-white/70">
                  {formatFieldName(f)}
                </span>
              ))}
              {missingFields.length > 3 && <span>+{missingFields.length - 3} more</span>}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle2 size={16} /> Profile 100% complete!
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Form Content */}
        <div className="flex-1">
          {/* Desktop Tabs */}
          <div className="hidden sm:flex border-b border-white/10 mb-6 overflow-x-auto no-scrollbar">
            {[
              { id: "basic", label: "Basic Info", icon: User },
              { id: "industry", label: "Industry & Audience", icon: Target },
              { id: "collab", label: "Collaboration Prefs", icon: Handshake },
              { id: "verification", label: "Verification & Social", icon: ShieldCheck },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors border-b-2 \${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-300"
                    : "border-transparent text-white/50 hover:text-white/80"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            
            {/* SECTION 1: Basic Info */}
            <div className={`bb-glass rounded-2xl overflow-hidden transition-all duration-300 \${activeTab === 'basic' ? 'block' : 'hidden sm:hidden'}`}>
              <div className="sm:hidden bg-white/5 px-6 py-4 border-b border-white/5 cursor-pointer" onClick={() => setActiveTab('basic')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-base font-medium">
                    <User size={16} className="text-purple-400" /> Basic Info
                  </div>
                  <ChevronDown size={16} className={`transition-transform \${activeTab === 'basic' ? 'rotate-180' : ''}`} />
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4 pb-4 border-b border-white/5">
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-1 h-20 w-20 rounded-2xl border border-dashed border-white/20 bg-white/5 text-[10px] text-white/60 hover:bg-white/10 transition overflow-hidden">
                    {form.logo ? <img src={form.logo} alt="Logo" className="w-full h-full object-cover" /> : <><Upload size={14} /> Logo</>}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "logo")} />
                  </label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-1 h-20 w-20 rounded-2xl border border-dashed border-white/20 bg-white/5 text-[10px] text-white/60 hover:bg-white/10 transition overflow-hidden">
                    {form.avatar ? <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <><Upload size={14} /> Avatar</>}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "avatar")} />
                  </label>
                  <div className="flex-1 text-xs text-white/40 pt-2">
                    Upload a square company logo and a personal avatar.
                    {uploading && <div className="mt-1 flex items-center gap-1 text-purple-300"><Loader2 size={12} className="animate-spin" /> Uploading...</div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Company Name *</label>
                    <input className="bb-input w-full rounded-xl px-4 py-2.5 text-sm" value={form.companyName ?? ""} onChange={(e) => update("companyName", e.target.value)} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Location</label>
                    <input className="bb-input w-full rounded-xl px-4 py-2.5 text-sm" value={form.location ?? ""} onChange={(e) => update("location", e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs text-white/50">Bio / Company Description</label>
                    <textarea className="bb-input w-full rounded-xl px-4 py-2.5 text-sm" rows={3} value={form.bio ?? ""} onChange={(e) => update("bio", e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Company Size</label>
                    <div className="relative">
                      <select className="bb-input w-full rounded-xl px-4 py-2.5 text-sm appearance-none" value={form.companySize ?? ""} onChange={(e) => update("companySize", e.target.value)}>
                        <option value="">Select size</option>
                        {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-3 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Founded Year</label>
                    <input type="number" min="1900" max="2026" className="bb-input w-full rounded-xl px-4 py-2.5 text-sm" value={form.foundedYear ?? ""} onChange={(e) => update("foundedYear", parseInt(e.target.value) || undefined)} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Business Type</label>
                    <div className="relative">
                      <select className="bb-input w-full rounded-xl px-4 py-2.5 text-sm appearance-none" value={form.businessType ?? ""} onChange={(e) => update("businessType", e.target.value)}>
                        <option value="">Select type</option>
                        {BUSINESS_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-3 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-white/80 flex-1">Registered Business?</label>
                    <button
                      type="button"
                      onClick={() => update("isRegisteredBusiness", !form.isRegisteredBusiness)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors \${form.isRegisteredBusiness ? "bg-purple-500" : "bg-white/10"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${form.isRegisteredBusiness ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Industry & Audience */}
            <div className={`bb-glass rounded-2xl overflow-hidden transition-all duration-300 \${activeTab === 'industry' ? 'block' : 'hidden sm:hidden'}`}>
              <div className="sm:hidden bg-white/5 px-6 py-4 border-b border-white/5 cursor-pointer" onClick={() => setActiveTab('industry')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-base font-medium">
                    <Target size={16} className="text-purple-400" /> Industry & Audience
                  </div>
                  <ChevronDown size={16} className={`transition-transform \${activeTab === 'industry' ? 'rotate-180' : ''}`} />
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Primary Industry</label>
                    <div className="relative">
                      <select className="bb-input w-full rounded-xl px-4 py-2.5 text-sm appearance-none" value={form.industry ?? ""} onChange={(e) => update("industry", e.target.value)}>
                        <option value="">Select industry</option>
                        {Object.keys(INDUSTRIES_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-3 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Sub-category</label>
                    <div className="relative">
                      <select disabled={!form.industry} className="bb-input w-full rounded-xl px-4 py-2.5 text-sm appearance-none disabled:opacity-50" value={form.subCategory ?? ""} onChange={(e) => update("subCategory", e.target.value)}>
                        <option value="">Select sub-category</option>
                        {(form.industry && INDUSTRIES_CONFIG[form.industry] ? INDUSTRIES_CONFIG[form.industry] : []).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-3 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs text-white/50">Target Age Group</label>
                    <div className="flex flex-wrap gap-2">
                      {TARGET_AGE_GROUPS.map((age) => (
                        <button
                          key={age}
                          type="button"
                          onClick={() => toggleArray("targetAgeGroups", age)}
                          className={`rounded-full px-3 py-1.5 text-xs transition \${(form.targetAgeGroups ?? []).includes(age) ? "bg-purple-500/25 text-purple-200 border border-purple-500/50" : "bg-white/5 text-white/50 border border-transparent hover:bg-white/10"}`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Target Gender</label>
                    <div className="relative">
                      <select className="bb-input w-full rounded-xl px-4 py-2.5 text-sm appearance-none" value={form.targetGender ?? ""} onChange={(e) => update("targetGender", e.target.value)}>
                        <option value="">Select gender focus</option>
                        {TARGET_GENDERS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-3 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Primary Market</label>
                    <div className="relative">
                      <select className="bb-input w-full rounded-xl px-4 py-2.5 text-sm appearance-none" value={form.primaryMarket ?? ""} onChange={(e) => update("primaryMarket", e.target.value)}>
                        <option value="">Select market</option>
                        {PRIMARY_MARKETS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-3 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs text-white/50">Audience Description</label>
                    <textarea className="bb-input w-full rounded-xl px-4 py-2.5 text-sm" rows={2} value={form.targetAudience ?? ""} onChange={(e) => update("targetAudience", e.target.value)} placeholder="Describe your ideal customer..." />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <label className="mb-3 block text-sm font-medium text-white/80">Social Media Reach (Optional)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-white/50 mb-1.5"><Camera size={12}/> Instagram</div>
                      <input type="number" className="bb-input w-full rounded-lg px-3 py-2 text-sm" placeholder="Followers" value={form.socialMediaReach?.instagram ?? ""} onChange={(e) => updateNested("socialMediaReach", "instagram", parseInt(e.target.value) || undefined)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-white/50 mb-1.5"><Tv size={12}/> YouTube</div>
                      <input type="number" className="bb-input w-full rounded-lg px-3 py-2 text-sm" placeholder="Subscribers" value={form.socialMediaReach?.youtube ?? ""} onChange={(e) => updateNested("socialMediaReach", "youtube", parseInt(e.target.value) || undefined)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-white/50 mb-1.5"><Users size={12}/> Facebook</div>
                      <input type="number" className="bb-input w-full rounded-lg px-3 py-2 text-sm" placeholder="Followers" value={form.socialMediaReach?.facebook ?? ""} onChange={(e) => updateNested("socialMediaReach", "facebook", parseInt(e.target.value) || undefined)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-white/50 mb-1.5"><Smartphone size={12}/> TikTok</div>
                      <input type="number" className="bb-input w-full rounded-lg px-3 py-2 text-sm" placeholder="Followers" value={form.socialMediaReach?.tiktok ?? ""} onChange={(e) => updateNested("socialMediaReach", "tiktok", parseInt(e.target.value) || undefined)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Collaboration Preferences */}
            <div className={`bb-glass rounded-2xl overflow-hidden transition-all duration-300 \${activeTab === 'collab' ? 'block' : 'hidden sm:hidden'}`}>
              <div className="sm:hidden bg-white/5 px-6 py-4 border-b border-white/5 cursor-pointer" onClick={() => setActiveTab('collab')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-base font-medium">
                    <Handshake size={16} className="text-purple-400" /> Collaboration Preferences
                  </div>
                  <ChevronDown size={16} className={`transition-transform \${activeTab === 'collab' ? 'rotate-180' : ''}`} />
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="mb-1.5 block text-xs text-white/50">Looking For</label>
                  <div className="flex flex-wrap gap-2">
                    {LOOKING_FOR.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleArray("collaborationLookingFor", item)}
                        className={`rounded-full px-3 py-1.5 text-xs transition \${(form.collaborationLookingFor ?? []).includes(item) ? "bg-purple-500/25 text-purple-200 border border-purple-500/50" : "bg-white/5 text-white/50 border border-transparent hover:bg-white/10"}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Preferred Collaboration Type</label>
                    <div className="relative">
                      <select className="bb-input w-full rounded-xl px-4 py-2.5 text-sm appearance-none" value={form.preferredCollaborationType ?? ""} onChange={(e) => update("preferredCollaborationType", e.target.value)}>
                        <option value="">Select type</option>
                        {COLLAB_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-3 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Budget Range</label>
                    <div className="relative">
                      <select className="bb-input w-full rounded-xl px-4 py-2.5 text-sm appearance-none" value={form.budgetRange ?? ""} onChange={(e) => update("budgetRange", e.target.value)}>
                        <option value="">Select budget range</option>
                        {BUDGET_RANGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-3 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs text-white/50">Availability Status</label>
                    <div className="relative">
                      <select className="bb-input w-full rounded-xl px-4 py-2.5 text-sm appearance-none" value={form.availabilityStatus ?? ""} onChange={(e) => update("availabilityStatus", e.target.value)}>
                        <option value="">Select status</option>
                        {AVAILABILITY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-3 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: Verification & Social Proof */}
            <div className={`bb-glass rounded-2xl overflow-hidden transition-all duration-300 \${activeTab === 'verification' ? 'block' : 'hidden sm:hidden'}`}>
              <div className="sm:hidden bg-white/5 px-6 py-4 border-b border-white/5 cursor-pointer" onClick={() => setActiveTab('verification')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-base font-medium">
                    <ShieldCheck size={16} className="text-purple-400" /> Verification & Social
                  </div>
                  <ChevronDown size={16} className={`transition-transform \${activeTab === 'verification' ? 'rotate-180' : ''}`} />
                </div>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-xs text-white/50 italic mb-2">Verified info helps your profile rank higher in AI matching and builds trust with other brands.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Business Registration Number (Optional)</label>
                    <input className="bb-input w-full rounded-xl px-4 py-2.5 text-sm" value={form.businessRegistrationNumber ?? ""} onChange={(e) => update("businessRegistrationNumber", e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">GST / Tax ID (Optional)</label>
                    <input className="bb-input w-full rounded-xl px-4 py-2.5 text-sm" value={form.taxId ?? ""} onChange={(e) => update("taxId", e.target.value)} />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <h3 className="text-sm font-medium text-white/80">Web & Social Links</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-white/40"><Globe size={16} /></div>
                      <input className="bb-input w-full rounded-xl pl-10 pr-4 py-2.5 text-sm" placeholder="Website URL" value={form.website ?? ""} onChange={(e) => update("website", e.target.value)} />
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-white/40"><Camera size={16} /></div>
                      <input className="bb-input w-full rounded-xl pl-10 pr-4 py-2.5 text-sm" placeholder="Instagram Profile" value={form.socialLinks?.instagram ?? ""} onChange={(e) => updateNested("socialLinks", "instagram", e.target.value)} />
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-white/40 text-xs font-bold pt-0.5">LI</div>
                      <input className="bb-input w-full rounded-xl pl-10 pr-4 py-2.5 text-sm" placeholder="LinkedIn Company Page" value={form.socialLinks?.linkedin ?? ""} onChange={(e) => updateNested("socialLinks", "linkedin", e.target.value)} />
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-white/40"><Users size={16} /></div>
                      <input className="bb-input w-full rounded-xl pl-10 pr-4 py-2.5 text-sm" placeholder="Facebook Page" value={form.socialLinks?.facebook ?? ""} onChange={(e) => updateNested("socialLinks", "facebook", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Live Preview Column */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24">
            <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">Live Preview</h3>
            <div className="bb-glass bb-card-interactive rounded-2xl p-5 border border-white/5 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-500/20">
                  {form.logo ? (
                    <img src={form.logo} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-semibold text-purple-200">
                      {form.companyName ? form.companyName.charAt(0) : "?"}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="bb-display font-medium text-white line-clamp-1">{form.companyName || "Your Brand Name"}</h3>
                  <p className="text-xs text-purple-300 line-clamp-1">{form.industry || "Industry"}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-white/60">
                  <span className={`h-1.5 w-1.5 rounded-full \${form.availabilityStatus === 'Actively looking' ? 'bg-green-400' : form.availabilityStatus === 'Open to offers' ? 'bg-yellow-400' : 'bg-gray-400'}`}></span>
                  {form.availabilityStatus || "Open to offers"}
                </div>
                {form.businessType && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-white/60 border border-white/5">
                    {form.businessType}
                  </div>
                )}
              </div>
              <p className="mt-3 text-xs text-white/50 line-clamp-3 leading-relaxed">
                {form.bio || "Add a bio to see how it looks to potential partners. This gives them a quick overview of what you do."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Save Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-white/10 bg-[#0a0a0a]/90 px-6 py-4 backdrop-blur-md transition-transform duration-300 \${isDirty ? "translate-y-0" : "translate-y-full"} md:pl-[17rem]`}>
        <div className="text-sm text-white/70 hidden sm:block">You have unsaved changes.</div>
        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-4">
          <button onClick={() => { setForm(initial ?? {}); setIsDirty(false); }} className="text-sm text-white/50 hover:text-white transition flex-1 sm:flex-none">
            Discard
          </button>
          <button
            onClick={() => handleSubmit()}
            disabled={loading}
            className="bb-btn-primary flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium flex-1 sm:flex-none shadow-lg shadow-purple-500/20"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 rounded-xl bg-green-500/20 border border-green-500/30 px-4 py-3 text-sm text-green-200 shadow-lg animate-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
