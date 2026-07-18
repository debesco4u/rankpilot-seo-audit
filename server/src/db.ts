import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'seo_audit.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export function initDB(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  db.exec(`CREATE TABLE IF NOT EXISTS audits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, site_url TEXT NOT NULL,
    overall_score INTEGER NOT NULL, data_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS daily_usage (
    user_id INTEGER NOT NULL, date TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (user_id, date)
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, plan TEXT NOT NULL,
    amount REAL NOT NULL, currency TEXT NOT NULL DEFAULT 'USD',
    payment_method TEXT NOT NULL DEFAULT 'paypal',
    txn_ref TEXT, status TEXT NOT NULL DEFAULT 'confirmed',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL, plan TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT, payment_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  try { db.exec("ALTER TABLE users ADD COLUMN reset_token TEXT")
  } catch {}
  try { db.exec("ALTER TABLE users ADD COLUMN reset_token_exp TEXT")
  } catch {}
  console.log('[DB] Initialized');
}

export default db;
