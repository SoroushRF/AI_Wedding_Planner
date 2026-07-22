import type { PlanCategory, PlanComponent, Priority } from "@/lib/types";

const CATEGORIES: PlanCategory[] = [
  "catering",
  "florals",
  "photography",
  "venue",
  "entertainment",
  "attire",
  "decor",
  "officiant",
  "transport",
  "other",
];

const PRIORITIES: Priority[] = ["essential", "recommended", "optional"];

export function stripMarkdownFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced) return fenced[1].trim();
  return trimmed;
}

export function parseModelJson(text: string): unknown {
  return JSON.parse(stripMarkdownFences(text));
}

function isPlanCategory(value: unknown): value is PlanCategory {
  return typeof value === "string" && CATEGORIES.includes(value as PlanCategory);
}

function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && PRIORITIES.includes(value as Priority);
}

export function normalizeComponents(raw: unknown): PlanComponent[] {
  if (!Array.isArray(raw)) {
    throw new Error("Model response must be a JSON array");
  }

  if (raw.length < 6 || raw.length > 12) {
    throw new Error("Plan must contain between 6 and 12 components");
  }

  return raw.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Invalid component at index ${index}`);
    }

    const record = item as Record<string, unknown>;
    const category = record.category;
    const priority = record.priority;
    const estimatedCost = Number(record.estimatedCost);

    if (!isPlanCategory(category)) {
      throw new Error(`Invalid category at index ${index}`);
    }
    if (!isPriority(priority)) {
      throw new Error(`Invalid priority at index ${index}`);
    }
    if (!Number.isFinite(estimatedCost) || estimatedCost < 0) {
      throw new Error(`Invalid estimatedCost at index ${index}`);
    }

    const id =
      typeof record.id === "string" && record.id.trim().length > 0
        ? record.id
        : crypto.randomUUID();

    return {
      id,
      category,
      name: String(record.name ?? "Untitled component"),
      description: String(record.description ?? ""),
      estimatedCost: Math.round(estimatedCost),
      priority,
      rationale: String(record.rationale ?? ""),
    };
  });
}

export function ensureIds(components: PlanComponent[]): PlanComponent[] {
  return components.map((component) =>
    component.id ? component : { ...component, id: crypto.randomUUID() }
  );
}

export function scaleCostsToBudget(
  components: PlanComponent[],
  budget: number
): PlanComponent[] {
  const total = components.reduce(
    (sum, component) => sum + component.estimatedCost,
    0
  );

  if (total <= budget || total === 0) {
    return components;
  }

  const scaled = components.map((component) => ({
    ...component,
    estimatedCost: Math.round(
      (component.estimatedCost * budget) / total
    ),
  }));

  let scaledTotal = scaled.reduce(
    (sum, component) => sum + component.estimatedCost,
    0
  );

  if (scaledTotal > budget) {
    const largestIndex = scaled.reduce(
      (maxIdx, component, idx, arr) =>
        component.estimatedCost > arr[maxIdx].estimatedCost ? idx : maxIdx,
      0
    );
    scaled[largestIndex] = {
      ...scaled[largestIndex],
      estimatedCost: Math.max(
        0,
        scaled[largestIndex].estimatedCost - (scaledTotal - budget)
      ),
    };
  }

  return scaled;
}
