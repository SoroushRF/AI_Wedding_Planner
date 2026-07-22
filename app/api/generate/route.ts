import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import {
  ensureIds,
  normalizeComponents,
  parseModelJson,
  scaleCostsToBudget,
} from "@/lib/planUtils";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import type {
  GeneratePlanResponse,
  VenueType,
  WeddingFormData,
} from "@/lib/types";

const VENUE_TYPES: VenueType[] = [
  "ballroom",
  "garden",
  "destination",
  "intimate",
];

function isWeddingFormData(body: unknown): body is WeddingFormData {
  if (!body || typeof body !== "object") return false;
  const data = body as Record<string, unknown>;

  return (
    typeof data.budget === "number" &&
    Number.isFinite(data.budget) &&
    data.budget > 0 &&
    typeof data.location === "string" &&
    data.location.trim().length > 0 &&
    typeof data.weddingDate === "string" &&
    data.weddingDate.trim().length > 0 &&
    typeof data.guestCount === "number" &&
    Number.isFinite(data.guestCount) &&
    data.guestCount > 0 &&
    typeof data.venueType === "string" &&
    VENUE_TYPES.includes(data.venueType as VenueType)
  );
}

async function generatePlanText(
  formData: WeddingFormData,
  apiKey: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: buildSystemPrompt(),
  });

  const result = await model.generateContent(buildUserPrompt(formData));
  const text = result.response.text();

  if (!text || !text.trim()) {
    throw new Error("Empty response from Gemini");
  }

  return text;
}

function buildResponseFromModelText(
  text: string,
  budget: number
): GeneratePlanResponse {
  const parsed = parseModelJson(text);
  const normalized = ensureIds(normalizeComponents(parsed));
  const components = scaleCostsToBudget(normalized, budget);

  return {
    components,
    totalBudget: budget,
  };
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (!isWeddingFormData(body)) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid required fields: budget, location, weddingDate, guestCount, venueType",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const formData: WeddingFormData = {
      budget: body.budget,
      location: body.location.trim(),
      weddingDate: body.weddingDate,
      guestCount: body.guestCount,
      venueType: body.venueType,
      ...(typeof body.weddingTime === "string" && body.weddingTime.trim()
        ? { weddingTime: body.weddingTime }
        : {}),
      ...(typeof body.vibe === "string" ? { vibe: body.vibe } : {}),
    };

    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const text = await generatePlanText(formData, apiKey);
        const payload = buildResponseFromModelText(text, formData.budget);
        return NextResponse.json(payload, { status: 200 });
      } catch (error) {
        lastError = error;
      }
    }

    const message =
      lastError instanceof Error
        ? lastError.message
        : "Failed to generate wedding plan";

    return NextResponse.json(
      { error: "Unable to parse Gemini response", details: message },
      { status: 500 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
