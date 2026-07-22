"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppView,
  PlanComponent,
  WeddingFormData,
  WeddingPlan,
} from "@/lib/types";

interface PlanState {
  formData: WeddingFormData | null;
  plan: WeddingPlan | null;
  isGenerating: boolean;
  view: AppView;
  error: string | null;
  setFormData: (data: WeddingFormData) => void;
  setPlan: (plan: WeddingPlan) => void;
  setView: (view: AppView) => void;
  setGenerating: (value: boolean) => void;
  setError: (message: string | null) => void;
  removeComponent: (id: string) => void;
  addComponent: (component: PlanComponent) => void;
  clearPlan: () => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      formData: null,
      plan: null,
      isGenerating: false,
      view: "landing",
      error: null,
      setFormData: (data) => set({ formData: data }),
      setPlan: (plan) => set({ plan, error: null }),
      setView: (view) => set({ view }),
      setGenerating: (isGenerating) => set({ isGenerating }),
      setError: (error) => set({ error }),
      removeComponent: (id) =>
        set((state) => {
          if (!state.plan) return state;
          return {
            plan: {
              ...state.plan,
              components: state.plan.components.filter((c) => c.id !== id),
            },
          };
        }),
      addComponent: (component) =>
        set((state) => {
          if (!state.plan) return state;
          return {
            plan: {
              ...state.plan,
              components: [...state.plan.components, component],
            },
          };
        }),
      clearPlan: () =>
        set({
          plan: null,
          error: null,
          isGenerating: false,
        }),
    }),
    {
      name: "tbd-wedding-plan",
      partialize: (state) => ({
        formData: state.formData,
        plan: state.plan,
      }),
    }
  )
);
