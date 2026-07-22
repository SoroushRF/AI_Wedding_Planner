# TBD — AI Wedding Planner

Hackathon app: Gemini generates an editable wedding plan from budget, location, date/time, and preferences.

## Setup

```bash
npm install
cp .env.example .env.local
# put a real GEMINI_API_KEY in .env.local
npm run dev
```

## Ownership

- **Soroush** — `lib/*`, `app/api/generate`, env keys (see `AGENT.md`)
- **Parsa** — UI under `components/`, `app/page.tsx`, layout, globals

## API smoke test

With `npm run dev` and a valid `GEMINI_API_KEY`:

```bash
curl -X POST http://localhost:3000/api/generate -H "Content-Type: application/json" -d "{\"budget\":25000,\"location\":\"Toronto, ON\",\"weddingDate\":\"2026-09-12\",\"guestCount\":120,\"venueType\":\"garden\"}"
```

Expect `200` with `{ components, totalBudget }`.

## Deploy (Vercel)

1. Import https://github.com/SoroushRF/AI_Wedding_Planner on Vercel
2. Add env var `GEMINI_API_KEY` for Production and Preview
3. Deploy
4. Repeat the curl against `https://<your-deployment>/api/generate`
