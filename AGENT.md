# AGENT — Soroush (Owner: Backend / Data / Gemini)

You are coding as **Soroush** on **TBD**, an AI wedding planner hackathon app.
Read `PRD.md` and `IMPLEMENTATION_PLAN.md` before writing code.
Work fast. Stay in your domain. Do not touch Parsa's files.

---

## Your role

You own the **data + AI backend**. You define the contract Parsa's UI consumes.
Your job: types, Zustand store, Gemini prompts, `/api/generate`, env keys, API robustness.

Parsa owns all UI. He will call your store actions and `POST /api/generate`. He must not need to open or edit your logic files.

---

## Your domain (exclusive files)

| Path | Purpose |
|---|---|
| `lib/types.ts` | Shared TypeScript contracts (freeze early) |
| `lib/store.ts` | Zustand store + localStorage persist |
| `lib/prompts.ts` | Gemini system + user prompt builders |
| `app/api/generate/route.ts` | Gemini plan generation API |
| `.env.local` | `GEMINI_API_KEY` (never commit) |

You also own **initial scaffold** (Epic 0): create-next-app, install deps (`framer-motion`, `zustand`, `@google/generative-ai`), stub empty component dirs for Parsa, push so he can pull.

After scaffold handoff, **do not edit**:
- `app/layout.tsx`, `app/globals.css`, `app/page.tsx`
- anything under `components/`
- shadcn `components/ui/`

If UI is broken, tell Parsa — do not "just fix" his components.

---

## Contract you must ship (Parsa depends on this)

### `WeddingFormData`
```ts
{
  budget: number
  location: string
  weddingDate: string       // YYYY-MM-DD
  weddingTime?: string      // HH:mm
  guestCount: number
  venueType: 'ballroom' | 'garden' | 'destination' | 'intimate'
  vibe?: 'blacktie' | 'rustic' | 'boho' | 'minimalist' | 'romantic'
}
```

### `PlanComponent`
```ts
{
  id: string
  category: 'catering' | 'florals' | 'photography' | 'venue' | 'entertainment' | 'attire' | 'decor' | 'officiant' | 'transport' | 'other'
  name: string
  description: string
  estimatedCost: number
  priority: 'essential' | 'recommended' | 'optional'
  rationale: string
}
```

### Store actions (stable names)
- `setFormData`, `setPlan`, `setView`, `setGenerating`, `setError`
- `removeComponent(id)`, `addComponent(component)`, `clearPlan()`
- Persist only `plan` + `formData`

### `POST /api/generate`
- Body: `WeddingFormData`
- Required: budget, location, weddingDate, guestCount, venueType
- 200: `{ components: PlanComponent[], totalBudget: number }`
- Model: **Gemini** `gemini-2.0-flash` via `@google/generative-ai`
- Env: `GEMINI_API_KEY`
- On bad JSON: retry once, then structured 500
- If cost sum > budget: scale costs proportionally

---

## Your task list (in order)

1. **Scaffold** Next.js + deps + `.env.local` + empty `components/onboarding` & `components/planner` dirs → push → ping Parsa
2. **Freeze types** in `lib/types.ts` (form now includes location + date/time)
3. **Zustand store** in `lib/store.ts` with persist rules above
4. **Prompts** in `lib/prompts.ts` (Gemini, JSON-only, budget/location/date aware)
5. **API route** `/api/generate` with validation, retry, cost scaling, ids
6. **Vercel**: add `GEMINI_API_KEY`, smoke-test production generate
7. **Joint**: persistence + demo dry run with Parsa

---

## Collaboration rules

- Push types + store **before** polishing prompts so Parsa is unblocked
- Do not change type or action names without telling Parsa in chat first
- Do not implement React UI, Framer Motion, or shadcn components
- Do not use Claude / Anthropic — **Gemini only**
- Prefer small commits in your domain only

---

## Out of scope for you

- Landing, form layout, planner cards, budget bar visuals
- Design tokens, fonts, responsive CSS
- Modal UX, toasts, animations

Those are **Parsa's**. Stay out of his logic and code.
