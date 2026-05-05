import { Router, Request, Response } from 'express';
import { searchFlights } from '../services/amadeus';
import { getDb } from '../db';

const router = Router();

const VIETNAM_AIRPORTS = ['SGN', 'HAN', 'DAD'];
const AU_AIRPORTS = ['SYD', 'MEL', 'BNE', 'PER', 'ADL'];

// GET /api/flights?origin=SYD&destination=SGN&departDate=2026-07-01&returnDate=2026-07-14
router.get('/', async (req: Request, res: Response) => {
  const { origin, destination, departDate, returnDate } = req.query as Record<string, string>;

  if (!origin || !destination || !departDate) {
    res.status(400).json({ error: 'origin, destination, and departDate are required' });
    return;
  }
  if (!AU_AIRPORTS.includes(origin.toUpperCase())) {
    res.status(400).json({ error: `origin must be one of: ${AU_AIRPORTS.join(', ')}` });
    return;
  }
  if (!VIETNAM_AIRPORTS.includes(destination.toUpperCase())) {
    res.status(400).json({ error: `destination must be one of: ${VIETNAM_AIRPORTS.join(', ')}` });
    return;
  }

  try {
    const offers = await searchFlights(
      origin.toUpperCase(),
      destination.toUpperCase(),
      departDate,
      returnDate || undefined
    );

    // Persist cheapest offer as a daily snapshot
    if (offers.length > 0) {
      const cheapest = offers.reduce((a, b) => (a.price < b.price ? a : b));
      const db = getDb();
      db.prepare(`
        INSERT INTO price_snapshots (origin, destination, depart_date, return_date, price_aud, airline, stops, duration)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        origin.toUpperCase(),
        destination.toUpperCase(),
        departDate,
        returnDate || null,
        cheapest.price,
        cheapest.airline,
        cheapest.stops,
        cheapest.duration
      );
    }

    res.json({ offers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch flights';
    res.status(500).json({ error: message });
  }
});

export default router;
