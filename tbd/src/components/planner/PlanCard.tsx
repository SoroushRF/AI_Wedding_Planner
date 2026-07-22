"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Car,
  Flower2,
  Music,
  Shirt,
  Sparkles,
  Utensils,
  X,
  type LucideIcon,
  Building2,
  Heart,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  essential: "border-foreground/20 bg-foreground/5 text-foreground",
  recommended: "border-[var(--brand-accent)]/40 bg-[var(--brand-accent)]/10",
  optional: "border-border bg-muted text-muted-foreground",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

interface PlanCardProps {
  component: PlanComponent;
  index: number;
  onRemove: () => void;
}

export function PlanCard({ component, index, onRemove }: PlanCardProps) {
  const [showRationale, setShowRationale] = useState(false);
  const Icon = CATEGORY_ICONS[component.category] ?? Package;

  const handleRemove = () => {
    if (window.confirm(`Remove "${component.name}" from your plan?`)) {
      onRemove();
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="relative border border-border bg-card p-5 shadow-sm"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="absolute right-2 top-2 text-muted-foreground"
        onClick={handleRemove}
        aria-label={`Remove ${component.name}`}
      >
        <X className="size-4" />
      </Button>
      <div className="flex gap-4 pr-8">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="size-5 text-foreground/70" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-medium leading-snug">{component.name}</h3>
            <p className="shrink-0 text-sm font-medium tabular-nums">
              {formatCurrency(component.estimatedCost)}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{component.description}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge
              variant="outline"
              className={cn("rounded-full capitalize", PRIORITY_STYLES[component.priority])}
            >
              {component.priority}
            </Badge>
            <button
              type="button"
              className="text-xs text-[var(--gold)] underline-offset-2 hover:underline"
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
                className="overflow-hidden text-xs text-muted-foreground"
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
