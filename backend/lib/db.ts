import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "finance.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        amount REAL NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('bug', 'sugestao', 'outro')),
        message TEXT NOT NULL,
        resolved INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Codes are stored hashed, never in the clear: a leak of this table
      -- would otherwise be a leak of live "change anyone's password" tokens.
      -- attempts caps guessing of the 6-digit code, expires_at caps how long
      -- a leaked email stays useful, used_at makes a code single-use.
      CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        code_hash TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        used_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_password_resets_user
        ON password_resets(user_id);

      CREATE TABLE IF NOT EXISTS recurring_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        amount REAL NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT 'Outros',
        frequency TEXT NOT NULL CHECK(frequency IN ('weekly', 'monthly', 'yearly')),
        next_run_date TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    const columns = db.prepare("PRAGMA table_info(transactions)").all() as {
      name: string;
    }[];
    const hasCategory = columns.some((c) => c.name === "category");
    if (!hasCategory) {
      db.exec(
        "ALTER TABLE transactions ADD COLUMN category TEXT NOT NULL DEFAULT 'Outros'"
      );
    }

    const hasRecurringId = columns.some((c) => c.name === "recurring_id");
    if (!hasRecurringId) {
      db.exec(
        "ALTER TABLE transactions ADD COLUMN recurring_id INTEGER REFERENCES recurring_transactions(id)"
      );
    }

    // quantity/unit are Mercado-specific (how much of a product was bought,
    // e.g. "2 kg" of rice) — nullable since regular income/expense
    // transactions never set them.
    const hasQuantity = columns.some((c) => c.name === "quantity");
    if (!hasQuantity) {
      db.exec("ALTER TABLE transactions ADD COLUMN quantity REAL");
    }

    const hasUnit = columns.some((c) => c.name === "unit");
    if (!hasUnit) {
      db.exec("ALTER TABLE transactions ADD COLUMN unit TEXT");
    }

    // The day-of-month a monthly/yearly rule was originally set to. Without
    // it, next_run_date is the only memory of the intended day — so a rule
    // set for the 31st gets clamped to Feb 28 and then stays on the 28th
    // forever, because the next hop reads the day back off the clamped date.
    const recurringColumns = db
      .prepare("PRAGMA table_info(recurring_transactions)")
      .all() as { name: string }[];

    if (!recurringColumns.some((c) => c.name === "anchor_day")) {
      db.exec(
        "ALTER TABLE recurring_transactions ADD COLUMN anchor_day INTEGER"
      );

      // Backfill: the first transaction a rule ever generated still carries
      // the original, un-clamped day. Rules that never ran fall back to their
      // pending next_run_date, which hasn't been rewritten yet either.
      db.exec(`
        UPDATE recurring_transactions
           SET anchor_day = COALESCE(
             (SELECT CAST(strftime('%d', MIN(t.date)) AS INTEGER)
                FROM transactions t
               WHERE t.recurring_id = recurring_transactions.id),
             CAST(strftime('%d', next_run_date) AS INTEGER)
           )
         WHERE anchor_day IS NULL
      `);
    }
  }

  return db;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
  recurring_id: number | null;
  quantity: number | null;
  unit: string | null;
}

export interface RecurringTransaction {
  id: number;
  user_id: number;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  frequency: "weekly" | "monthly" | "yearly";
  next_run_date: string;
  anchor_day: number | null;
  active: number;
  created_at: string;
}

export interface PasswordReset {
  id: number;
  user_id: number;
  code_hash: string;
  expires_at: string;
  attempts: number;
  used_at: string | null;
  created_at: string;
}

export interface Feedback {
  id: number;
  user_id: number;
  category: "bug" | "sugestao" | "outro";
  message: string;
  resolved: number;
  created_at: string;
}

export interface FeedbackWithUser extends Feedback {
  user_name: string;
  user_email: string;
}
