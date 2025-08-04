// File: lib/interface.ts

export interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  stock?: number;
  unit?: string;
}

export interface FaqQuestion {
  question: string;
  answer: string;
}

export interface Campaign {
  id: number;
  title: string;
  category: string;
  festivalType?: string;
  overview: string;
  details: string;
  goal: number;
  raised: number;
  status: "Active" | "Inactive" | "Completed" | "Draft";
  bannerImage: string;
  additionalImages: string[];
  assignedProducts: Product[];
  endDate: Date;
  priority: "low" | "medium" | "high" | "critical";
  aboutCampaign?: string;
  location?: string;
  organizer?: string;
  verified?: boolean;
  urgency?: string;
  faq_questions?: FaqQuestion[];
  total_beneficiary?: number;
  total_donors_till_now?: number;
  videoLinks?: any[];
  total_progress_percentage?: number;
}