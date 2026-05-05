import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getDb } from './db';
import flightsRouter from './routes/flights';
import pricesRouter from './routes/prices';
import alertsRouter from './routes/alerts';
import { startScheduler } from './services/scheduler';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

app.use(cors());
app.use(express.json());

// Initialize DB on startup
getDb();

app.use('/api/flights', flightsRouter);
app.use('/api/prices', pricesRouter);
app.use('/api/alerts', alertsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  startScheduler();
});
