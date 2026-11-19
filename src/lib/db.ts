import "server-only";
import path from "node:path";
import fs from "node:fs";
import { seed } from "./seed";

/**
 * Database access layer.
 *
 * Uses Node's built-in SQLite (node:sqlite, Node >= 22.13) so the MVP runs with
 * zero native dependencies. All SQL lives in src/lib/data.ts behind plain
 * functions, so swapping to Postgres later (e.g. via Drizzle/Prisma) only
 * touches that file.
 */

type SQLValue = string | number | bigint | null | Uint8Array;
export interface Statement {
  run(...params: SQLValue[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  get(...params: SQLValue[]): Record<string, unknown> | undefined;
  all(...params: SQLValue[]): Record<string, unknown>[];
}
export interface Database {
  exec(sql: string): void;
  prepare(sql: string): Statement;
}

const SCHEMA = /* sql */ `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('musician','business')),
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS musicians (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  experience TEXT NOT NULL DEFAULT '',
  years_active INTEGER NOT NULL DEFAULT 1,
  performer_type TEXT NOT NULL DEFAULT 'Solo artist',
  location TEXT NOT NULL DEFAULT 'Nicosia',
  genres TEXT NOT NULL DEFAULT '[]',
  event_types TEXT NOT NULL DEFAULT '[]',
  performances TEXT NOT NULL DEFAULT '[]',
  languages TEXT NOT NULL DEFAULT '[]',
  members INTEGER NOT NULL DEFAULT 1,
  price_from INTEGER NOT NULL DEFAULT 200,
  price_to INTEGER,
  hourly_rate INTEGER,
  avatar TEXT,
  cover TEXT,
  photos TEXT NOT NULL DEFAULT '[]',
  tracks TEXT NOT NULL DEFAULT '[]',
  videos TEXT NOT NULL DEFAULT '[]',
  phone TEXT,
  public_email TEXT,
  website TEXT,
  instagram TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  verified INTEGER NOT NULL DEFAULT 0,
  response_hours INTEGER NOT NULL DEFAULT 24,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS businesses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Restaurant',
  location TEXT NOT NULL DEFAULT 'Nicosia',
  address TEXT,
  description TEXT NOT NULL DEFAULT '',
  music_wanted TEXT NOT NULL DEFAULT '[]',
  budget_min INTEGER,
  budget_max INTEGER,
  capacity INTEGER,
  logo TEXT,
  cover TEXT,
  phone TEXT,
  public_email TEXT,
  website TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gigs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  location TEXT NOT NULL,
  venue TEXT,
  genres TEXT NOT NULL DEFAULT '[]',
  performer_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  description TEXT NOT NULL DEFAULT '',
  deadline TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','filled')),
  urgent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gig_id INTEGER NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  musician_id INTEGER NOT NULL REFERENCES musicians(id) ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT '',
  quote INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','shortlisted','accepted','declined','withdrawn')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (gig_id, musician_id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  musician_id INTEGER NOT NULL REFERENCES musicians(id) ON DELETE CASCADE,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  gig_id INTEGER REFERENCES gigs(id) ON DELETE SET NULL,
  event_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  event_type TEXT NOT NULL,
  venue TEXT NOT NULL,
  price INTEGER NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','countered','confirmed','declined','cancelled','completed')),
  last_action_by TEXT NOT NULL DEFAULT 'business',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS unavailable_dates (
  musician_id INTEGER NOT NULL REFERENCES musicians(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  PRIMARY KEY (musician_id, date)
);

CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  musician_id INTEGER NOT NULL REFERENCES musicians(id) ON DELETE CASCADE,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (musician_id, business_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'text' CHECK (kind IN ('text','booking','system')),
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  musician_id INTEGER NOT NULL REFERENCES musicians(id) ON DELETE CASCADE,
  business_id INTEGER REFERENCES businesses(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,
  event_type TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS saved_musicians (
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  musician_id INTEGER NOT NULL REFERENCES musicians(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (business_id, musician_id)
);

CREATE INDEX IF NOT EXISTS idx_gigs_date ON gigs(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_m ON bookings(musician_id, event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_b ON bookings(business_id, event_date);
CREATE INDEX IF NOT EXISTS idx_messages_c ON messages(conversation_id, id);
CREATE INDEX IF NOT EXISTS idx_reviews_m ON reviews(musician_id);
`;

const g = globalThis as unknown as { __soundcyDb?: Database };

export function db(): Database {
  if (g.__soundcyDb) return g.__soundcyDb;
  const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "soundcy.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // Loaded at runtime so the bundler never tries to resolve it.
  // Silence Node's one-off "SQLite is experimental" warning (it is stable in practice
  // and the dev overlay otherwise reports it as an issue).
  const emit = process.emitWarning;
  process.emitWarning = ((w: string | Error, ...rest: unknown[]) => {
    if (String(typeof w === "string" ? w : w?.message).includes("SQLite")) return;
    return (emit as (...a: unknown[]) => void).call(process, w, ...rest);
  }) as typeof process.emitWarning;
  let mod: { DatabaseSync: new (file: string) => Database };
  try {
    mod = process.getBuiltinModule("node:sqlite") as typeof mod;
  } finally {
    process.emitWarning = emit;
  }
  const { DatabaseSync } = mod;
  const raw = new DatabaseSync(file);
  // node:sqlite returns null-prototype rows; convert to plain objects so they can
  // be passed from Server to Client Components.
  const conn: Database = {
    exec: (sql) => raw.exec(sql),
    prepare: (sql) => {
      const st = raw.prepare(sql);
      return {
        run: (...p) => st.run(...p),
        get: (...p) => {
          const r = st.get(...p);
          return r ? { ...r } : undefined;
        },
        all: (...p) => st.all(...p).map((r) => ({ ...r })),
      };
    },
  };
  conn.exec("PRAGMA busy_timeout = 5000;");
  conn.exec(SCHEMA);
  // Lightweight migrations for databases created by earlier versions.
  const cols = conn.prepare("PRAGMA table_info(musicians)").all().map((c) => String(c.name));
  if (!cols.includes("price_to")) conn.exec("ALTER TABLE musicians ADD COLUMN price_to INTEGER");
  g.__soundcyDb = conn;
  const count = conn.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  if (!count.n) {
    seed(conn);
  }
  return conn;
}

export function tx<T>(fn: () => T): T {
  const d = db();
  d.exec("BEGIN");
  try {
    const r = fn();
    d.exec("COMMIT");
    return r;
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}
