import { generateText } from "@/lib/gemini";

export interface BrandProfileData {
  companyName?: string;
  industry?: string;
  targetAudience?: string;
  marketingBudget?: number;
  bio?: string;
  location?: string;
}

export interface MatchResult {
  brandId: string;
  companyName: string;
  industry?: string;
  compatibilityScore: number;
  audienceMatch: string;
  campaignSuggestions: string[];
  marketingStrategy: string;
  suggestedFreelancerCategories: string[];
  estimatedReach: string;
}

function fallbackMatch(
  brandId: string,
  companyName: string,
  industry?: string,
  score = 72,
): MatchResult {
  return {
    brandId,
    companyName: companyName || "Unknown Brand",
    industry,
    compatibilityScore: score,
    audienceMatch: "Moderate overlap in target demographics based on industry alignment.",
    campaignSuggestions: [
      "Co-branded social media campaign",
      "Joint product bundle promotion",
      "Cross-platform content collaboration",
    ],
    marketingStrategy: "Focus on shared audience segments with complementary brand values.",
    suggestedFreelancerCategories: ["Content Writers", "Social Media Managers", "Graphic Designers"],
    estimatedReach: "50K–150K combined audience",
  };
}

export async function analyzeBrandCompatibility(
  currentBrand: BrandProfileData,
  targetBrand: BrandProfileData & { brandId: string },
): Promise<MatchResult> {
  const prompt = `You are a B2B brand collaboration analyst. Analyze compatibility between two brands.

Brand A (current user):
- Company: ${currentBrand.companyName || "N/A"}
- Industry: ${currentBrand.industry || "N/A"}
- Target Audience: ${currentBrand.targetAudience || "N/A"}
- Budget: ${currentBrand.marketingBudget || "N/A"}
- Bio: ${currentBrand.bio || "N/A"}

Brand B (potential partner):
- Company: ${targetBrand.companyName || "N/A"}
- Industry: ${targetBrand.industry || "N/A"}
- Target Audience: ${targetBrand.targetAudience || "N/A"}
- Budget: ${targetBrand.marketingBudget || "N/A"}
- Bio: ${targetBrand.bio || "N/A"}

Respond in JSON only with this exact structure:
{
  "compatibilityScore": <number 0-100>,
  "audienceMatch": "<1-2 sentence summary>",
  "campaignSuggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"],
  "marketingStrategy": "<2-3 sentence strategy>",
  "suggestedFreelancerCategories": ["<category1>", "<category2>"],
  "estimatedReach": "<estimated combined reach>"
}`;

  try {
    const text = await generateText(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      brandId: targetBrand.brandId,
      companyName: targetBrand.companyName || "Unknown",
      industry: targetBrand.industry,
      compatibilityScore: parsed.compatibilityScore ?? 70,
      audienceMatch: parsed.audienceMatch ?? "",
      campaignSuggestions: parsed.campaignSuggestions ?? [],
      marketingStrategy: parsed.marketingStrategy ?? "",
      suggestedFreelancerCategories: parsed.suggestedFreelancerCategories ?? [],
      estimatedReach: parsed.estimatedReach ?? "",
    };
  } catch {
    return fallbackMatch(
      targetBrand.brandId,
      targetBrand.companyName || "Unknown",
      targetBrand.industry,
    );
  }
}

export async function rankBrandsForProduct(
  product: { name: string; description?: string; category?: string; targetAudience?: string },
  brands: (BrandProfileData & { brandId: string })[],
): Promise<MatchResult[]> {
  const results: MatchResult[] = [];
  for (const brand of brands.slice(0, 10)) {
    const prompt = `Rate how well this brand would promote this product (0-100 score).

Product: ${product.name}
Description: ${product.description || "N/A"}
Category: ${product.category || "N/A"}
Target Audience: ${product.targetAudience || "N/A"}

Brand: ${brand.companyName}
Industry: ${brand.industry || "N/A"}
Audience: ${brand.targetAudience || "N/A"}

Respond JSON only: {"compatibilityScore":<number>,"audienceMatch":"<text>","campaignSuggestions":["<s1>"],"marketingStrategy":"<text>","suggestedFreelancerCategories":["<c>"],"estimatedReach":"<text>"}`;

    try {
      const text = await generateText(prompt);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      results.push({
        brandId: brand.brandId,
        companyName: brand.companyName || "Unknown",
        industry: brand.industry,
        compatibilityScore: parsed.compatibilityScore ?? 65,
        audienceMatch: parsed.audienceMatch ?? "",
        campaignSuggestions: parsed.campaignSuggestions ?? [],
        marketingStrategy: parsed.marketingStrategy ?? "",
        suggestedFreelancerCategories: parsed.suggestedFreelancerCategories ?? [],
        estimatedReach: parsed.estimatedReach ?? "",
      });
    } catch {
      results.push(fallbackMatch(brand.brandId, brand.companyName || "Unknown", brand.industry, 65));
    }
  }
  return results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}
