"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AddComponentModal } from "@/components/planner/AddComponentModal";
import { BudgetBar } from "@/components/planner/BudgetBar";
import { PlanCard } from "@/components/planner/PlanCard";
import { useWeddingStore } from "@/lib/store";
import type { VenueType, Vibe } from "@/lib/types";

const VENUE_LABELS: Record<VenueType, string> = {
  ballroom: "Ballroom",
  garden: "Garden",
  destination: "Destination",
  intimate: "Intimate",
};

const VIBE_LABELS: Record<Vibe, string> = {
  blacktie: "Black Tie",
  rustic: "Rustic",
  boho: "Boho",
  minimalist: "Minimalist",
  romantic: "Romantic",
};

function formatSummaryDate(isoDate: string) {
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PlannerView() {
  const plan = useWeddingStore((s) => s.plan);
  const removeComponent = useWeddingStore((s) => s.removeComponent);
  const addComponent = useWeddingStore((s) => s.addComponent);
  const clearPlan = useWeddingStore((s) => s.clearPlan);

  const [addOpen, setAddOpen] = useState(false);

  const allocated = useMemo(
    () => plan?.components.reduce((sum, c) => sum + c.estimatedCost, 0) ?? 0,
    [plan?.components]
  );

  if (!plan) return null;

  const { formData } = plan;
  const summaryParts = [
    formData.location,
    formatSummaryDate(formData.weddingDate),
    `${formData.guestCount} guests`,
    formData.vibe ? VIBE_LABELS[formData.vibe] : VENUE_LABELS[formData.venueType],
  ];

  const handleStartOver = () => {
    if (
      window.confirm(
        "This will clear your current plan. Continue?"
      )
    ) {
      clearPlan();
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <header className="border-b border-border px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-heading text-xl tracking-tight">TBD</p>
          <p className="text-center text-sm text-muted-foreground sm:flex-1">
            {summaryParts.join(" · ")}
          </p>
          <Button
            type="button"
            variant="outline"
            className="rounded-none text-xs uppercase tracking-wider"
            onClick={handleStartOver}
          >
            Start Over
          </Button>
        </div>
      </header>

      <div className="sticky top-0 z-40">
        <BudgetBar totalBudget={plan.totalBudget} allocatedAmount={allocated} />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {plan.components.map((component, index) => (
              <PlanCard
                key={component.id}
                component={component}
                index={index}
                onRemove={() => removeComponent(component.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="rounded-none uppercase tracking-widest"
            onClick={() => setAddOpen(true)}
          >
            Add component
          </Button>
        </div>
      </div>

      <AddComponentModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={addComponent}
      />
    </div>
  );
}
