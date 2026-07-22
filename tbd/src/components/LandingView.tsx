"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useWeddingStore } from "@/lib/store";

export function LandingView() {
  const setView = useWeddingStore((s) => s.setView);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.div
        className="max-w-lg space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Wedding planning
          </p>
          <h1 className="font-heading text-6xl font-medium tracking-tight text-foreground sm:text-7xl">
            TBD
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Your wedding, thoughtfully planned.
          </p>
        </div>
        <div
          className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent"
          aria-hidden
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Button
            size="lg"
            className="h-11 min-w-[180px] rounded-none border border-foreground bg-foreground px-8 text-sm uppercase tracking-widest text-background hover:bg-foreground/90"
            onClick={() => setView("form")}
          >
            Start Planning
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
