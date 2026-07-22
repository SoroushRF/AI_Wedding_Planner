import type { PlanComponent, WeddingFormData, WeddingPlan } from "@/lib/types";

function scaleCosts(components: PlanComponent[], budget: number): PlanComponent[] {
  const total = components.reduce((sum, c) => sum + c.estimatedCost, 0);
  if (total <= 0 || total <= budget) return components;
  const factor = budget / total;
  return components.map((c) => ({
    ...c,
    estimatedCost: Math.max(100, Math.round(c.estimatedCost * factor)),
  }));
}

export function buildSamplePlan(formData: WeddingFormData): WeddingPlan {
  const perGuest = Math.round(formData.budget * 0.35);
  const venue = Math.round(formData.budget * 0.25);
  const photo = Math.round(formData.budget * 0.12);
  const florals = Math.round(formData.budget * 0.08);
  const music = Math.round(formData.budget * 0.07);
  const attire = Math.round(formData.budget * 0.06);
  const decor = Math.round(formData.budget * 0.04);
  const other = Math.max(
    200,
    formData.budget - (perGuest + venue + photo + florals + music + attire + decor)
  );

  const components: PlanComponent[] = scaleCosts(
    [
      {
        id: crypto.randomUUID(),
        category: "venue",
        name: `${formData.venueType === "garden" ? "Garden estate" : "Signature venue"} hold`,
        description: `Venue package suited to a ${formData.venueType} celebration in ${formData.location}.`,
        estimatedCost: venue,
        priority: "essential",
        rationale: "Venue is the structural anchor for guest experience and timeline.",
      },
      {
        id: crypto.randomUUID(),
        category: "catering",
        name: "Reception catering",
        description: `Plated or family-style service for about ${formData.guestCount} guests.`,
        estimatedCost: perGuest,
        priority: "essential",
        rationale: "Food and beverage typically claim the largest share after venue.",
      },
      {
        id: crypto.randomUUID(),
        category: "photography",
        name: "Photography coverage",
        description: "Full-day photographer with highlight gallery and digital delivery.",
        estimatedCost: photo,
        priority: "essential",
        rationale: "Photography preserves the day and is hard to recreate later.",
      },
      {
        id: crypto.randomUUID(),
        category: "florals",
        name: "Ceremony & table florals",
        description: "Bouquet, ceremony markers, and reception centerpieces.",
        estimatedCost: florals,
        priority: "recommended",
        rationale: "Florals set tone quickly without consuming the full budget.",
      },
      {
        id: crypto.randomUUID(),
        category: "entertainment",
        name: "Reception entertainment",
        description: "DJ or small live set covering ceremony-to-last-dance.",
        estimatedCost: music,
        priority: "recommended",
        rationale: "Music keeps energy consistent across the evening.",
      },
      {
        id: crypto.randomUUID(),
        category: "attire",
        name: "Attire & styling",
        description: "Primary looks plus alterations and day-of styling buffer.",
        estimatedCost: attire,
        priority: "recommended",
        rationale: "Keeps personal style visible without crowding vendor budgets.",
      },
      {
        id: crypto.randomUUID(),
        category: "decor",
        name: "Lighting & d├⌐cor accents",
        description: "Soft lighting, linens, and a few statement pieces.",
        estimatedCost: decor,
        priority: "optional",
        rationale: "Small d├⌐cor upgrades elevate photos without large spend.",
      },
      {
        id: crypto.randomUUID(),
        category: "other",
        name: "Day-of contingency",
        description: "Buffer for tips, transport, and unexpected vendor fees.",
        estimatedCost: other,
        priority: "optional",
        rationale: "A contingency line protects the plan when costs shift.",
      },
    ],
    formData.budget
  );

  return {
    components,
    totalBudget: formData.budget,
    generatedAt: new Date().toISOString(),
    formData,
  };
}
