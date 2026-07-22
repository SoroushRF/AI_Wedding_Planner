"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useWeddingStore } from "@/lib/store";
import type { GeneratePlanResponse, VenueType, Vibe, WeddingFormData } from "@/lib/types";

const VENUE_OPTIONS: { value: VenueType; label: string; hint: string }[] = [
  { value: "ballroom", label: "Indoor Ballroom", hint: "Classic elegance" },
  { value: "garden", label: "Outdoor Garden", hint: "Natural light" },
  { value: "destination", label: "Destination", hint: "Travel celebration" },
  { value: "intimate", label: "Intimate Venue", hint: "Small & personal" },
];

const VIBE_OPTIONS: { value: Vibe; label: string }[] = [
  { value: "blacktie", label: "Black Tie" },
  { value: "rustic", label: "Rustic" },
  { value: "boho", label: "Boho" },
  { value: "minimalist", label: "Minimalist" },
  { value: "romantic", label: "Romantic" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function parseBudgetInput(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return 1000;
  return Math.min(500000, Math.max(1000, Number(digits)));
}

export function OnboardingForm() {
  const formData = useWeddingStore((s) => s.formData);
  const error = useWeddingStore((s) => s.error);
  const setFormData = useWeddingStore((s) => s.setFormData);
  const setPlan = useWeddingStore((s) => s.setPlan);
  const setView = useWeddingStore((s) => s.setView);
  const setGenerating = useWeddingStore((s) => s.setGenerating);
  const setError = useWeddingStore((s) => s.setError);

  const [budget, setBudget] = useState(formData?.budget ?? 25000);
  const [budgetInput, setBudgetInput] = useState(String(formData?.budget ?? 25000));
  const [location, setLocation] = useState(formData?.location ?? "");
  const [weddingDate, setWeddingDate] = useState(formData?.weddingDate ?? "");
  const [weddingTime, setWeddingTime] = useState(formData?.weddingTime ?? "");
  const [guestCount, setGuestCount] = useState(
    formData?.guestCount ? String(formData.guestCount) : ""
  );
  const [venueType, setVenueType] = useState<VenueType | null>(
    formData?.venueType ?? null
  );
  const [vibe, setVibe] = useState<Vibe | undefined>(formData?.vibe);

  useEffect(() => {
    if (!formData) return;
    setBudget(formData.budget);
    setBudgetInput(String(formData.budget));
    setLocation(formData.location);
    setWeddingDate(formData.weddingDate);
    setWeddingTime(formData.weddingTime ?? "");
    setGuestCount(String(formData.guestCount));
    setVenueType(formData.venueType);
    setVibe(formData.vibe);
  }, [formData]);

  const canSubmit = useMemo(() => {
    const guests = Number(guestCount);
    return (
      budget >= 1000 &&
      location.trim().length > 0 &&
      weddingDate.length > 0 &&
      guests >= 10 &&
      guests <= 500 &&
      venueType !== null
    );
  }, [budget, location, weddingDate, guestCount, venueType]);

  const syncBudget = useCallback((value: number) => {
    const clamped = Math.min(500000, Math.max(1000, value));
    setBudget(clamped);
    setBudgetInput(String(clamped));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !venueType) return;

    const payload: WeddingFormData = {
      budget,
      location: location.trim(),
      weddingDate,
      weddingTime: weddingTime.trim() || undefined,
      guestCount: Number(guestCount),
      venueType,
      vibe,
    };

    setFormData(payload);
    setGenerating(true);
    setError(null);
    setView("loading");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          typeof body.error === "string"
            ? body.error
            : "Something went wrong. Try again."
        );
      }

      const data = (await res.json()) as GeneratePlanResponse;
      setPlan({
        components: data.components,
        totalBudget: data.totalBudget,
        generatedAt: new Date().toISOString(),
        formData: payload,
      });
      setView("planner");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
      setView("form");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="mx-auto min-h-screen max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <header className="mb-10 space-y-2 text-center sm:text-left">
          <p className="font-heading text-3xl">Plan your day</p>
          <p className="text-sm text-muted-foreground">
            A few details — we&apos;ll build a thoughtful starting budget.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          <fieldset className="space-y-4">
            <Label htmlFor="budget">What&apos;s your total wedding budget?</Label>
            <p className="font-heading text-2xl">{formatCurrency(budget)}</p>
            <Slider
              min={1000}
              max={150000}
              step={500}
              value={[budget]}
              onValueChange={(v) => {
                const next = Array.isArray(v) ? v[0] : v;
                syncBudget(typeof next === "number" ? next : budget);
              }}
            />
            <Input
              id="budget"
              inputMode="numeric"
              value={budgetInput}
              onChange={(e) => {
                setBudgetInput(e.target.value);
                syncBudget(parseBudgetInput(e.target.value));
              }}
              className="max-w-[160px]"
            />
          </fieldset>

          <fieldset className="space-y-2">
            <Label htmlFor="location">Where are you planning to celebrate?</Label>
            <Input
              id="location"
              placeholder="City or region"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </fieldset>

          <div className="grid gap-6 sm:grid-cols-2">
            <fieldset className="space-y-2">
              <Label htmlFor="weddingDate">Wedding date</Label>
              <Input
                id="weddingDate"
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                required
              />
            </fieldset>
            <fieldset className="space-y-2">
              <Label htmlFor="weddingTime">Ceremony time (optional)</Label>
              <Input
                id="weddingTime"
                type="time"
                value={weddingTime}
                onChange={(e) => setWeddingTime(e.target.value)}
              />
            </fieldset>
          </div>

          <fieldset className="space-y-2">
            <Label htmlFor="guests">How many guests are you expecting?</Label>
            <Input
              id="guests"
              type="number"
              min={10}
              max={500}
              placeholder="120"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Including ceremony and reception
            </p>
          </fieldset>

          <fieldset className="space-y-3">
            <Label>What kind of venue are you envisioning?</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {VENUE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVenueType(opt.value)}
                  className={cn(
                    "border px-4 py-4 text-left transition-colors",
                    venueType === opt.value
                      ? "border-[var(--brand-accent)] bg-[var(--brand-accent)]/10"
                      : "border-border hover:border-[var(--gold)]/60"
                  )}
                >
                  <span className="block text-sm font-medium">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <Label>What&apos;s the overall vibe? (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {VIBE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setVibe((current) =>
                      current === opt.value ? undefined : opt.value
                    )
                  }
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors",
                    vibe === opt.value
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/40"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-11 w-full rounded-none uppercase tracking-widest sm:w-auto sm:px-10"
          >
            Generate My Plan →
          </Button>
        </form>
      </motion.div>

      {error && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 z-50 max-w-md -translate-x-1/2 border border-destructive/30 bg-background px-4 py-3 text-sm shadow-lg"
        >
          {error}
        </motion.div>
      )}
    </section>
  );
}
