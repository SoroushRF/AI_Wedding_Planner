export type VenueType = "ballroom" | "garden" | "destination" | "intimate";

export type Vibe =
  | "blacktie"
  | "rustic"
  | "boho"
  | "minimalist"
  | "romantic";

export type PlanCategory =
  | "catering"
  | "florals"
  | "photography"
  | "venue"
  | "entertainment"
  | "attire"
  | "decor"
  | "officiant"
  | "transport"
  | "other";

export type Priority = "essential" | "recommended" | "optional";

export type AppView = "landing" | "form" | "loading" | "planner";

export interface WeddingFormData {
  budget: number;
  location: string;
  weddingDate: string; // YYYY-MM-DD
  weddingTime?: string; // HH:mm
  guestCount: number;
  venueType: VenueType;
  vibe?: Vibe;
}

export interface PlanComponent {
  id: string;
  category: PlanCategory;
  name: string;
  description: string;
  estimatedCost: number;
  priority: Priority;
  rationale: string;
}

export interface WeddingPlan {
  components: PlanComponent[];
  totalBudget: number;
  generatedAt: string; // ISO timestamp
  formData: WeddingFormData;
}

export interface GeneratePlanResponse {
  components: PlanComponent[];
  totalBudget: number;
}
