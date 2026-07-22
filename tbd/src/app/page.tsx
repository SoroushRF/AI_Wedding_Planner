"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LandingView } from "@/components/LandingView";
import { LoadingView } from "@/components/LoadingView";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { PlannerView } from "@/components/planner/PlannerView";
import { usePlanStore } from "@/lib/store";

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const view = usePlanStore((s) => s.view);
  const plan = usePlanStore((s) => s.plan);
  const setView = usePlanStore((s) => s.setView);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (plan && view === "landing") {
      setView("planner");
    }
  }, [mounted, plan, view, setView]);

  if (!mounted) {
    return <main className="relative z-10 min-h-screen bg-background" />;
  }

  return (
    <main className="relative z-10 min-h-screen">
      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div key="landing" {...pageTransition}>
            <LandingView />
          </motion.div>
        )}
        {view === "form" && (
          <motion.div key="form" {...pageTransition}>
            <OnboardingForm />
          </motion.div>
        )}
        {view === "loading" && (
          <motion.div key="loading" {...pageTransition}>
            <LoadingView />
          </motion.div>
        )}
        {view === "planner" && plan && (
          <motion.div key="planner" {...pageTransition}>
            <PlannerView />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
