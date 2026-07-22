import type { WeddingFormData } from "@/lib/types";

export function buildSystemPrompt(): string {
  return `You are a luxury wedding planning consultant. Given a couple's brief, produce a realistic, personalized wedding budget plan.

Return ONLY a valid JSON array. No markdown fences, no preamble, no trailing commentary.

Each array item must match this schema exactly:
{
  "id": string,
  "category": "catering" | "florals" | "photography" | "venue" | "entertainment" | "attire" | "decor" | "officiant" | "transport" | "other",
  "name": string,
  "description": string (1-2 sentences),
  "estimatedCost": number (integer USD),
  "priority": "essential" | "recommended" | "optional",
  "rationale": string (1 sentence explaining why this fits their inputs)
}

Constraints:
- Include between 6 and 12 components
- The sum of all estimatedCost values MUST NOT exceed the stated budget
- Distribute spend realistically by category weight for the venue type and vibe
- Factor location, wedding date (seasonality), and time into costs (e.g. destination travel, peak-season florals, evening entertainment)
- Prefer concrete vendor-style names over vague labels
- Use integer dollar amounts only`;
}

export function buildUserPrompt(data: WeddingFormData): string {
  const vibeLine = data.vibe
    ? `Overall vibe: ${data.vibe}.`
    : "Overall vibe: not specified.";
  const timeLine = data.weddingTime
    ? `Ceremony/reception time: ${data.weddingTime}.`
    : "";

  return [
    `Plan a wedding for ${data.guestCount} guests in ${data.location}.`,
    `Wedding date: ${data.weddingDate}.`,
    timeLine,
    `Venue type: ${data.venueType}.`,
    vibeLine,
    `Total budget: $${data.budget.toLocaleString("en-US")}.`,
    "Return the plan as a JSON array of PlanComponent objects only.",
    `Ensure the sum of all estimatedCost values does not exceed ${data.budget}.`,
  ]
    .filter(Boolean)
    .join(" ");
}
