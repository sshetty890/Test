# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (`cd backend`)
```bash
npm install
npm run dev      # ts-node dev server on :3001
npm run build    # tsc → dist/
npm start        # run compiled dist/index.js
```

### Frontend (`cd frontend`)
```bash
npm install
npm run dev      # Vite dev server on :5173 (proxies /api → :3001)
npm run build    # tsc + vite build → dist/
npm run lint     # ESLint
```

### Production
Build the frontend first — the backend serves `frontend/dist` as static files:
```bash
cd frontend && npm run build
cd ../backend && npm start
```

There are no automated tests.

## Architecture

```
backend/   Node.js + Express 5 + TypeScript + SQLite (better-sqlite3)
frontend/  React 19 + TypeScript + Vite + Tailwind CSS v4 + Recharts
```

**Backend entry:** `backend/src/index.ts` — mounts three routers (`/api/flights`, `/api/prices`, `/api/alerts`), initialises the DB singleton, starts the cron scheduler, and serves the frontend `dist/` as a fallback SPA catch-all.

**DB layer:** `backend/src/db/index.ts` — singleton via module-level `let db`. Schema is applied inline with `CREATE TABLE IF NOT EXISTS` on first call. Two tables: `price_snapshots` (daily cheapest fare per route/date) and `alerts` (user subscriptions). DB file at `backend/data/tracker.db` (auto-created).

**Amadeus service:** `backend/src/services/amadeus.ts` — lazy-initialised client, calls `flightOffersSearch.get()` with `currencyCode: 'AUD'`. Free tier limit: 2,000 calls/month — avoid hitting it in loops.

**Scheduler:** `backend/src/services/scheduler.ts` — `node-cron` job at `0 20 * * *` UTC (06:00 AEST). Fetches only routes with active alerts, stores snapshots, sends SMTP emails for triggered thresholds. The `runDailyJob` function is exported for manual invocation.

**Frontend data layer:** `frontend/src/api/client.ts` — all typed fetch wrappers live here. During dev, Vite proxies `/api` to `localhost:3001`.

## Environment variables

Create `backend/.env` from this template:
```
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
PORT=3001          # optional, defaults to 3001
DB_PATH=           # optional, defaults to backend/data/tracker.db
```
