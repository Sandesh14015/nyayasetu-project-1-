# NyayaSetu AI

An AI-powered judicial dashboard and legal assistant for India's Department of Justice. Enables citizens to access case statistics, track judicial data, and get AI-powered guidance on legal procedures, eFiling, legal aid, and court services.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/nyayasetu run dev` — run the frontend (port 18910)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI via Replit AI Integrations

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Recharts, Framer Motion, Wouter, Tailwind CSS
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: OpenAI GPT (via Replit AI Integrations) — streaming SSE chat
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/judicial.ts` — judicial stats DB schema (state_stats, district_stats, monthly_trends, court_type_stats, case_category_stats)
- `lib/db/src/schema/conversations.ts` + `messages.ts` — chat conversation DB schema
- `artifacts/nyayasetu/src/` — React frontend
- `artifacts/api-server/src/routes/judicial.ts` — judicial data API routes
- `artifacts/api-server/src/routes/openai/index.ts` — AI chat API routes

## Architecture decisions

- Dashboard data auto-refreshes every 30 seconds via React Query `refetchInterval`
- AI chat uses server-sent events (SSE) for real-time streaming responses
- Judicial data is stored in PostgreSQL and served via REST API (designed to be swapped with live NJDG feeds)
- OpenAI integration uses Replit AI Integrations proxy — no user API key needed
- All state statistics include pending, active, and weekly-registered counts matching NJDG data model

## Product

- **National Dashboard**: Real-time judicial statistics across all 30 Indian states — pending cases, active cases, weekly registrations, disposal rate
- **State Drill-Down**: Click any state to see district-level breakdowns and local monthly trends
- **NyayaSetu AI Chatbot**: AI legal assistant powered by GPT that answers questions about court procedures, case tracking, eFiling, legal aid, Tele-Law, and more
- **Interactive Charts**: Monthly trends (filed vs disposed), case category breakdown, court type stats
- **Live Data**: Dashboard refreshes every 30 seconds with a live indicator

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After OpenAPI spec changes, always run `pnpm --filter @workspace/api-spec run codegen` before touching routes or frontend hooks
- The `monthly_trends` table uses `NULL` for `state_code` to represent national data
- SSE chat endpoint (`POST /api/openai/conversations/:id/messages`) cannot use generated React Query hooks — use raw `fetch` + `ReadableStream` on the client
- Always run `pnpm --filter @workspace/db run push` after schema changes

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
