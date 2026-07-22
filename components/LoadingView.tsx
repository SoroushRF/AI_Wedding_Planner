"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ease } from "@/lib/motion";

const STEPS = [
  "Reviewing your prioritiesΓÇª",
  "Mapping venue and guest scaleΓÇª",
  "Allocating your budget thoughtfullyΓÇª",
  "Curating vendor categoriesΓÇª",
  "Finalizing your planΓÇª",
];

export function LoadingView() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % STEPS.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const progress = ((index + 1) / STEPS.length) * 100;

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        className="relative flex size-28 items-center justify-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
      >
        <motion.span
          className="absolute inset-0 rounded-full border border-[var(--brand-accent)]/25"
          animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.15, 0.45] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute inset-4 rounded-full border border-[var(--gold)]/40"
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <span className="font-heading text-2xl tracking-tight text-foreground">TBD</span>
      </motion.div>

      <div className="mt-12 h-8 overflow-hidden text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={STEPS[index]}
            className="text-sm tracking-wide text-[var(--ink-soft)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease }}
          >
            {STEPS[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-8 h-[2px] w-48 overflow-hidden bg-border">
        <motion.div
          className="h-full bg-[var(--brand-accent)]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease }}
        />
      </div>

      <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        Crafting your plan
      </p>
    </section>
  );
}
