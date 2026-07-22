"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddComponentModal } from "@/components/planner/AddComponentModal";
import { BudgetBar } from "@/components/planner/BudgetBar";
import { PlanCard } from "@/components/planner/PlanCard";
import { formatCurrency, formatSummaryDate } from "@/lib/format";
import { ease } from "@/lib/motion";
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

const PRIORITY_ORDER = { essential: 0, recommended: 1, optional: 2 } as const;

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

  const sorted = useMemo(() => {
    if (!plan) return [];
    return [...plan.components].sort(
      (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    );
  }, [plan]);

  if (!plan) return null;

  const { formData } = plan;
  const summaryParts = [
    formData.location,
    formatSummaryDate(formData.weddingDate),
    `${formData.guestCount} guests`,
    formData.vibe ? VIBE_LABELS[formData.vibe] : VENUE_LABELS[formData.venueType],
  ];

  const handleStartOver = () => {
    if (window.confirm("This will clear your current plan. Continue?")) {
      clearPlan();
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="border-b border-border/80 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4 lg:block">
            <p className="font-heading text-2xl tracking-tight">TBD</p>
            <Button
              type="button"
              variant="outline"
              className="btn-editorial h-9 rounded-none px-4 lg:hidden"
              onClick={handleStartOver}
            >
              Start Over
            </Button>
          </div>

          <div className="text-center lg:flex-1">
            <p className="font-heading text-lg tracking-tight sm:text-xl">
              Your wedding plan
            </p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              {summaryParts.join(" ┬╖ ")}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="btn-editorial hidden h-9 rounded-none px-5 lg:inline-flex"
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              {sorted.length} components
            </p>
            <h2 className="mt-1 font-heading text-2xl tracking-tight sm:text-3xl">
              Curated for your day
            </h2>
          </div>
          <p className="text-sm text-[var(--ink-soft)]">
            Avg. {formatCurrency(sorted.length ? Math.round(allocated / sorted.length) : 0)}{" "}
            per item
          </p>
        </motion.div>

        {sorted.length === 0 ? (
          <div className="surface-panel px-6 py-16 text-center">
            <p className="font-heading text-2xl">Your plan is empty</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add a component to start rebuilding your budget.
            </p>
            <Button
              type="button"
              className="btn-editorial mt-6 h-11 px-8"
              onClick={() => setAddOpen(true)}
            >
              Add component
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {sorted.map((component, index) => (
                <PlanCard
                  key={component.id}
                  component={component}
                  index={index}
                  totalBudget={plan.totalBudget}
                  onRemove={() => removeComponent(component.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="btn-editorial h-11 rounded-none px-8"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-4" />
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
