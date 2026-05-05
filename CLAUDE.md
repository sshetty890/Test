# Vietnam Flight Price Tracker

Full-stack app that tracks daily flight prices from Australia → Vietnam, shows price history charts, and sends email alerts when fares drop below a threshold.

## Architecture

```
backend/   Node.js + Express + TypeScript + SQLite
frontend/  React + TypeScript + Vite + Tailwind CSS + Recharts
```

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in AMADEUS_CLIENT_ID, AMADEUS_CLIENT_SECRET, and SMTP_* in .env
npm install
npm run dev        # development (ts-node)
npm run build      # compile to dist/
npm start          # run compiled output
```

Runs on **http://localhost:3001**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # Vite dev server with proxy to :3001
npm run build      # production build to dist/
```

Runs on **http://localhost:5173**

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/flights?origin=SYD&destination=SGN&departDate=YYYY-MM-DD[&returnDate=YYYY-MM-DD]` | Search live flight prices |
| GET | `/api/prices/history?origin=...&destination=...&departDate=...` | Price history (last 30 days) |
| GET | `/api/prices/lowest?origin=...&destination=...&departDate=...` | Min/max/avg stats |
| POST | `/api/alerts` | Create a price alert `{ email, origin, destination, departDate, returnDate?, thresholdAud }` |
| GET | `/api/alerts` | List active alerts |
| DELETE | `/api/alerts/:id` | Deactivate an alert |

## Supported airports

**Australian origins:** SYD, MEL, BNE, PER, ADL  
**Vietnam destinations:** SGN (Ho Chi Minh City), HAN (Hanoi), DAD (Da Nang)

## Daily scheduler

The backend runs a `node-cron` job every day at **06:00 AEST** (20:00 UTC) that:
1. Fetches the cheapest flight for every route that has an active alert
2. Stores a price snapshot in SQLite
3. Sends an email via SMTP if the price is at or below any matching alert threshold

## Data storage

SQLite database at `backend/data/tracker.db` (auto-created on first run).

Tables:
- `price_snapshots` — daily cheapest price per route/date
- `alerts` — user-configured price alert subscriptions

## External dependencies

- **Amadeus API** (free tier): [developers.amadeus.com](https://developers.amadeus.com) — 2,000 calls/month
- **SMTP provider**: Any standard SMTP service (Gmail with App Password, Mailgun, SendGrid, etc.)
