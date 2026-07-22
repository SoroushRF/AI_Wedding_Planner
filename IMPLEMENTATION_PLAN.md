# TBD — Implementation Plan
Epic → Phases → Tasks → Steps

---

## Epic 1: Project Foundation

### Phase 1.1 — Scaffold & Config

**Task: Initialize Next.js project**
- Run `npx create-next-app@latest tbd --typescript --tailwind --app`
- Select: App Router yes, src/ directory yes, import alias yes (@/*)
- cd into project, open in Cursor

**Task: Install dependencies**
- `npm install framer-motion zustand @anthropic-ai/sdk`
- `npx shadcn@latest init` (select style: default, base color: neutral)
- `npx shadcn@latest add button card badge dialog slider input select`

**Task: Configure environment**
- Create `.env.local` at root
- Add `ANTHROPIC_API_KEY=your_key_here`
- Add `.env.local` to `.gitignore`

**Task: Set up fonts and global styles**
- In `app/layout.tsx`, import Playfair Display + Inter from next/font/google
- Define CSS variables in `globals.css`:
  - --background: #FAFAF8
  - --foreground: #1C1C1E
  - --accent: #C9A99A
  - --gold: #B8A88A
- Set `body` bg and text color from variables

**Task: Set up folder structure**
- Create `/app/api/generate/route.ts` (empty)
- Create `/components/onboarding/` directory
- Create `/components/planner/` directory
- Create `/lib/store.ts` (Zustand store)
- Create `/lib/types.ts` (shared TypeScript types)
- Create `/lib/prompts.ts` (Claude prompt builder)

---

## Epic 2: Data Layer

### Phase 2.1 — Type Definitions

**Task: Define shared types in `/lib/types.ts`**
- Define `WeddingFormData`:
  - budget: number
  - guestCount: number
  - venueType: 'ballroom' | 'garden' | 'destination' | 'intimate'
  - stylePriorities: string[] (max 3)
  - vibe?: 'blacktie' | 'rustic' | 'boho' | 'minimalist' | 'romantic'

- Define `PlanComponent`:
  - id: string
  - category: enum (catering | florals | photography | venue | entertainment | attire | decor | officiant | transport | other)
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

### Phase 2.2 — Zustand Store

**Task: Build plan store in `/lib/store.ts`**
- Define state shape:
  - formData: WeddingFormData | null
  - plan: WeddingPlan | null
  - isGenerating: boolean
  - view: 'landing' | 'form' | 'loading' | 'planner'

- Define actions:
  - setFormData(data: WeddingFormData)
  - setPlan(plan: WeddingPlan)
  - setView(view)
  - setGenerating(bool)
  - removeComponent(id: string)
  - addComponent(component: PlanComponent)
  - clearPlan()

- Wire localStorage persistence:
  - Use Zustand persist middleware
  - Persist: plan, formData
  - Do NOT persist: isGenerating, view

---

## Epic 3: AI Layer

### Phase 3.1 — Prompt Engineering

**Task: Build prompt constructor in `/lib/prompts.ts`**
- Export function `buildSystemPrompt()`:
  - Returns a string establishing Claude as a luxury wedding planning consultant
  - Instructs Claude to return ONLY valid JSON, no markdown fences, no preamble
  - Defines the exact JSON schema (array of PlanComponent objects)
  - States constraints: min 6 components, max 12, total cost must not exceed budget
  - Instructs Claude to distribute budget realistically by category weight

- Export function `buildUserPrompt(data: WeddingFormData)`:
  - Interpolates all form fields into a natural language brief
  - Example: "Plan a [vibe] wedding for [guestCount] guests at a [venueType] venue with a total budget of $[budget]. Style priorities: [stylePriorities]. Return the plan as a JSON array..."
  - Appends: "Ensure the sum of all estimatedCost values does not exceed [budget]."

### Phase 3.2 — API Route

**Task: Build `/api/generate/route.ts`**
- Accept POST, parse body as WeddingFormData
- Validate required fields (budget, guestCount, venueType) — return 400 if missing
- Instantiate Anthropic client from SDK using env var
- Call `client.messages.create()`:
  - model: 'claude-sonnet-4-6'
  - max_tokens: 2000
  - system: buildSystemPrompt()
  - messages: [{ role: 'user', content: buildUserPrompt(formData) }]
- Extract text from response content block
- JSON.parse the text — catch parse errors, return 500 with message
- Post-process: if sum of estimatedCost > budget, scale all costs down proportionally
- Return 200 with { components: PlanComponent[], totalBudget: budget }

---

## Epic 4: UI — Landing Page

### Phase 4.1 — Landing Page Layout

**Task: Build `app/page.tsx` as landing entry**
- Full-viewport hero section:
  - Center-aligned
  - Display heading: "TBD" in Playfair Display, large
  - Subheading: "Your wedding, thoughtfully planned."
  - CTA button: "Start Planning" → sets view to 'form' in store
- Background: subtle off-white texture or soft grain CSS filter, no images
- Animate CTA in with Framer Motion fadeInUp on mount

---

## Epic 5: UI — Onboarding Form

### Phase 5.1 — Form Component

**Task: Build `/components/onboarding/OnboardingForm.tsx`**

- Step 1 — Budget:
  - Label: "What's your total wedding budget?"
  - shadcn Slider component, min 1000, max 150000, step 500
  - Live formatted display: "$XX,XXX"
  - Manual text input synced to slider

- Step 2 — Guest Count:
  - Label: "How many guests are you expecting?"
  - shadcn Input, type number, min 10, max 500
  - Inline hint: "Including ceremony and reception"

- Step 3 — Venue Type:
  - Label: "What kind of venue are you envisioning?"
  - 4 clickable cards (not a dropdown):
    - Indoor Ballroom / Outdoor Garden / Destination / Intimate Venue
  - Selected card gets accent border

- Step 4 — Style Priorities:
  - Label: "What matters most to you? (pick up to 3)"
  - 8 pill toggles: Florals, Photography, Catering, Entertainment, Décor, Attire, Officiant, Transport
  - Disable unselected pills when 3 are chosen

- Step 5 — Vibe (optional):
  - Label: "What's the overall vibe? (optional)"
  - 5 pill options: Black Tie, Rustic, Boho, Minimalist, Romantic
  - Single select, can be deselected

- Submit button:
  - Text: "Generate My Plan →"
  - Disabled until budget and guestCount and venueType are filled
  - On click: call setFormData, setView('loading'), POST to /api/generate

**Task: Handle form submission**
- On submit, dispatch API call from the form component
- On success: setPlan(result), setView('planner')
- On error: show inline error toast, setView('form') to allow retry

---

## Epic 6: UI — Loading State

### Phase 6.1 — Loading Screen

**Task: Build `/components/LoadingView.tsx`**
- Full page centered layout
- Animated ring or soft pulsing circle in accent color
- Rotating messages (swap every 2s):
  - "Reviewing your priorities…"
  - "Allocating your budget thoughtfully…"
  - "Curating your vendor categories…"
  - "Finalizing your plan…"
- Use Framer Motion `AnimatePresence` for message transitions

---

## Epic 7: UI — Planner View

### Phase 7.1 — Budget Bar

**Task: Build `/components/planner/BudgetBar.tsx`**
- Props: totalBudget, allocatedAmount (sum of current components)
- Display: three values — Total / Allocated / Remaining
- Progress bar: filled portion = allocated / total
- Color coding:
  - remaining > 20% of total → green
  - remaining 5–20% → amber
  - remaining < 5% → red
- Animate bar fill change on component add/remove using Framer Motion layout animation

### Phase 7.2 — Plan Card

**Task: Build `/components/planner/PlanCard.tsx`**
- Props: component: PlanComponent, onRemove: () => void
- Layout:
  - Left: category icon (emoji or lucide icon mapped by category)
  - Center: name (bold), description (muted small text)
  - Right: estimated cost formatted as $X,XXX
- Bottom row: priority badge (shadcn Badge with color by priority), rationale toggle button
- Rationale expands inline with AnimatePresence
- Remove button (X icon, top right corner), confirms before removing
- Entry animation: fadeIn + slideUp with staggered delay by index

### Phase 7.3 — Planner Layout

**Task: Build `/components/planner/PlannerView.tsx`**
- Header bar:
  - "TBD" wordmark left
  - Event summary center (e.g. "Garden Wedding · 120 Guests · Minimalist")
  - "Start Over" button right (confirm dialog → clearPlan, setView('form'))
- Budget Bar below header (sticky)
- Plan cards grid (2-col on desktop, 1-col mobile)
- Staggered card entry animation on initial render
- "Add Component" button at bottom of grid → opens AddComponentModal

### Phase 7.4 — Add Component Modal

**Task: Build `/components/planner/AddComponentModal.tsx`**
- shadcn Dialog
- Fields: Name (text input), Category (select from enum), Estimated Cost (number input)
- Validate: all three fields required, cost must be > 0
- On confirm: generate a uuid for id, set priority to 'optional', rationale to 'Manually added', dispatch addComponent to store
- On add: modal closes, new card animates in at bottom of grid, budget bar updates

---

## Epic 8: Polish & Deploy

### Phase 8.1 — Responsive Pass
- Ensure onboarding form is usable on mobile (stack layout, larger tap targets)
- Planner cards go single column below md breakpoint
- Budget bar stays readable at 375px width

### Phase 8.2 — Error Handling
- API route returns structured errors
- Form catches fetch failure, shows toast: "Something went wrong. Try again."
- If Claude returns unparseable JSON: retry once automatically, then surface error

### Phase 8.3 — localStorage Wiring Verification
- Manually test: fill form → generate plan → refresh page → plan still present
- "Start Over" clears localStorage correctly
- Confirm Zustand persist middleware is scoped only to plan + formData

### Phase 8.4 — Deploy to Vercel
- Push repo to GitHub
- Connect to Vercel, import repo
- Add ANTHROPIC_API_KEY to Vercel environment variables (Production + Preview)
- Trigger deploy, verify /api/generate works in production (not just localhost)
- Copy public URL for demo

### Phase 8.5 — Demo Dry Run
- Run through full flow twice end-to-end
- Confirm plan generates < 10s on production URL
- Confirm remove + add components update budget correctly
- Have a backup: screenshot of a generated plan in case of wifi issues at venue
