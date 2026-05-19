# NyayaSetu AI

An AI-powered judicial dashboard and legal assistant for India's Department of Justice. Built for the eCourts / NJDG ecosystem — citizens can explore live case statistics across all 30 Indian states, drill into district-level data, and query an AI legal assistant that speaks plainly about court procedures, eFiling, legal aid, and more.

---

## Features

- **National Judicial Dashboard** — pending cases, active cases, weekly registrations, disposal rate across all states. Auto-refreshes every 30 seconds.
- **State Drill-Down** — click any state to see district-level breakdowns and local monthly trends.
- **Interactive Charts** — monthly trends (filed vs. disposed), case category pie, court-type bar chart (Recharts).
- **eCourts Services Panel** — one-click access to Case Status, eFiling, ePay, Cause List, Tele-Law, NALSA.
- **NyayaSetu AI Chatbot** — GPT-powered legal assistant with streaming responses, conversation history, and eCourts deep-links baked into every answer.

---

## Repository Structure

```
nyayasetu/
│
├── artifacts/                      # Deployable applications
│   │
│   ├── api-server/                 # ── BACKEND ──────────────────────────────
│   │   ├── src/
│   │   │   ├── app.ts              # Express app setup (CORS, pino logging)
│   │   │   ├── index.ts            # Server entry point (reads PORT env var)
│   │   │   ├── lib/
│   │   │   │   └── logger.ts       # Structured pino logger
│   │   │   └── routes/
│   │   │       ├── index.ts        # Root router — mounts all sub-routers
│   │   │       ├── health.ts       # GET /api/healthz
│   │   │       ├── judicial.ts     # GET /api/judicial/* (states, trends, etc.)
│   │   │       └── openai/
│   │   │           └── index.ts    # POST /api/openai/conversations (AI chat + SSE)
│   │   ├── build.mjs               # esbuild bundle script
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── nyayasetu/                  # ── FRONTEND ─────────────────────────────
│       ├── public/
│       │   └── favicon.svg
│       ├── src/
│       │   ├── App.tsx             # Wouter router + React Query setup
│       │   ├── main.tsx            # Vite entry point
│       │   ├── index.css           # Tailwind + CSS custom properties (theme)
│       │   ├── components/
│       │   │   ├── Layout.tsx      # Sticky nav + footer
│       │   │   ├── StateGrid.tsx   # Color-coded state cards grid
│       │   │   └── ui/             # shadcn/ui component library
│       │   ├── pages/
│       │   │   ├── Dashboard.tsx   # National dashboard with charts
│       │   │   ├── StateDetail.tsx # Per-state district breakdown
│       │   │   ├── Chatbot.tsx     # AI legal assistant chat interface
│       │   │   └── not-found.tsx
│       │   ├── hooks/
│       │   │   └── use-toast.ts
│       │   └── lib/
│       │       ├── format.ts       # Number / percentage formatters
│       │       └── utils.ts        # Tailwind cn() helper
│       ├── index.html
│       ├── vite.config.ts
│       ├── package.json
│       └── tsconfig.json
│
├── lib/                            # ── SHARED LIBRARIES ─────────────────────
│   │
│   ├── api-spec/
│   │   ├── openapi.yaml            # ← Single source of truth for ALL API contracts
│   │   ├── orval.config.ts         # Code-generation config (Orval)
│   │   └── package.json
│   │
│   ├── api-client-react/           # Generated React Query hooks (auto — do not edit)
│   │   └── src/
│   │       ├── generated/api.ts    # useGetDashboardSummary, useListStates, etc.
│   │       └── custom-fetch.ts     # Base fetch with /api prefix
│   │
│   ├── api-zod/                    # Generated Zod validation schemas (auto — do not edit)
│   │   └── src/generated/
│   │       └── api.ts              # GetStateDetailsParams, SendOpenaiMessageBody, etc.
│   │
│   ├── db/                         # ── DATABASE ──────────────────────────────
│   │   ├── drizzle.config.ts       # Drizzle Kit config (reads DATABASE_URL)
│   │   └── src/
│   │       ├── index.ts            # Re-exports db client + all tables
│   │       └── schema/
│   │           ├── index.ts        # Barrel — export everything
│   │           ├── judicial.ts     # state_stats, district_stats, monthly_trends,
│   │           │                   #   court_type_stats, case_category_stats
│   │           ├── conversations.ts # conversations table (AI chat)
│   │           └── messages.ts     # messages table (AI chat)
│   │
│   ├── integrations-openai-ai-server/   # OpenAI server SDK wrapper
│   │   └── src/
│   │       ├── client.ts           # Pre-configured OpenAI client
│   │       ├── audio/              # Voice/STT/TTS utilities
│   │       ├── batch/              # Rate-limited batch processor
│   │       └── image/              # Image generation helper
│   │
│   └── integrations-openai-ai-react/    # React voice hooks (optional)
│       └── src/audio/
│           ├── useVoiceRecorder.ts
│           ├── useAudioPlayback.ts
│           └── useVoiceStream.ts
│
├── package.json                    # Root workspace — shared dev tools
├── pnpm-workspace.yaml             # pnpm workspaces + dependency catalog
├── tsconfig.json                   # Root solution tsconfig (libs only)
├── tsconfig.base.json              # Shared strict TypeScript config
└── .gitignore
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, shadcn/ui, Recharts, Framer Motion, Wouter |
| Backend | Node.js 24, Express 5, TypeScript, pino logging |
| Database | PostgreSQL + Drizzle ORM |
| AI | Grok AI (streaming SSE) |
| API Contract | OpenAPI 3.1 → code-generated hooks (Orval) + Zod schemas |
| Package manager | pnpm workspaces |

---

## Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- PostgreSQL database

---

## Environment Variables

Create a `.env` file at the root (or set these in your hosting platform):

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/nyayasetu

# Grok — use your Grok API key and base URL
GROQ_BASE_URL=https://api.groq.ai/v1
GROQ_API_KEY=gsk-...

# Optional — used by the API server
PORT=8080
NODE_ENV=development
```

> **Note:** If running on Replit, `DATABASE_URL` and the OpenAI env vars are provisioned automatically.

---

## Getting Started (Local)

```bash
# 1. Clone the repo
git clone https://github.com/your-username/nyayasetu.git
cd nyayasetu

# 2. Install dependencies
pnpm install

# 3. Push the database schema
pnpm --filter @workspace/db run push

# 4. Seed the database with NJDG-style data
#    (run the seed script — see scripts/ or use the SQL below)

# 5. Start the API server  (port 8080)
pnpm --filter @workspace/api-server run dev

# 6. Start the frontend   (port 5173 or whatever Vite picks)
pnpm --filter @workspace/nyayasetu run dev
```

Open `http://localhost:5173` in your browser.

---

## Database Schema

```
state_stats          — one row per Indian state (pending, active, registered this week, disposed, courts, disposal rate)
district_stats       — one row per district, foreign keyed to state_code
monthly_trends       — 12-month filing / disposal / pending counts (state_code = NULL → national)
court_type_stats     — breakdown by court tier (District, Civil Judge, Magistrate, etc.)
case_category_stats  — Civil, Criminal, Motor Accident, Family, etc. (state_code = NULL → national)
conversations        — AI chat conversation metadata
messages             — individual user / assistant messages per conversation
```

Run migrations:
```bash
pnpm --filter @workspace/db run push
```

---

## API Reference

All routes are under `/api`. Defined in `lib/api-spec/openapi.yaml`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/healthz` | Health check |
| GET | `/api/judicial/dashboard-summary` | National totals |
| GET | `/api/judicial/states` | All 30 states with stats |
| GET | `/api/judicial/states/:stateCode` | State + district breakdown |
| GET | `/api/judicial/monthly-trends?stateCode=` | 12-month trends |
| GET | `/api/judicial/court-types` | Court tier breakdown |
| GET | `/api/judicial/top-pending-states` | Top 10 by backlog |
| GET | `/api/judicial/case-categories?stateCode=` | Category distribution |
| GET | `/api/openai/conversations` | List AI conversations |
| POST | `/api/openai/conversations` | Create conversation |
| GET | `/api/openai/conversations/:id` | Get conversation + messages |
| DELETE | `/api/openai/conversations/:id` | Delete conversation |
| GET | `/api/openai/conversations/:id/messages` | List messages |
| POST | `/api/openai/conversations/:id/messages` | Send message (SSE stream) |

---

## Regenerating API Code

After editing `lib/api-spec/openapi.yaml`:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This regenerates:
- `lib/api-client-react/src/generated/` — React Query hooks
- `lib/api-zod/src/generated/` — Zod validation schemas

---

## Deploying

The app is designed to run as two separate services behind a reverse proxy:

| Service | Command | Default Port |
|---|---|---|
| API Server | `pnpm --filter @workspace/api-server run start` | 8080 |
| Frontend | `pnpm --filter @workspace/nyayasetu run build` → serve `dist/` | any |

The frontend build outputs to `artifacts/nyayasetu/dist/`. Serve it with nginx, Vercel, Netlify, or any static host. Point `/api` requests to the API server.

---

## Data Source

Statistics are based on the **National Judicial Data Grid (NJDG)** data model. The app is architecturally ready to swap the seeded PostgreSQL data for live NJDG API feeds — the API routes in `artifacts/api-server/src/routes/judicial.ts` just need to call the NJDG endpoints instead of querying the local DB.

Official sources:
- [NJDG](https://njdg.ecourts.gov.in/) — National Judicial Data Grid
- [eCourts Portal](https://services.ecourts.gov.in/) — Case status, eFiling, ePay
- [Department of Justice](https://doj.gov.in/) — Legal aid, Tele-Law

---

## License

MIT
