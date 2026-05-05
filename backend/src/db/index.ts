import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/tracker.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs');
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS price_snapshots (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      origin      TEXT NOT NULL,
      destination TEXT NOT NULL,
      depart_date TEXT NOT NULL,
      return_date TEXT,
      price_aud   REAL NOT NULL,
      airline     TEXT,
      stops       INTEGER,
      duration    TEXT,
      fetched_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_route_date
      ON price_snapshots (origin, destination, depart_date, return_date);

    CREATE TABLE IF NOT EXISTS alerts (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT NOT NULL,
      origin        TEXT NOT NULL,
      destination   TEXT NOT NULL,
      depart_date   TEXT NOT NULL,
      return_date   TEXT,
      threshold_aud REAL NOT NULL,
      active        INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
