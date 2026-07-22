import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppView,
  PlanComponent,
  WeddingFormData,
  WeddingPlan,
} from "@/lib/types";

interface WeddingStoreState {
  formData: WeddingFormData | null;
  plan: WeddingPlan | null;
  isGenerating: boolean;
  view: AppView;
  error: string | null;
  setFormData: (data: WeddingFormData) => void;
  setPlan: (plan: WeddingPlan) => void;
  setView: (view: AppView) => void;
  setGenerating: (isGenerating: boolean) => void;
  setError: (message: string | null) => void;
  removeComponent: (id: string) => void;
  addComponent: (component: PlanComponent) => void;
  clearPlan: () => void;
}

export const useWeddingStore = create<WeddingStoreState>()(
  persist(
    (set) => ({
      formData: null,
      plan: null,
      isGenerating: false,
      view: "landing",
      error: null,

      setFormData: (data) => set({ formData: data }),

      setPlan: (plan) => set({ plan }),

      setView: (view) => set({ view }),

      setGenerating: (isGenerating) => set({ isGenerating }),

      setError: (message) => set({ error: message }),

      removeComponent: (id) =>
        set((state) => {
          if (!state.plan) return state;
          return {
            plan: {
              ...state.plan,
              components: state.plan.components.filter(
                (component) => component.id !== id
              ),
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
          view: "form",
        }),
    }),
    {
      name: "tbd-wedding-plan",
      partialize: (state) => ({
        plan: state.plan,
        formData: state.formData,
      }),
    }
  )
);
