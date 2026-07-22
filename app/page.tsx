"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LandingView } from "@/components/LandingView";
import { LoadingView } from "@/components/LoadingView";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { PlannerView } from "@/components/planner/PlannerView";
import { fadeSlide } from "@/lib/motion";
import { useWeddingStore } from "@/lib/store";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const view = useWeddingStore((s) => s.view);
  const plan = useWeddingStore((s) => s.plan);
  const setView = useWeddingStore((s) => s.setView);

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
          <motion.div key="landing" {...fadeSlide}>
            <LandingView />
          </motion.div>
        )}
        {view === "form" && (
          <motion.div key="form" {...fadeSlide}>
            <OnboardingForm />
          </motion.div>
        )}
        {view === "loading" && (
          <motion.div key="loading" {...fadeSlide}>
            <LoadingView />
          </motion.div>
        )}
        {view === "planner" && plan && (
          <motion.div key="planner" {...fadeSlide}>
            <PlannerView />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
