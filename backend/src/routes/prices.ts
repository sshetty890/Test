import { Router, Request, Response } from 'express';
import { getDb } from '../db';

const router = Router();

// GET /api/prices/history?origin=SYD&destination=SGN&departDate=2026-07-01&returnDate=2026-07-14&days=30
router.get('/history', (req: Request, res: Response) => {
  const { origin, destination, departDate, returnDate, days } = req.query as Record<string, string>;

  if (!origin || !destination || !departDate) {
    res.status(400).json({ error: 'origin, destination, and departDate are required' });
    return;
  }

  const lookbackDays = parseInt(days ?? '30', 10);
  const db = getDb();

  const rows = db.prepare(`
    SELECT price_aud, airline, stops, duration, fetched_at
    FROM price_snapshots
    WHERE origin = ?
      AND destination = ?
      AND depart_date = ?
      AND (return_date = ? OR (return_date IS NULL AND ? IS NULL))
      AND fetched_at >= datetime('now', ? || ' days')
    ORDER BY fetched_at ASC
  `).all(
    origin.toUpperCase(),
    destination.toUpperCase(),
    departDate,
    returnDate || null,
    returnDate || null,
    `-${lookbackDays}`
  );

  res.json({ history: rows });
});

// GET /api/prices/lowest?origin=SYD&destination=SGN&departDate=2026-07-01
router.get('/lowest', (req: Request, res: Response) => {
  const { origin, destination, departDate, returnDate } = req.query as Record<string, string>;

  if (!origin || !destination || !departDate) {
    res.status(400).json({ error: 'origin, destination, and departDate are required' });
    return;
  }

  const db = getDb();
  const row = db.prepare(`
    SELECT MIN(price_aud) as lowest, MAX(price_aud) as highest, AVG(price_aud) as average
    FROM price_snapshots
    WHERE origin = ?
      AND destination = ?
      AND depart_date = ?
      AND (return_date = ? OR (return_date IS NULL AND ? IS NULL))
  `).get(
    origin.toUpperCase(),
    destination.toUpperCase(),
    departDate,
    returnDate || null,
    returnDate || null
  );

  res.json(row);
});

export default router;
