"use client";

import { motion } from "framer-motion";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

interface BudgetBarProps {
  totalBudget: number;
  allocatedAmount: number;
}

export function BudgetBar({ totalBudget, allocatedAmount }: BudgetBarProps) {
  const remaining = Math.max(0, totalBudget - allocatedAmount);
  const remainingRatio = totalBudget > 0 ? remaining / totalBudget : 0;
  const fillRatio = totalBudget > 0 ? Math.min(1, allocatedAmount / totalBudget) : 0;

  let barColor = "bg-emerald-600";
  if (remainingRatio < 0.05) barColor = "bg-red-600";
  else if (remainingRatio < 0.2) barColor = "bg-amber-500";

  return (
    <div className="border-b border-border bg-background/95 px-4 py-4 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid grid-cols-3 gap-4 text-sm sm:flex sm:gap-10">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Total
            </p>
            <p className="font-medium">{formatCurrency(totalBudget)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Allocated
            </p>
            <p className="font-medium">{formatCurrency(allocatedAmount)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Remaining
            </p>
            <p className="font-medium">{formatCurrency(remaining)}</p>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted sm:max-w-md">
          <motion.div
            className={`h-full ${barColor}`}
            initial={false}
            animate={{ width: `${fillRatio * 100}%` }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
      </div>
    </div>
  );
}
