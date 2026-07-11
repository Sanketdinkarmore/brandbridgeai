export interface CampaignItem {
  _id: string;
  title: string;
  description?: string;
  status: string;
  budget?: number;
  ownerId?: { name?: string };
  type?: string;
  startDate?: string;
  endDate?: string;
  goal?: string;
  spent?: number;
  stats?: {
    reach?: number;
    engagement?: number;
    clicks?: number;
  };
  assets?: string[];
  collaborationId?: any; // To allow populated data
}

export interface CollaborationItem {
  _id: string;
  status: string;
  message?: string;
  proposal?: string;
  compatibilityScore?: number;
  isIncoming?: boolean;
  partnerId?: string;
  partnerName?: string;
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
  hirerId?: { _id: string; name: string };
  freelancerId?: { _id: string; name: string };
  campaignId?: { _id: string; title: string };
  status: string;
  rate?: number;
  notes?: string;
  startDate?: string;
  endDate?: string;
  declineReason?: string;
  deliverables?: { fileUrl: string; name: string }[];
  createdAt: string;
}

export interface FreelancerItem {
  user?: { _id: string; name: string };
  profile?: { avatar?: string; location?: string; bio?: string };
  freelancerProfile?: {
    skills?: string[];
    categories?: string[];
    hourlyRate?: number;
    rating?: number;
    completedProjects?: number;
    availability?: string;
  };
  portfolio?: { mediaUrl: string; title: string }[];
  saved?: boolean;
}
