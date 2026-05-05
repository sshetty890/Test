# Vietnam Flight Price Tracker — Implementation Plan

## Overview
A full-stack web app that tracks daily flight prices from Australia to Vietnam, displays price history charts, and sends price alerts when fares drop below a threshold.

## Tech Stack
- **Frontend**: React + TypeScript + Vite, Tailwind CSS, Recharts (charts), react-datepicker
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite via `better-sqlite3` (stores daily price snapshots and alert configs)
- **Scheduler**: `node-cron` for daily background price fetching
- **Flight API**: [Amadeus Flight Offers Search API](https://developers.amadeus.com/) (free tier: 2,000 calls/month) — user supplies their own API key via `.env`

---

## App Structure

```
/
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── FlightSearch.tsx    # Date range + origin/destination selector
│   │   │   ├── PriceTable.tsx      # Current flight results table
│   │   │   ├── PriceChart.tsx      # Recharts price history line chart
│   │   │   └── AlertForm.tsx       # Email + threshold alert setup
│   │   ├── pages/
│   │   │   └── Home.tsx
│   │   ├── api/
│   │   │   └── client.ts           # Typed fetch wrappers for backend API
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                    # Node.js + Express
│   ├── src/
│   │   ├── routes/
│   │   │   ├── flights.ts          # GET /api/flights?origin=SYD&depart=...&return=...
│   │   │   ├── prices.ts           # GET /api/prices/history?route=SYD-SGN&depart=...
│   │   │   └── alerts.ts           # POST/GET /api/alerts
│   │   ├── services/
│   │   │   ├── amadeus.ts          # Amadeus API client + token refresh
│   │   │   └── scheduler.ts        # node-cron daily price fetch job
│   │   ├── db/
│   │   │   ├── schema.ts           # Table definitions (price_snapshots, alerts)
│   │   │   └── index.ts            # DB connection singleton
│   │   └── index.ts                # Express app entry point
│   ├── .env.example
│   └── package.json
```

---

## Key Features

### 1. Flight Search (User-driven)
- User selects: origin airport (SYD, MEL, BNE, PER), destination (SGN, HAN, DAD), departure + return dates
- Backend calls Amadeus Flight Offers Search, returns cheapest options
- Results shown in a sortable table with airline, stops, duration, price (AUD)

### 2. Price History Chart
- Stored daily snapshots per route + date combination in `price_snapshots` SQLite table
- Recharts line chart showing price trend over the last 30 days
- Schema: `(id, origin, destination, depart_date, return_date, price_aud, fetched_at)`

### 3. Daily Auto-Refresh
- `node-cron` job runs at 6am AEST every day
- Fetches prices for all routes that have active alerts saved in DB
- Stores snapshot; triggers alert check

### 4. Price Alerts
- User sets: email address, route, travel dates, threshold price (AUD)
- Backend uses `nodemailer` (SMTP) to send email when daily job finds price ≤ threshold
- Schema: `(id, email, origin, destination, depart_date, return_date, threshold_aud, active)`

---

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/flights` | Search live flight prices |
| GET | `/api/prices/history` | Historical price snapshots for a route |
| POST | `/api/alerts` | Create a price alert |
| GET | `/api/alerts` | List all alerts |
| DELETE | `/api/alerts/:id` | Remove an alert |

---

## Environment Variables (backend `.env`)
```
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
PORT=3001
```

---

## Implementation Steps

1. **Scaffold backend** — `npm init`, install deps (express, better-sqlite3, node-cron, nodemailer, amadeus SDK, typescript)
2. **DB schema** — create `price_snapshots` and `alerts` tables on startup
3. **Amadeus service** — OAuth2 token management + flight search wrapper
4. **Express routes** — flights, prices/history, alerts CRUD
5. **Scheduler** — daily cron job with alert notification logic
6. **Scaffold frontend** — Vite + React + Tailwind setup
7. **FlightSearch component** — date pickers, airport dropdowns, search trigger
8. **PriceTable component** — display live results
9. **PriceChart component** — Recharts line chart from history API
10. **AlertForm component** — email + threshold input, POST to alerts API
11. **CLAUDE.md** — document commands and architecture
12. **Commit and push** to `claude/build-new-app-VDE3v`
