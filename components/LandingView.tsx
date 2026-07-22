"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useWeddingStore } from "@/lib/store";
import { ease, fadeUp } from "@/lib/motion";

export function LandingView() {
  const setView = useWeddingStore((s) => s.setView);

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <motion.div
          className="absolute -left-24 top-16 size-[28rem] rounded-full bg-[var(--brand-accent)]/20 blur-3xl"
          animate={{ opacity: [0.35, 0.55, 0.35], x: [0, 18, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-20 bottom-10 size-[24rem] rounded-full bg-[var(--gold)]/25 blur-3xl"
          animate={{ opacity: [0.3, 0.5, 0.3], y: [0, -16, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <p className="font-heading text-lg tracking-tight">TBD</p>
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Thoughtful planning
        </p>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <motion.p
          className="mb-6 text-[11px] uppercase tracking-[0.38em] text-[var(--ink-soft)]"
          {...fadeUp(0)}
        >
          AI wedding planner
        </motion.p>

        <motion.h1
          className="font-heading text-[clamp(4.5rem,14vw,9rem)] font-medium leading-[0.9] tracking-[-0.04em] text-foreground"
          {...fadeUp(0.08)}
        >
          TBD
        </motion.h1>

        <motion.div
          className="editorial-rule mx-auto my-8 w-40"
          initial={{ opacity: 0, scaleX: 0.4 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.25, duration: 0.55, ease }}
        />

        <motion.p
          className="max-w-md text-lg leading-relaxed text-[var(--ink-soft)] sm:text-xl"
          {...fadeUp(0.18)}
        >
          Your wedding, thoughtfully planned.
        </motion.p>

        <motion.div className="mt-10" {...fadeUp(0.28)}>
          <Button
            size="lg"
            className="btn-editorial h-12 min-w-[220px] border border-foreground bg-foreground px-10 text-background transition-colors hover:bg-foreground/90"
            onClick={() => setView("form")}
          >
            Start Planning
          </Button>
        </motion.div>

        <motion.p
          className="mt-8 text-xs tracking-wide text-muted-foreground"
          {...fadeUp(0.38)}
        >
          Personalized plan in under a minute
        </motion.p>
      </div>
    </section>
  );
}
