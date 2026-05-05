import { Router, Request, Response } from 'express';
import { getDb } from '../db';

const router = Router();

// POST /api/alerts
router.post('/', (req: Request, res: Response) => {
  const { email, origin, destination, departDate, returnDate, thresholdAud } = req.body as {
    email: string;
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    thresholdAud: number;
  };

  if (!email || !origin || !destination || !departDate || thresholdAud == null) {
    res.status(400).json({ error: 'email, origin, destination, departDate, and thresholdAud are required' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Invalid email address' });
    return;
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO alerts (email, origin, destination, depart_date, return_date, threshold_aud)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(email, origin.toUpperCase(), destination.toUpperCase(), departDate, returnDate || null, thresholdAud);

  res.status(201).json({ id: result.lastInsertRowid, message: 'Alert created' });
});

// GET /api/alerts
router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM alerts WHERE active = 1 ORDER BY created_at DESC').all();
  res.json({ alerts: rows });
});

// DELETE /api/alerts/:id
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const result = db.prepare('UPDATE alerts SET active = 0 WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Alert not found' });
    return;
  }
  res.json({ message: 'Alert deactivated' });
});

export default router;
