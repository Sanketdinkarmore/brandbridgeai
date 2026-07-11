import { z } from "zod";

const roleEnum = z.enum(["brand", "product_owner", "freelancer", "hirer"]);

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  role: roleEnum,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  role: roleEnum,
  rememberMe: z.boolean().optional(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export const roleSchema = z.object({
  role: z.enum(["brand", "product_owner", "freelancer", "hirer"]),
});

const socialLinksSchema = z.object({
  linkedin: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
}).optional();

export const profileSchema = z.object({
  companyName: z.string().min(1).optional(),
  bio: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  socialLinks: socialLinksSchema,
  targetAudience: z.string().optional(),
  marketingBudget: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : (Number.isNaN(Number(val)) ? undefined : Number(val))),
    z.number().min(0).optional(),
  ),
  hiringPreferences: z.string().optional(),
  avatar: z.string().optional(),
  logo: z.string().optional(),
  profileComplete: z.boolean().optional(),
  
  // New Brand Profile Fields
  companySize: z.string().optional(),
  foundedYear: z.preprocess((val) => (val === "" || val === null || val === undefined ? undefined : (Number.isNaN(Number(val)) ? undefined : Number(val))), z.number().optional()),
  businessType: z.string().optional(),
  isRegisteredBusiness: z.boolean().optional(),
  businessRegistrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  subCategory: z.string().optional(),
  targetAgeGroups: z.array(z.string()).optional(),
  targetGender: z.string().optional(),
  primaryMarket: z.string().optional(),
  socialMediaReach: z.object({
    instagram: z.preprocess((val) => (val === "" || val === null || val === undefined ? undefined : (Number.isNaN(Number(val)) ? undefined : Number(val))), z.number().optional()),
    youtube: z.preprocess((val) => (val === "" || val === null || val === undefined ? undefined : (Number.isNaN(Number(val)) ? undefined : Number(val))), z.number().optional()),
    facebook: z.preprocess((val) => (val === "" || val === null || val === undefined ? undefined : (Number.isNaN(Number(val)) ? undefined : Number(val))), z.number().optional()),
    tiktok: z.preprocess((val) => (val === "" || val === null || val === undefined ? undefined : (Number.isNaN(Number(val)) ? undefined : Number(val))), z.number().optional()),
  }).optional(),
  collaborationLookingFor: z.array(z.string()).optional(),
  preferredCollaborationType: z.string().optional(),
  budgetRange: z.string().optional(),
  availabilityStatus: z.string().optional(),

  // New Hirer Profile Fields
  accountType: z.string().optional(),
  projectBudgetRange: z.string().optional(),
  preferredCategories: z.array(z.string()).optional(),
  paymentVerified: z.boolean().optional(),
  totalProjectsPosted: z.number().optional(),
  hireSuccessRate: z.number().optional(),
  avgRatingGiven: z.number().optional(),
});

export const freelancerProfileSchema = z.object({
  skills: z.array(z.string()).optional().default([]),
  categories: z.array(z.string()).optional().default([]),
  hourlyRate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : (Number.isNaN(Number(val)) ? undefined : Number(val))),
    z.number().min(0).optional(),
  ),
  availability: z.string().optional(),
  experience: z.string().optional(),
});

export const portfolioItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  mediaUrl: z.string().min(1, "Media URL is required"),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  images: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
});

export const collaborationSchema = z.object({
  partnerId: z.string().min(1),
  message: z.string().optional(),
  proposal: z.string().optional(),
  emailDraft: z.string().optional(),
  compatibilityScore: z.number().optional(),
});

export const collaborationUpdateSchema = z.object({
  status: z.enum(["pending", "accepted", "declined"]),
});

export const campaignSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "completed", "cancelled", "paused"]).optional(),
  participants: z.array(z.string()).optional(),
  budget: z.number().min(0).optional(),
  collaborationId: z.string().optional(),
  productId: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  goal: z.string().optional(),
  freelancerId: z.string().optional(),
  spent: z.number().min(0).optional(),
  stats: z.object({
    reach: z.number().optional(),
    engagement: z.number().optional(),
    clicks: z.number().optional(),
  }).optional(),
  assets: z.array(z.string()).optional(),
});

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  budgetType: z.enum(["fixed", "hourly"]),
  budgetAmount: z.number().min(0, "Budget must be a positive number"),
  deadline: z.string().or(z.date()),
  requiredSkills: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
  status: z.enum(["open", "in_progress", "completed", "closed"]).optional(),
});

export const hireSchema = z.object({
  freelancerId: z.string().min(1),
  campaignId: z.string().optional(),
  projectId: z.string().optional(),
  rate: z.number().min(0).optional(),
  notes: z.string().optional(),
  endDate: z.string().or(z.date()).optional(),
});

export const hireUpdateSchema = z.object({
  status: z.enum(["pending", "active", "completed", "cancelled"]).optional(),
  rate: z.number().min(0).optional(),
  notes: z.string().optional(),
  endDate: z.string().or(z.date()).optional(),
  declineReason: z.string().optional(),
  deliverables: z.array(z.object({
    fileUrl: z.string(),
    name: z.string(),
  })).optional(),
});

export const proposalSchema = z.object({
  campaignId: z.string().min(1),
  message: z.string().optional(),
  rate: z.number().min(0).optional(),
});

export const proposalUpdateSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected", "withdrawn"]),
});

export const messageSchema = z.object({
  conversationId: z.string().optional(),
  recipientId: z.string().optional(),
  text: z.string().min(1, "Message is required"),
  attachments: z.array(z.string()).optional(),
});

export const settingsSchema = z.object({
  name: z.string().min(2).optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .optional(),
  emailNotifications: z.boolean().optional(),
});

export const aiMatchSchema = z.object({
  limit: z.number().min(1).max(20).optional(),
});

export const aiProposalSchema = z.object({
  partnerId: z.string().min(1),
});

export const reviewSchema = z.object({
  hireId: z.string().min(1),
  freelancerId: z.string().min(1),
  rating: z.number().min(1).max(5),
  text: z.string().optional(),
});
