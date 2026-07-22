# TBD — Product Requirements Document
Version 1.0 | Hackathon Build | July 2026

---

## 1. Overview

### 1.1 Product Summary
TBD is an AI-powered wedding planner that generates a personalized, fully editable wedding plan from a short onboarding form. Users input their budget, guest count, venue type, and style priorities — Claude returns a structured plan broken into components (catering, florals, photography, etc.) that the user can add, remove, and customize in real time with live budget tracking.

### 1.2 Problem Statement
Wedding planning is overwhelming and fragmented. Couples spend hours across dozens of tabs trying to assemble a coherent plan from scratch. Generic checklists don't account for budget, priorities, or style. There's no tool that gives you an intelligent, personalized starting point in under 60 seconds.

### 1.3 Target Users
- Engaged couples in early planning stages (0–6 months post-engagement)
- Budget-conscious planners who want structure without a human coordinator
- Couples who want to self-plan but don't know where to start

### 1.4 Success Metrics (Hackathon)
- End-to-end flow completable in under 2 minutes
- Plan generates in under 10 seconds
- At least 5 editable components rendered per plan
- Zero broken states during demo

---

## 2. Goals & Non-Goals

### Goals
- Generate a personalized wedding plan via AI from minimal user input
- Render the plan as interactive, editable cards
- Track budget live as the user modifies the plan
- Feel premium and editorial, not like a generic wedding app

### Non-Goals (v1)
- User authentication or accounts
- Real vendor integrations or booking
- Multi-user / couple collaboration
- Mobile-first design (responsive is a Should Have, not a Must)
- Saving plans to a backend

---

## 3. User Flow

1. User lands on the TBD homepage
2. User fills out the onboarding form:
   - Total budget (slider + manual input)
   - Guest count
   - Venue type (indoor ballroom / outdoor garden / destination / intimate venue)
   - Style priorities (ranked or multi-select: florals, photography, catering, entertainment, décor, attire)
   - Optional: vibe descriptor (black tie / rustic / boho / minimalist / romantic)
3. User clicks "Generate My Plan"
4. Loading state with subtle animation while Claude processes
5. Plan page renders with:
   - Header: event summary (budget, guest count, vibe)
   - Budget bar: total vs allocated vs remaining
   - Plan cards: one card per component, each showing name, description, estimated cost, priority tag
6. User can:
   - Remove a card (budget updates)
   - Add a custom component (name + estimated cost)
   - Click "Suggest Alternative" on a card (Claude returns a swap)
7. At any point, user can click "Regenerate Plan" to start over

---

## 4. Functional Requirements

### 4.1 Onboarding Form
- Budget input: range $1,000–$500,000, default $25,000
- Guest count: numeric input, range 10–500
- Venue type: single-select, 4 options
- Style priorities: multi-select, up to 3, from a set of 8 categories
- Vibe: optional single-select, 5 options
- Validation: budget and guest count required before submission

### 4.2 AI Plan Generation
- On form submit, POST to /api/generate
- Send structured prompt to Claude with all form inputs
- Claude returns a JSON array of plan components:
  - id (string)
  - category (string: catering | florals | photography | venue | entertainment | attire | décor | officiant | transport | other)
  - name (string)
  - description (string, 1–2 sentences)
  - estimatedCost (number)
  - priority (string: essential | recommended | optional)
  - rationale (string, 1 sentence — why this was included for their inputs)
- Minimum 6 components, maximum 12
- Total estimatedCost of all components must not exceed the user's stated budget

### 4.3 Plan Editor
- Each component renders as a card with: category icon, name, description, cost, priority badge, rationale (collapsed by default)
- Remove button on each card; card animates out, budget recalculates
- "Add Component" button opens a modal: name (text), category (select), estimated cost (number)
- Budget bar always visible: total / allocated / remaining, color-coded (green → yellow → red as remaining approaches zero)

### 4.4 Regenerate
- Button in header to go back to form (confirm dialog: "This will clear your current plan")
- Form pre-fills with previous inputs

---

## 5. Non-Functional Requirements

- Plan generation response time: < 10 seconds
- UI renders plan without layout shift
- No auth, no backend DB for v1
- State persisted in localStorage so refresh doesn't lose the plan
- Deployed on Vercel, accessible via public URL for demo

---

## 6. Design Direction

- **Color palette:** off-white (#FAFAF8), deep charcoal (#1C1C1E), dusty rose accent (#C9A99A), gold line details
- **Typography:** serif display (Playfair Display or similar) for headings, clean sans (Inter) for body
- **Motion:** fade + slide on card entry/exit, no bouncy animations
- **Tone:** editorial luxury — think Kinfolk magazine meets fintech dashboard
- **No stock wedding photos** — abstract gradients or texture backgrounds only

---

## 7. Technical Architecture

### Frontend
- Next.js 15 (App Router)
- Tailwind CSS + shadcn/ui
- Framer Motion
- Zustand (plan state)
- localStorage (persistence)

### AI
- Anthropic Claude API (claude-sonnet-4-6)
- Route: /api/generate (POST)
- Prompt engineering: system prompt establishes wedding planner persona and JSON contract
- Response parsing: JSON.parse on content block, validated before render

### Deployment
- Vercel
- ANTHROPIC_API_KEY in environment variables

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Claude returns malformed JSON | Wrap in try/catch, retry once, fallback error state |
| Generation takes > 10s | Show animated loading with progress messaging |
| Budget mismatch in AI output | Post-process: if total > budget, scale costs proportionally |
| Form feels too long | Collapse vibe/style to optional — budget + guest count is the minimum viable input |
