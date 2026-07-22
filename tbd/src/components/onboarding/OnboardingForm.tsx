"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  MapPin,
  Trees,
  Users,
  Waves,
  Wine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { ease } from "@/lib/motion";
import { buildSamplePlan } from "@/lib/samplePlan";
import { useWeddingStore } from "@/lib/store";
import type {
  GeneratePlanResponse,
  VenueType,
  Vibe,
  WeddingFormData,
} from "@/lib/types";

const VENUE_OPTIONS: {
  value: VenueType;
  label: string;
  hint: string;
  icon: typeof Building2;
}[] = [
  { value: "ballroom", label: "Indoor Ballroom", hint: "Classic elegance", icon: Building2 },
  { value: "garden", label: "Outdoor Garden", hint: "Natural light", icon: Trees },
  { value: "destination", label: "Destination", hint: "Travel celebration", icon: Waves },
  { value: "intimate", label: "Intimate Venue", hint: "Small & personal", icon: Wine },
];

const VIBE_OPTIONS: { value: Vibe; label: string }[] = [
  { value: "blacktie", label: "Black Tie" },
  { value: "rustic", label: "Rustic" },
  { value: "boho", label: "Boho" },
  { value: "minimalist", label: "Minimalist" },
  { value: "romantic", label: "Romantic" },
];

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
  const [step, setStep] = useState(0);

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

  const step1Ready =
    budget >= 1000 && location.trim().length > 0 && weddingDate.length > 0;
  const guests = Number(guestCount);
  const step2Ready = guests >= 10 && guests <= 500 && venueType !== null;
  const canSubmit = step1Ready && step2Ready;

  const syncBudget = useCallback((value: number) => {
    const clamped = Math.min(500000, Math.max(1000, value));
    setBudget(clamped);
    setBudgetInput(String(clamped));
  }, []);

  const completion = useMemo(() => {
    let n = 0;
    if (budget >= 1000) n += 1;
    if (location.trim()) n += 1;
    if (weddingDate) n += 1;
    if (guests >= 10 && guests <= 500) n += 1;
    if (venueType) n += 1;
    if (vibe) n += 1;
    return Math.round((n / 6) * 100);
  }, [budget, location, weddingDate, guests, venueType, vibe]);

  const buildPayload = (): WeddingFormData | null => {
    if (!canSubmit || !venueType) return null;
    return {
      budget,
      location: location.trim(),
      weddingDate,
      weddingTime: weddingTime.trim() || undefined,
      guestCount: Number(guestCount),
      venueType,
      vibe,
    };
  };

  const loadSamplePlan = () => {
    const payload = buildPayload();
    if (!payload) return;
    setFormData(payload);
    setError(null);
    setPlan(buildSamplePlan(payload));
    setView("planner");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildPayload();
    if (!payload) return;

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

  const steps = ["Essentials", "Guest & Venue", "Vibe"];

  return (
    <section className="relative mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
      >
        <header className="mb-8 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setView("landing")}
              className="font-heading text-lg tracking-tight"
            >
              TBD
            </button>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              {completion}% complete
            </p>
          </div>

          <div>
            <h1 className="font-heading text-3xl sm:text-4xl">Plan your day</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-soft)]">
              A few details — we&apos;ll build a thoughtful, editable starting plan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {steps.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  "flex-1 border-b-2 pb-2 text-left text-[11px] uppercase tracking-[0.18em] transition-colors",
                  step === i
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="mr-1.5 text-muted-foreground">{i + 1}</span>
                {label}
              </button>
            ))}
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3, ease }}
                className="surface-panel space-y-8 p-5 sm:p-8"
              >
                <fieldset className="space-y-4">
                  <Label htmlFor="budget" className="text-sm">
                    What&apos;s your total wedding budget?
                  </Label>
                  <p className="font-heading text-4xl tracking-tight">
                    {formatCurrency(budget)}
                  </p>
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
                  <div className="flex items-center gap-3">
                    <Input
                      id="budget"
                      inputMode="numeric"
                      value={budgetInput}
                      onChange={(e) => {
                        setBudgetInput(e.target.value);
                        syncBudget(parseBudgetInput(e.target.value));
                      }}
                      className="max-w-[160px] rounded-none bg-background/70"
                    />
                    <span className="text-xs text-muted-foreground">
                      Or type an exact amount
                    </span>
                  </div>
                </fieldset>

                <fieldset className="space-y-2">
                  <Label htmlFor="location" className="inline-flex items-center gap-2">
                    <MapPin className="size-3.5 text-[var(--gold)]" />
                    Where are you celebrating?
                  </Label>
                  <Input
                    id="location"
                    placeholder="City or region — e.g. Brooklyn, NY"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="rounded-none bg-background/70"
                    required
                  />
                </fieldset>

                <div className="grid gap-6 sm:grid-cols-2">
                  <fieldset className="space-y-2">
                    <Label
                      htmlFor="weddingDate"
                      className="inline-flex items-center gap-2"
                    >
                      <CalendarDays className="size-3.5 text-[var(--gold)]" />
                      Wedding date
                    </Label>
                    <Input
                      id="weddingDate"
                      type="date"
                      value={weddingDate}
                      onChange={(e) => setWeddingDate(e.target.value)}
                      className="rounded-none bg-background/70"
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
                      className="rounded-none bg-background/70"
                    />
                  </fieldset>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    disabled={!step1Ready}
                    className="btn-editorial h-11 px-8"
                    onClick={() => setStep(1)}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3, ease }}
                className="surface-panel space-y-8 p-5 sm:p-8"
              >
                <fieldset className="space-y-2">
                  <Label htmlFor="guests" className="inline-flex items-center gap-2">
                    <Users className="size-3.5 text-[var(--gold)]" />
                    How many guests are you expecting?
                  </Label>
                  <Input
                    id="guests"
                    type="number"
                    min={10}
                    max={500}
                    placeholder="120"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="rounded-none bg-background/70"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Including ceremony and reception
                  </p>
                </fieldset>

                <fieldset className="space-y-3">
                  <Label>What kind of venue are you envisioning?</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {VENUE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const selected = venueType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setVenueType(opt.value)}
                          className={cn(
                            "group border px-4 py-4 text-left transition-colors",
                            selected
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-background/50 hover:border-[var(--gold)]"
                          )}
                        >
                          <Icon
                            className={cn(
                              "mb-3 size-5",
                              selected ? "text-[var(--brand-accent)]" : "text-[var(--gold)]"
                            )}
                          />
                          <span className="block text-sm font-medium">{opt.label}</span>
                          <span
                            className={cn(
                              "text-xs",
                              selected ? "text-background/70" : "text-muted-foreground"
                            )}
                          >
                            {opt.hint}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="flex justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="btn-editorial h-11 rounded-none px-6"
                    onClick={() => setStep(0)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    disabled={!step2Ready}
                    className="btn-editorial h-11 px-8"
                    onClick={() => setStep(2)}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3, ease }}
                className="surface-panel space-y-8 p-5 sm:p-8"
              >
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
                          "border px-4 py-2.5 text-sm transition-colors",
                          vibe === opt.value
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background/50 hover:border-foreground/40"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="border border-dashed border-border bg-background/40 p-4 text-sm text-[var(--ink-soft)]">
                  <p className="font-medium text-foreground">Ready to generate</p>
                  <p className="mt-1">
                    {formatCurrency(budget)} · {location || "Location"} ·{" "}
                    {guestCount || "—"} guests
                    {venueType
                      ? ` · ${VENUE_OPTIONS.find((v) => v.value === venueType)?.label}`
                      : ""}
                    {vibe
                      ? ` · ${VIBE_OPTIONS.find((v) => v.value === vibe)?.label}`
                      : ""}
                  </p>
                </div>

                <div className="flex justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="btn-editorial h-11 rounded-none px-6"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="btn-editorial h-11 px-8"
                  >
                    Generate My Plan →
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 left-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 border border-destructive/25 bg-[#fff8f6] px-4 py-3 text-sm shadow-lg"
          >
            <p className="font-medium text-destructive">
              Couldn&apos;t generate your plan
            </p>
            <p className="mt-0.5 text-destructive/80">{error}</p>
            <button
              type="button"
              onClick={loadSamplePlan}
              className="mt-3 text-xs uppercase tracking-[0.18em] text-foreground underline-offset-4 hover:underline"
            >
              Continue with sample plan
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
