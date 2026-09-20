import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { app } from 'electron';
import path from 'path';
import * as schema from './schema';

export const dbPath = path.join(app.getPath('userData'), 'ledgerflow_data.db');
const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });

// Simple Auto-migration for schema creation
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    id_proof TEXT,
    notes TEXT,
    documents TEXT,
    created_at INTEGER NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    date INTEGER NOT NULL,
    desc TEXT NOT NULL,
    is_system INTEGER DEFAULT 0
  );
`);
