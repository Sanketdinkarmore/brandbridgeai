import { generateText } from "@/lib/gemini";
import type { BrandProfileData } from "./matching";

export interface ProposalResult {
  proposal: string;
  emailDraft: string;
  campaignNameSuggestions: string[];
}

export async function generateCollaborationProposal(
  initiator: BrandProfileData & { name: string },
  partner: BrandProfileData & { name: string },
): Promise<ProposalResult> {
  const prompt = `Write a professional B2B brand collaboration proposal.

Initiator Brand: ${initiator.companyName || initiator.name}
Industry: ${initiator.industry || "N/A"}
Audience: ${initiator.targetAudience || "N/A"}

Partner Brand: ${partner.companyName || partner.name}
Industry: ${partner.industry || "N/A"}
Audience: ${partner.targetAudience || "N/A"}

Respond in JSON only:
{
  "proposal": "<professional collaboration proposal, 3-4 paragraphs>",
  "emailDraft": "<professional email to send to partner brand, ready to send>",
  "campaignNameSuggestions": ["<name1>", "<name2>", "<name3>"]
}

Do NOT create advertisements. Focus on collaboration strategy and partnership value.`;

  try {
    const text = await generateText(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      proposal: parsed.proposal ?? "",
      emailDraft: parsed.emailDraft ?? "",
      campaignNameSuggestions: parsed.campaignNameSuggestions ?? [],
    };
  } catch {
    return {
      proposal: `Dear ${partner.companyName || partner.name} team,\n\nWe at ${initiator.companyName || initiator.name} believe there is strong synergy between our brands. Our shared focus on ${initiator.industry || "the market"} presents an opportunity for a collaborative campaign that benefits both audiences.\n\nWe propose a co-marketing initiative leveraging our complementary strengths to reduce costs and expand reach.\n\nWe look forward to discussing this partnership.`,
      emailDraft: `Subject: Collaboration Opportunity — ${initiator.companyName || initiator.name} × ${partner.companyName || partner.name}\n\nHi ${partner.name},\n\nI'm reaching out from ${initiator.companyName || initiator.name}. We've identified a strong alignment between our brands and would love to explore a collaboration.\n\nWould you be open to a brief call this week?\n\nBest regards,\n${initiator.name}`,
      campaignNameSuggestions: [
        `${initiator.companyName || "Brand"} × ${partner.companyName || "Partner"} Collab`,
        "Synergy Campaign 2026",
        "Partners in Growth",
      ],
    };
  }
}
