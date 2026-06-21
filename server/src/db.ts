import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || path.resolve(__dirname, '../../data/rankpilot.db');
let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initDb() {
  const d = getDb();
  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL, name TEXT DEFAULT '',
      plan TEXT DEFAULT 'free' CHECK(plan IN ('free','diy','whitelabel')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      plan TEXT NOT NULL, amount REAL NOT NULL,
      status TEXT DEFAULT 'completed', paypal_email TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY, user_id TEXT,
      url TEXT NOT NULL, score INTEGER, results TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS daily_usage (
      user_key TEXT NOT NULL, date TEXT NOT NULL,
      count INTEGER DEFAULT 0, PRIMARY KEY(user_key, date)
    );
  `);
  console.log('DB initialized at', DB_PATH);
}
