"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Camera,
  Car,
  Flower2,
  Heart,
  Music,
  Package,
  Shirt,
  Sparkles,
  Utensils,
  X,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { ease } from "@/lib/motion";
import type { PlanCategory, PlanComponent } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<PlanCategory, LucideIcon> = {
  catering: Utensils,
  florals: Flower2,
  photography: Camera,
  venue: Building2,
  entertainment: Music,
  attire: Shirt,
  decor: Sparkles,
  officiant: Heart,
  transport: Car,
  other: Package,
};

const PRIORITY_STYLES = {
  essential: "border-foreground/20 bg-foreground text-background",
  recommended: "border-[var(--brand-accent)]/50 bg-[var(--brand-accent)]/15 text-foreground",
  optional: "border-border bg-muted/70 text-muted-foreground",
};

interface PlanCardProps {
  component: PlanComponent;
  index: number;
  totalBudget: number;
  onRemove: () => void;
}

export function PlanCard({
  component,
  index,
  totalBudget,
  onRemove,
}: PlanCardProps) {
  const [showRationale, setShowRationale] = useState(false);
  const Icon = CATEGORY_ICONS[component.category] ?? Package;
  const share =
    totalBudget > 0
      ? Math.round((component.estimatedCost / totalBudget) * 100)
      : 0;

  const handleRemove = () => {
    if (window.confirm(`Remove "${component.name}" from your plan?`)) {
      onRemove();
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.05, 0.35),
        ease,
      }}
      className="group relative surface-panel p-5 transition-colors hover:border-[var(--gold)]/50"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="absolute right-2 top-2 text-muted-foreground opacity-70 transition-opacity group-hover:opacity-100"
        onClick={handleRemove}
        aria-label={`Remove ${component.name}`}
      >
        <X className="size-4" />
      </Button>

      <div className="flex gap-4 pr-7">
        <div className="flex size-11 shrink-0 items-center justify-center border border-border bg-background/70">
          <Icon className="size-5 text-[var(--gold)]" />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {component.category}
              </p>
              <h3 className="mt-1 font-heading text-xl leading-snug tracking-tight">
                {component.name}
              </h3>
            </div>
            <div className="text-right">
              <p className="font-heading text-xl tabular-nums tracking-tight">
                {formatCurrency(component.estimatedCost)}
              </p>
              <p className="text-[11px] text-muted-foreground">{share}% of budget</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
            {component.description}
          </p>

          <div className="h-1 w-full overflow-hidden bg-border/70">
            <div
              className="h-full bg-[var(--brand-accent)]"
              style={{ width: `${Math.min(100, share)}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <Badge
              variant="outline"
              className={cn(
                "rounded-none px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]",
                PRIORITY_STYLES[component.priority]
              )}
            >
              {component.priority}
            </Badge>
            <button
              type="button"
              className="text-xs text-[var(--ink-soft)] underline-offset-4 hover:text-foreground hover:underline"
              onClick={() => setShowRationale((v) => !v)}
            >
              {showRationale ? "Hide why" : "Why this?"}
            </button>
          </div>

          <AnimatePresence>
            {showRationale && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease }}
                className="overflow-hidden border-l-2 border-[var(--gold)] pl-3 text-xs leading-relaxed text-muted-foreground"
              >
                {component.rationale}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}
