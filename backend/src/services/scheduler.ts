import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { searchFlights } from './amadeus';
import { getDb } from '../db';

interface AlertRow {
  id: number;
  email: string;
  origin: string;
  destination: string;
  depart_date: string;
  return_date: string | null;
  threshold_aud: number;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendAlertEmail(alert: AlertRow, price: number) {
  const transporter = createTransporter();
  const route = `${alert.origin} → ${alert.destination}`;
  const dates = alert.return_date
    ? `${alert.depart_date} – ${alert.return_date}`
    : alert.depart_date;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: alert.email,
    subject: `✈ Price Alert: ${route} now AUD $${price.toFixed(2)}`,
    html: `
      <h2>Flight Price Alert</h2>
      <p>Good news! A flight on your watchlist has dropped below your threshold.</p>
      <table>
        <tr><td><strong>Route</strong></td><td>${route}</td></tr>
        <tr><td><strong>Dates</strong></td><td>${dates}</td></tr>
        <tr><td><strong>Current price</strong></td><td><strong>AUD $${price.toFixed(2)}</strong></td></tr>
        <tr><td><strong>Your threshold</strong></td><td>AUD $${alert.threshold_aud.toFixed(2)}</td></tr>
      </table>
      <p>Book now before prices change!</p>
    `,
  });
}

async function runDailyJob() {
  console.log('[scheduler] Running daily price fetch job...');
  const db = getDb();
  const alerts = db.prepare(
    'SELECT DISTINCT origin, destination, depart_date, return_date FROM alerts WHERE active = 1'
  ).all() as Pick<AlertRow, 'origin' | 'destination' | 'depart_date' | 'return_date'>[];

  for (const { origin, destination, depart_date, return_date } of alerts) {
    try {
      const offers = await searchFlights(origin, destination, depart_date, return_date ?? undefined);
      if (offers.length === 0) continue;

      const cheapest = offers.reduce((a, b) => (a.price < b.price ? a : b));

      db.prepare(`
        INSERT INTO price_snapshots (origin, destination, depart_date, return_date, price_aud, airline, stops, duration)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(origin, destination, depart_date, return_date, cheapest.price, cheapest.airline, cheapest.stops, cheapest.duration);

      // Check if any alert thresholds are triggered
      const triggeredAlerts = db.prepare(`
        SELECT * FROM alerts
        WHERE active = 1
          AND origin = ? AND destination = ?
          AND depart_date = ?
          AND (return_date = ? OR (return_date IS NULL AND ? IS NULL))
          AND threshold_aud >= ?
      `).all(origin, destination, depart_date, return_date, return_date, cheapest.price) as AlertRow[];

      for (const alert of triggeredAlerts) {
        try {
          await sendAlertEmail(alert, cheapest.price);
          console.log(`[scheduler] Alert email sent to ${alert.email} for ${origin}-${destination}`);
        } catch (emailErr) {
          console.error(`[scheduler] Failed to send email to ${alert.email}:`, emailErr);
        }
      }
    } catch (err) {
      console.error(`[scheduler] Error fetching ${origin}-${destination}:`, err);
    }
  }
  console.log('[scheduler] Daily job complete.');
}

// Runs every day at 06:00 AEST (UTC+10 = 20:00 UTC)
export function startScheduler() {
  cron.schedule('0 20 * * *', runDailyJob, { timezone: 'UTC' });
  console.log('[scheduler] Daily price fetch scheduled at 06:00 AEST');
}

export { runDailyJob };
