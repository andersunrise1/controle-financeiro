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
