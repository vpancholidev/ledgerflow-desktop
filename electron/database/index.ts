import initSqlJs from 'sql.js';
import { drizzle } from 'drizzle-orm/sql-js';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import * as schema from './schema';

let dbPath: string;

export function getDbPath() {
  if (!dbPath) {
    dbPath = path.join(app.getPath('userData'), 'ledgerflow_data.db');
  }
  return dbPath;
}

export let sqlite: any;
export let db: any;

export async function initDb() {
  const SQL = await initSqlJs();
  let buffer;
  const dbPath = getDbPath();
  if (fs.existsSync(dbPath)) {
    buffer = fs.readFileSync(dbPath);
    sqlite = new SQL.Database(buffer);
  } else {
    sqlite = new SQL.Database();
  }

  db = drizzle(sqlite, { schema });

  sqlite.exec(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        customer_no TEXT NOT NULL DEFAULT '',
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

  try { sqlite.exec("ALTER TABLE customers ADD COLUMN customer_no TEXT NOT NULL DEFAULT '';"); } catch (e) { }

  saveDb();
}

export function saveDb() {
  if (sqlite) {
    const data = sqlite.export();
    fs.writeFileSync(getDbPath(), Buffer.from(data));
  }
}