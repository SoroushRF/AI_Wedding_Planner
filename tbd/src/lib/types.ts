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

export type PlanPriority = "essential" | "recommended" | "optional";

export interface WeddingFormData {
  budget: number;
  location: string;
  weddingDate: string;
  weddingTime?: string;
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
  priority: PlanPriority;
  rationale: string;
}

export interface WeddingPlan {
  components: PlanComponent[];
  totalBudget: number;
  generatedAt: string;
  formData: WeddingFormData;
}

export type AppView = "landing" | "form" | "loading" | "planner";

export interface GeneratePlanResponse {
  components: PlanComponent[];
  totalBudget: number;
}
