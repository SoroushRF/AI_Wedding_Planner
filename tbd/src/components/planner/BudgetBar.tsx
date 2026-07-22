"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface BudgetBarProps {
  totalBudget: number;
  allocatedAmount: number;
}

export function BudgetBar({ totalBudget, allocatedAmount }: BudgetBarProps) {
  const remaining = totalBudget - allocatedAmount;
  const over = remaining < 0;
  const remainingSafe = Math.max(0, remaining);
  const remainingRatio = totalBudget > 0 ? remainingSafe / totalBudget : 0;
  const fillRatio = totalBudget > 0 ? Math.min(1.05, allocatedAmount / totalBudget) : 0;

  let tone = "text-emerald-700";
  let bar = "bg-emerald-700";
  if (over) {
    tone = "text-red-700";
    bar = "bg-red-600";
  } else if (remainingRatio < 0.05) {
    tone = "text-red-700";
    bar = "bg-red-600";
  } else if (remainingRatio < 0.2) {
    tone = "text-amber-700";
    bar = "bg-amber-500";
  }

  return (
    <div className="border-b border-border/80 bg-[#f7f4ef]/90 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="grid grid-cols-3 gap-3 text-sm sm:gap-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Total
            </p>
            <p className="mt-1 font-heading text-xl tracking-tight sm:text-2xl">
              {formatCurrency(totalBudget)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Allocated
            </p>
            <p className="mt-1 font-heading text-xl tracking-tight sm:text-2xl">
              {formatCurrency(allocatedAmount)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {over ? "Over budget" : "Remaining"}
            </p>
            <p className={cn("mt-1 font-heading text-xl tracking-tight sm:text-2xl", tone)}>
              {formatCurrency(Math.abs(remaining))}
            </p>
          </div>
        </div>

        <div className="h-1.5 w-full overflow-hidden bg-border/80">
          <motion.div
            className={cn("h-full", bar)}
            initial={false}
            animate={{ width: `${Math.min(100, fillRatio * 100)}%` }}
            transition={{ duration: 0.4, ease }}
          />
        </div>
      </div>
    </div>
  );
}
