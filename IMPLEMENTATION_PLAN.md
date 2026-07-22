# TBD — Implementation Plan
Epic → Phases → Tasks → Steps
**Hackathon pair build · ~1 hour · Gemini AI**

---

## Ownership Split (read this first)

| Person | Domain | Owns (exclusive) |
|---|---|---|
| **Soroush** | Backend / data / AI | `lib/types.ts`, `lib/store.ts`, `lib/prompts.ts`, `app/api/generate/route.ts`, `.env.local`, API error/retry logic |
| **Parsa** | Frontend / UI / design | `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `components/**`, shadcn UI setup, Framer Motion |

**Hard rule:** Do not edit files outside your domain. Consume the other person's public contract only.

**Integration contract (Soroush ships first, then freeze):**
- Types in `lib/types.ts`
- Store actions/selectors in `lib/store.ts`
- `POST /api/generate` request = `WeddingFormData`, response = `{ components: PlanComponent[], totalBudget: number }`

**Suggested 60-min timeline**

| Min | Soroush | Parsa |
|---|---|---|
| 0–10 | Scaffold + deps + types | Wait for scaffold OR pull; start design tokens in globals once repo exists |
| 10–25 | Zustand store + localStorage | Landing + LoadingView shell |
| 25–45 | Prompts + Gemini `/api/generate` | OnboardingForm + PlannerView cards |
| 45–55 | Wire API validation / retry / budget scale | Wire form → store → API → planner views |
| 55–60 | Env on Vercel + smoke API | Responsive / demo polish |

---

## Epic 0: Shared Kickoff — **Soroush**

### Phase 0.1 — Scaffold

**Task: Initialize Next.js project** — Soroush
- Run `npx create-next-app@latest . --typescript --tailwind --app` (in repo root)
- Select: App Router yes, src/ directory **no** (use `/app` at root for simpler paths), import alias yes (`@/*`)
- Commit scaffold so Parsa can pull immediately

**Task: Install shared dependencies** — Soroush
- `npm install framer-motion zustand @google/generative-ai`
- Tell Parsa when package.json is pushed so he can `npm install`

**Task: Configure environment** — Soroush
- Create `.env.local` at root
- Add `GEMINI_API_KEY=your_key_here`
- Ensure `.env.local` is in `.gitignore`
- Create empty stubs Parsa expects:
  - `app/api/generate/route.ts` (export placeholder until Epic 3)
  - `lib/types.ts`, `lib/store.ts`, `lib/prompts.ts`
  - Empty dirs: `components/onboarding/`, `components/planner/`

**Task: Hand off** — Soroush
- Push scaffold + types ASAP
- Ping Parsa: "types frozen, pull and start UI"

---

## Epic 1: Data Layer — **Soroush only**

### Phase 1.1 — Type Definitions

**Task: Define shared types in `/lib/types.ts`** — Soroush
- Define `WeddingFormData`:
  - budget: number
  - location: string
  - weddingDate: string (ISO date `YYYY-MM-DD`)
  - weddingTime?: string (`HH:mm`)
  - guestCount: number
  - venueType: 'ballroom' | 'garden' | 'destination' | 'intimate'
  - vibe?: 'blacktie' | 'rustic' | 'boho' | 'minimalist' | 'romantic'

- Define `PlanComponent`:
  - id: string
  - category: 'catering' | 'florals' | 'photography' | 'venue' | 'entertainment' | 'attire' | 'decor' | 'officiant' | 'transport' | 'other'
  - name: string
  - description: string
  - estimatedCost: number
  - priority: 'essential' | 'recommended' | 'optional'
  - rationale: string

- Define `WeddingPlan`:
  - components: PlanComponent[]
  - totalBudget: number
  - generatedAt: string (ISO timestamp)
  - formData: WeddingFormData

- Define `GeneratePlanResponse`:
  - components: PlanComponent[]
  - totalBudget: number

- Export these types. **Freeze after first push** unless both agree in chat.

### Phase 1.2 — Zustand Store

**Task: Build plan store in `/lib/store.ts`** — Soroush
- State shape:
  - formData: WeddingFormData | null
  - plan: WeddingPlan | null
  - isGenerating: boolean
  - view: 'landing' | 'form' | 'loading' | 'planner'
  - error: string | null

- Actions (stable signatures for Parsa):
  - `setFormData(data: WeddingFormData)`
  - `setPlan(plan: WeddingPlan)`
  - `setView(view)`
  - `setGenerating(bool)`
  - `setError(message: string | null)`
  - `removeComponent(id: string)`
  - `addComponent(component: PlanComponent)`
  - `clearPlan()` — clears plan + error; keeps formData for prefill; sets view to `'form'`

- Persist middleware:
  - Persist: `plan`, `formData`
  - Do NOT persist: `isGenerating`, `view`, `error`

---

## Epic 2: AI Layer (Gemini) — **Soroush only**

### Phase 2.1 — Prompt Engineering

**Task: Build prompt constructor in `/lib/prompts.ts`** — Soroush
- Export `buildSystemPrompt()`:
  - Luxury wedding planning consultant persona
  - Return ONLY valid JSON array — no markdown fences, no preamble
  - Exact `PlanComponent` schema
  - Constraints: min 6, max 12 components; sum of `estimatedCost` ≤ budget
  - Factor location + date/time into realistic category spend (e.g. destination travel, seasonal florals)

- Export `buildUserPrompt(data: WeddingFormData)`:
  - Natural-language brief including budget, location, date, time (if any), guest count, venue type, vibe
  - Append: sum of estimatedCost must not exceed budget

### Phase 2.2 — API Route

**Task: Build `/api/generate/route.ts`** — Soroush
- Accept POST, parse body as `WeddingFormData`
- Validate required: `budget`, `location`, `weddingDate`, `guestCount`, `venueType` — 400 if missing
- Instantiate Google Generative AI client with `GEMINI_API_KEY`
- Call Gemini:
  - model: `gemini-2.0-flash`
  - system instruction: `buildSystemPrompt()`
  - user content: `buildUserPrompt(formData)`
- Extract text from response
- `JSON.parse` — on failure, retry once; then 500 with structured error
- Post-process: if sum(estimatedCost) > budget, scale costs proportionally (round to integers)
- Ensure each component has an `id` (generate uuid if model omits)
- Return 200: `{ components: PlanComponent[], totalBudget: budget }`

---

## Epic 3: Design System & Shell — **Parsa only**

### Phase 3.1 — Visual foundation

**Task: Install shadcn + UI primitives** — Parsa
- `npx shadcn@latest init` (style: default, base color: neutral)
- `npx shadcn@latest add button card badge dialog slider input select`

**Task: Fonts and global styles** — Parsa
- In `app/layout.tsx`, import Playfair Display + Inter from `next/font/google`
- In `globals.css` set:
  - `--background: #FAFAF8`
  - `--foreground: #1C1C1E`
  - `--accent: #C9A99A`
  - `--gold: #B8A88A`
- Body uses those variables
- Soft grain / texture background only — no stock wedding photos

**Task: App shell / view router in `app/page.tsx`** — Parsa
- Read `view` from Zustand store
- Render: landing | form | loading | planner
- Do not implement API or store internals — only call store actions

---

## Epic 4: Landing & Loading — **Parsa only**

### Phase 4.1 — Landing

**Task: Landing hero in `app/page.tsx` (or `components/LandingView.tsx`)** — Parsa
- Full-viewport, center-aligned
- Heading: "TBD" (Playfair Display)
- Subheading: "Your wedding, thoughtfully planned."
- CTA: "Start Planning" → `setView('form')`
- Framer Motion fade-in on mount

### Phase 4.2 — Loading

**Task: Build `/components/LoadingView.tsx`** — Parsa
- Centered full-page
- Soft pulsing circle in accent color
- Rotating messages every 2s via `AnimatePresence`:
  - "Reviewing your priorities…"
  - "Allocating your budget thoughtfully…"
  - "Curating your vendor categories…"
  - "Finalizing your plan…"

---

## Epic 5: Onboarding Form — **Parsa only**

### Phase 5.1 — Form UI + submit wiring

**Task: Build `/components/onboarding/OnboardingForm.tsx`** — Parsa

- Budget: slider min 1000 max 150000 step 500 + synced manual input; live `$XX,XXX`
- Location: text input, required (placeholder e.g. "Toronto, ON")
- Wedding date: date input, required
- Wedding time: time input, optional
- Guest count: number 10–500; hint "Including ceremony and reception"
- Venue type: 4 selectable cards — Indoor Ballroom / Outdoor Garden / Destination / Intimate Venue
- Vibe (optional): Black Tie / Rustic / Boho / Minimalist / Romantic
- Prefill from `formData` in store when returning via Start Over
- Submit disabled until budget, location, weddingDate, guestCount, venueType filled
- On submit:
  1. `setFormData(data)`
  2. `setView('loading')` + `setGenerating(true)` + `setError(null)`
  3. `POST /api/generate` with JSON body
  4. Success → `setPlan({...})` → `setView('planner')`
  5. Failure → toast/inline error → `setView('form')`
  6. Always `setGenerating(false)`

**Do not** change prompt text, API route, or type shapes — if a field is missing from types, ask Soroush.

---

## Epic 6: Planner View — **Parsa only**

### Phase 6.1 — Budget Bar

**Task: `/components/planner/BudgetBar.tsx`** — Parsa
- Props: `totalBudget`, `allocatedAmount`
- Show Total / Allocated / Remaining
- Progress fill = allocated / total
- Colors: remaining >20% green · 5–20% amber · <5% red
- Animate fill with Framer Motion

### Phase 6.2 — Plan Card

**Task: `/components/planner/PlanCard.tsx`** — Parsa
- Props: `component: PlanComponent`, `onRemove: () => void`
- Layout: category icon | name + description | cost
- Priority badge + expandable rationale
- Remove (confirm) → call `onRemove` (parent uses `removeComponent`)
- Entry: fade + slideUp, stagger by index

### Phase 6.3 — Planner layout

**Task: `/components/planner/PlannerView.tsx`** — Parsa
- Header: "TBD" | summary (`location · date · guestCount · vibe`) | "Start Over" (confirm → `clearPlan`)
- Sticky BudgetBar
- 2-col grid desktop / 1-col mobile
- "Add Component" → modal

### Phase 6.4 — Add Component Modal

**Task: `/components/planner/AddComponentModal.tsx`** — Parsa
- Dialog: name, category select (from type enum), estimated cost > 0
- On confirm: uuid id, priority `'optional'`, rationale `'Manually added'`, `addComponent(...)`

---

## Epic 7: Polish & Deploy

### Phase 7.1 — Responsive + UI errors — **Parsa**
- Form usable on mobile; cards single-col below `md`
- Budget bar readable at 375px
- Fetch failure toast: "Something went wrong. Try again."

### Phase 7.2 — API robustness — **Soroush**
- Structured JSON errors from `/api/generate`
- Gemini unparseable JSON: retry once, then error payload
- Confirm budget scaling works

### Phase 7.3 — Persistence check — **together (5 min)**
- Generate → refresh → plan still there
- Start Over clears plan correctly; form prefills

### Phase 7.4 — Deploy — **Soroush owns env; either can trigger**
- Push to GitHub → Vercel
- Add `GEMINI_API_KEY` (Production + Preview)
- Verify `/api/generate` on production URL

### Phase 7.5 — Demo dry run — **together**
- Full flow ×2
- Confirm <10s generation, add/remove updates budget
- Backup screenshot of a generated plan

---

## File ownership checklist

### Soroush — may edit
- `lib/types.ts`
- `lib/store.ts`
- `lib/prompts.ts`
- `app/api/generate/route.ts`
- `.env.local` / Vercel env docs
- Root scaffold (`package.json`, `tsconfig`, etc.) until handoff — then avoid UI files

### Parsa — may edit
- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `components/LandingView.tsx` (if split)
- `components/LoadingView.tsx`
- `components/onboarding/**`
- `components/planner/**`
- `components/ui/**` (shadcn)

### Neither edits the other's files
If blocked by a missing type/action/API field → message in chat, owner updates their file, other pulls.
