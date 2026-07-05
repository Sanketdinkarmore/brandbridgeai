import { generateText, isGeminiAvailable, isGeminiConfigured } from "@/lib/gemini";

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

/** Local scoring — no Gemini API calls (safe for dashboard load) */
export function heuristicBrandMatch(
  currentBrand: BrandProfileData,
  targetBrand: BrandProfileData & { brandId: string },
): MatchResult {
  let score = 52;

  if (currentBrand.industry && targetBrand.industry) {
    const a = currentBrand.industry.toLowerCase();
    const b = targetBrand.industry.toLowerCase();
    if (a === b) score += 28;
    else if (a.includes(b) || b.includes(a)) score += 18;
  }

  if (currentBrand.targetAudience && targetBrand.targetAudience) {
    const wordsA = new Set(
      currentBrand.targetAudience.toLowerCase().split(/\W+/).filter((w) => w.length > 3),
    );
    const overlap = targetBrand.targetAudience
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3 && wordsA.has(w)).length;
    score += Math.min(overlap * 6, 18);
  }

  if (currentBrand.marketingBudget && targetBrand.marketingBudget) {
    const ratio =
      Math.min(currentBrand.marketingBudget, targetBrand.marketingBudget) /
      Math.max(currentBrand.marketingBudget, targetBrand.marketingBudget);
    if (ratio > 0.5) score += 8;
  }

  score = Math.min(Math.max(score, 45), 94);

  const result = fallbackMatch(
    targetBrand.brandId,
    targetBrand.companyName || "Unknown",
    targetBrand.industry,
    score,
  );

  if (currentBrand.industry && targetBrand.industry && currentBrand.industry === targetBrand.industry) {
    result.audienceMatch = `Strong alignment — both brands operate in ${targetBrand.industry}.`;
  }

  return result;
}

export async function analyzeBrandCompatibility(
  currentBrand: BrandProfileData,
  targetBrand: BrandProfileData & { brandId: string },
  options?: { useAi?: boolean },
): Promise<MatchResult> {
  const useAi = options?.useAi ?? true;

  if (!useAi || !isGeminiAvailable()) {
    return heuristicBrandMatch(currentBrand, targetBrand);
  }

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
    if (!text) return heuristicBrandMatch(currentBrand, targetBrand);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return heuristicBrandMatch(currentBrand, targetBrand);
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
    return heuristicBrandMatch(currentBrand, targetBrand);
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
      if (!text) {
        results.push(fallbackMatch(brand.brandId, brand.companyName || "Unknown", brand.industry, 65));
        continue;
      }
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

export interface ExternalBrandRecommendation {
  companyName: string;
  industry: string;
  reason: string;
  estimatedReach: string;
  isExternal: true;
  source?: "ai" | "curated";
}

export type ExternalBrandDiscoveryResult = {
  recommendations: ExternalBrandRecommendation[];
  source: "ai" | "curated" | "none";
  quotaBlocked: boolean;
};

function normalizeExternalRec(
  rec: Partial<ExternalBrandRecommendation>,
  source: "ai" | "curated" = "ai",
): ExternalBrandRecommendation | null {
  const companyName = String(rec.companyName ?? "").trim();
  if (!companyName) return null;

  return {
    companyName,
    industry: String(rec.industry ?? "General").trim(),
    reason: String(rec.reason ?? "Strong alignment for a co-marketing partnership.").trim(),
    estimatedReach: String(rec.estimatedReach ?? "Audience TBD").trim(),
    isExternal: true,
    source,
  };
}

/** Profile-tailored real brands when Gemini is unavailable or rate-limited */
function getCuratedExternalBrands(
  currentBrand: BrandProfileData,
): ExternalBrandRecommendation[] {
  const industry = (currentBrand.industry || "").toLowerCase();
  const location = (currentBrand.location || "").toLowerCase();
  const audience = currentBrand.targetAudience || "your target customers";
  const company = currentBrand.companyName || "your brand";
  const inIndia =
    location.includes("india") ||
    location.includes("mumbai") ||
    location.includes("delhi") ||
    location.includes("bangalore") ||
    location.includes("bengaluru") ||
    location.includes("hyderabad") ||
    location.includes("chennai") ||
    location.includes("kolkata") ||
    location.includes("pune");

  type PoolEntry = Omit<ExternalBrandRecommendation, "source">;
  const withSource = (entries: PoolEntry[]) =>
    entries.map((e) => ({ ...e, source: "curated" as const }));

  const pools: Record<string, PoolEntry[]> = {
    fashion: [
      {
        companyName: "Myntra",
        industry: "Fashion E-commerce",
        reason: `${company} and Myntra share fashion-conscious ${audience} — ideal for co-branded style guides or seasonal lookbooks.`,
        estimatedReach: "50M+ app users in India",
        isExternal: true,
      },
      {
        companyName: "FabIndia",
        industry: "Ethnic & Lifestyle Retail",
        reason: `Complementary positioning for ${currentBrand.industry || "fashion"} brands targeting culturally engaged shoppers.`,
        estimatedReach: "300+ retail stores, strong social following",
        isExternal: true,
      },
      {
        companyName: "Nykaa",
        industry: "Beauty & Fashion",
        reason: `Cross-category bundles between ${company} and Nykaa reach beauty-and-fashion crossover audiences.`,
        estimatedReach: "20M+ monthly active users",
        isExternal: true,
      },
    ],
    beauty: [
      {
        companyName: "Nykaa",
        industry: "Beauty E-commerce",
        reason: `${company} aligns with Nykaa's audience of beauty enthusiasts and content-driven shoppers.`,
        estimatedReach: "20M+ monthly active users",
        isExternal: true,
      },
      {
        companyName: "Mamaearth",
        industry: "D2C Personal Care",
        reason: `Both brands can co-create campaigns around clean, lifestyle-focused products for ${audience}.`,
        estimatedReach: "10M+ social followers",
        isExternal: true,
      },
      {
        companyName: "Sugar Cosmetics",
        industry: "Beauty & Cosmetics",
        reason: `Strong fit for influencer-led co-marketing with ${company} in the ${currentBrand.industry || "beauty"} space.`,
        estimatedReach: "5M+ Instagram followers",
        isExternal: true,
      },
    ],
    technology: [
      {
        companyName: "Razorpay",
        industry: "Fintech / SaaS",
        reason: `${company} can partner with Razorpay on webinars and content for startups and SMBs in ${currentBrand.industry || "tech"}.`,
        estimatedReach: "10M+ businesses on platform",
        isExternal: true,
      },
      {
        companyName: "Freshworks",
        industry: "SaaS",
        reason: `B2B co-marketing with Freshworks reaches decision-makers overlapping with ${audience}.`,
        estimatedReach: "60K+ global customers",
        isExternal: true,
      },
      {
        companyName: "Zoho",
        industry: "Business Software",
        reason: `Joint content on productivity and growth suits ${company}'s professional audience.`,
        estimatedReach: "100M+ users worldwide",
        isExternal: true,
      },
    ],
    food: [
      {
        companyName: "Swiggy",
        industry: "Food Delivery",
        reason: `${company} can run localized co-promotions with Swiggy for ${audience} in key metro markets.`,
        estimatedReach: "25M+ transacting users",
        isExternal: true,
      },
      {
        companyName: "Zomato",
        industry: "Food & Dining",
        reason: `Lifestyle and food crossover campaigns fit brands targeting ${audience}.`,
        estimatedReach: "30M+ monthly users in India",
        isExternal: true,
      },
      {
        companyName: "Licious",
        industry: "D2C Food",
        reason: `Premium food and lifestyle audiences overlap — strong potential for bundled offers with ${company}.`,
        estimatedReach: "2M+ active customers",
        isExternal: true,
      },
    ],
    fitness: [
      {
        companyName: "Cult.fit",
        industry: "Health & Fitness",
        reason: `${company} and Cult.fit share health-conscious ${audience} — great for wellness challenges and co-branded content.`,
        estimatedReach: "5M+ app users",
        isExternal: true,
      },
      {
        companyName: "Decathlon",
        industry: "Sports Retail",
        reason: `Sports and active-lifestyle campaigns align with ${currentBrand.industry || "fitness"} brands.`,
        estimatedReach: "100+ stores in India, strong digital reach",
        isExternal: true,
      },
      {
        companyName: "HealthifyMe",
        industry: "Health Tech",
        reason: `Nutrition and wellness content partnerships reach engaged fitness audiences for ${company}.`,
        estimatedReach: "30M+ users globally",
        isExternal: true,
      },
    ],
  };

  const globalPools: Record<string, PoolEntry[]> = {
    fashion: [
      {
        companyName: "ASOS",
        industry: "Fashion E-commerce",
        reason: `${company} can co-create trend-led content with ASOS for ${audience}.`,
        estimatedReach: "26M+ active customers",
        isExternal: true,
      },
      {
        companyName: "Uniqlo",
        industry: "Apparel Retail",
        reason: `Minimalist lifestyle crossover campaigns suit ${currentBrand.industry || "fashion"} positioning.`,
        estimatedReach: "Global retail footprint",
        isExternal: true,
      },
      {
        companyName: "Glossier",
        industry: "Beauty & Lifestyle",
        reason: `Community-driven co-marketing with Glossier fits brands targeting style-conscious ${audience}.`,
        estimatedReach: "3M+ Instagram followers",
        isExternal: true,
      },
    ],
    technology: [
      {
        companyName: "Notion",
        industry: "Productivity SaaS",
        reason: `${company} and Notion can co-host creator and SMB workflow content for ${audience}.`,
        estimatedReach: "30M+ users",
        isExternal: true,
      },
      {
        companyName: "Canva",
        industry: "Design Platform",
        reason: `Creative co-marketing templates and tutorials align with ${currentBrand.industry || "digital"} brands.`,
        estimatedReach: "170M+ monthly users",
        isExternal: true,
      },
      {
        companyName: "Mailchimp",
        industry: "Marketing SaaS",
        reason: `Joint webinars on growth marketing reach SMB decision-makers relevant to ${company}.`,
        estimatedReach: "13M+ users",
        isExternal: true,
      },
    ],
    food: [
      {
        companyName: "HelloFresh",
        industry: "Meal Kits",
        reason: `Lifestyle and food content partnerships fit ${company}'s audience of ${audience}.`,
        estimatedReach: "7M+ active customers globally",
        isExternal: true,
      },
      {
        companyName: "Oatly",
        industry: "Food & Beverage",
        reason: `Values-led co-branding campaigns resonate with health-conscious consumers.`,
        estimatedReach: "Strong global social presence",
        isExternal: true,
      },
      {
        companyName: "Deliveroo",
        industry: "Food Delivery",
        reason: `Local market activations and cross-promotions for ${audience} in urban areas.`,
        estimatedReach: "10M+ monthly active users",
        isExternal: true,
      },
    ],
  };

  const pickPool = (key: string) =>
    inIndia ? pools[key] ?? globalPools[key] : globalPools[key] ?? pools[key];

  for (const key of ["fashion", "beauty", "technology", "food", "fitness"]) {
    if (industry.includes(key)) return withSource(pickPool(key)!);
  }

  if (inIndia) {
    return withSource([
      {
        companyName: "CRED",
        industry: "Fintech / Lifestyle",
        reason: `${company} can reach affluent urban ${audience} through CRED's premium member base.`,
        estimatedReach: "15M+ members",
        isExternal: true,
      },
      {
        companyName: "PhonePe",
        industry: "Fintech",
        reason: `Co-branded offers and UPI-linked campaigns suit brands targeting Indian consumers.`,
        estimatedReach: "500M+ registered users",
        isExternal: true,
      },
      {
        companyName: "Meesho",
        industry: "Social Commerce",
        reason: `Reseller and SMB networks on Meesho overlap with ${currentBrand.industry || "consumer"} brands.`,
        estimatedReach: "140M+ users",
        isExternal: true,
      },
    ]);
  }

  return withSource([
    {
      companyName: "Shopify",
      industry: "E-commerce Platform",
      reason: `${company} can partner with Shopify on merchant success content for ${audience}.`,
      estimatedReach: "Millions of merchants globally",
      isExternal: true,
    },
    {
      companyName: "HubSpot",
      industry: "Marketing SaaS",
      reason: `Joint webinars and lead-gen content fit B2B brands in ${currentBrand.industry || "your industry"}.`,
      estimatedReach: "200K+ customers",
      isExternal: true,
    },
    {
      companyName: "Stripe",
      industry: "Fintech",
      reason: `Startup and SMB co-marketing with Stripe reaches growth-focused ${audience}.`,
      estimatedReach: "Global developer and business community",
      isExternal: true,
    },
  ]);
}

export async function discoverExternalBrands(
  currentBrand: BrandProfileData,
  options?: { useAi?: boolean },
): Promise<ExternalBrandDiscoveryResult> {
  const useAi = options?.useAi ?? true;
  const quotaBlocked = !isGeminiAvailable() && isGeminiConfigured();

  if (!useAi || !isGeminiConfigured()) {
    return { recommendations: [], source: "none", quotaBlocked: false };
  }

  if (quotaBlocked) {
    return {
      recommendations: getCuratedExternalBrands(currentBrand),
      source: "curated",
      quotaBlocked: true,
    };
  }

  const budgetHint = currentBrand.marketingBudget
    ? `$${currentBrand.marketingBudget.toLocaleString()} marketing budget`
    : "budget not specified — suggest partners realistic for SMB/mid-market brands";

  const prompt = `You are a B2B brand collaboration analyst. Suggest exactly 3 REAL companies that exist today and would make excellent co-marketing partners for the brand below.

Rules:
- Use only legitimate, operating businesses with a public presence (real company names, not placeholders).
- Tailor picks to the brand's industry, audience, location, and budget tier — avoid generic mega-brands unless they are genuinely the best fit.
- Do NOT suggest "${currentBrand.companyName || "the user's company"}" or any variation of it.
- Each reason must cite a specific synergy (shared audience, complementary product, geographic overlap, etc.).
- estimatedReach must be a realistic public metric (e.g. "2M Instagram followers", "500K monthly active users").

Brand profile:
- Company: ${currentBrand.companyName || "N/A"}
- Industry: ${currentBrand.industry || "N/A"}
- Target Audience: ${currentBrand.targetAudience || "N/A"}
- Marketing Budget: ${budgetHint}
- Location: ${currentBrand.location || "N/A"}
- Bio: ${currentBrand.bio || "N/A"}

Respond in JSON only with this exact structure:
{
  "recommendations": [
    {
      "companyName": "<real company name>",
      "industry": "<company industry>",
      "reason": "<1-2 sentences on why this is a strong partnership fit>",
      "estimatedReach": "<realistic audience size>"
    }
  ]
}`;

  const text = await generateText(prompt);
  if (!text) {
    return {
      recommendations: getCuratedExternalBrands(currentBrand),
      source: "curated",
      quotaBlocked: !isGeminiAvailable(),
    };
  }

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        recommendations: getCuratedExternalBrands(currentBrand),
        source: "curated",
        quotaBlocked: false,
      };
    }
    const parsed = JSON.parse(jsonMatch[0]);
    const recs = (parsed.recommendations || [])
      .map((rec: Partial<ExternalBrandRecommendation>) => normalizeExternalRec(rec, "ai"))
      .filter(Boolean) as ExternalBrandRecommendation[];

    if (!recs.length) {
      return {
        recommendations: getCuratedExternalBrands(currentBrand),
        source: "curated",
        quotaBlocked: false,
      };
    }

    const ownName = (currentBrand.companyName || "").toLowerCase();
    return {
      recommendations: recs
        .filter((rec) => rec.companyName.toLowerCase() !== ownName)
        .slice(0, 3),
      source: "ai",
      quotaBlocked: false,
    };
  } catch {
    return {
      recommendations: getCuratedExternalBrands(currentBrand),
      source: "curated",
      quotaBlocked: false,
    };
  }
}
