import { z } from "zod";

export const productOwnerProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  collaborationGoals: z.string().optional(),
  marketingBudget: z.preprocess(
    (val) =>
      val === "" || val === null || (typeof val === "number" && Number.isNaN(val))
        ? undefined
        : val,
    z.number().min(0).optional(),
  ),
});

export const productOwnerCollaborationSchema = z.object({
  partnerId: z.string().min(1, "Partner is required"),
  productId: z.string().optional(),
  message: z.string().optional(),
  proposal: z.string().optional(),
  compatibilityScore: z.number().optional(),
});

export const productOwnerCollaborationUpdateSchema = z.object({
  status: z.enum(["pending", "accepted", "declined"]),
});
