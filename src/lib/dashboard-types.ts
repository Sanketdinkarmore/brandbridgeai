export interface CampaignItem {
  _id: string;
  title: string;
  description?: string;
  status: string;
  budget?: number;
  ownerId?: { name?: string };
}

export interface CollaborationItem {
  _id: string;
  status: string;
  message?: string;
  proposal?: string;
  compatibilityScore?: number;
  initiatorId: { _id: string; name: string };
  partnerId: { _id: string; name: string };
}

export interface ProductItem {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  images?: string[];
  status?: string;
}

export interface BrandItem {
  profile: {
    userId: string;
    companyName?: string;
    industry?: string;
    location?: string;
    targetAudience?: string;
    logo?: string;
  };
  user?: { _id: string };
}

export interface PortfolioItemData {
  _id: string;
  title: string;
  description?: string;
  mediaUrl: string;
  category?: string;
}

export interface ProposalItem {
  _id: string;
  status: string;
  message?: string;
  rate?: number;
  campaignId?: { title?: string };
}

export interface HireItem {
  _id: string;
  status: string;
  rate?: number;
  hirerId?: { name?: string };
  freelancerId?: { name?: string };
  campaignId?: { title?: string };
}

export interface FreelancerItem {
  user?: { _id: string; name: string };
  profile?: { avatar?: string };
  freelancerProfile?: {
    skills?: string[];
    categories?: string[];
    hourlyRate?: number;
    rating?: number;
  };
  portfolio?: { mediaUrl: string; title: string }[];
  saved?: boolean;
}
