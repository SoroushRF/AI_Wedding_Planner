"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MESSAGES = [
  "Reviewing your priorities…",
  "Allocating your budget thoughtfully…",
  "Curating your vendor categories…",
  "Finalizing your plan…",
];

export function LoadingView() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        className="relative flex size-20 items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.span
          className="absolute inset-0 rounded-full border border-[var(--brand-accent)]/30"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="size-3 rounded-full bg-[var(--brand-accent)]"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <div className="mt-10 h-8 overflow-hidden text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={MESSAGES[index]}
            className="text-sm tracking-wide text-muted-foreground"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {MESSAGES[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
}
