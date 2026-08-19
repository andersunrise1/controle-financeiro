import { getDb, RecurringTransaction } from "./db";

export const FREQUENCIES = ["weekly", "monthly", "yearly"] as const;

export type Frequency = (typeof FREQUENCIES)[number];

export function isValidFrequency(value: unknown): value is Frequency {
  return typeof value === "string" && (FREQUENCIES as readonly string[]).includes(value);
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysInMonth(year: number, month: number): number {
  // month is 0-indexed here; day 0 of the next month is the last day of this one
  return new Date(year, month + 1, 0).getDate();
}

// Adds N months/years to a date, clamping the day so e.g. Jan 31 + 1 month
// lands on Feb 28/29 instead of silently rolling over into March.
function addClamped(date: Date, monthsToAdd: number, yearsToAdd: number): Date {
  const day = date.getDate();
  const targetYear = date.getFullYear() + yearsToAdd;
  const targetMonth = date.getMonth() + monthsToAdd;
  const clampedDay = Math.min(day, daysInMonth(targetYear, targetMonth));
  return new Date(targetYear, targetMonth, clampedDay);
}

export function addPeriod(dateStr: string, frequency: Frequency): string {
  const date = parseDate(dateStr);

  if (frequency === "weekly") {
    date.setDate(date.getDate() + 7);
    return formatDate(date);
  }

  if (frequency === "monthly") {
    return formatDate(addClamped(date, 1, 0));
  }

  return formatDate(addClamped(date, 0, 1));
}

const MAX_CATCH_UP_OCCURRENCES = 500;

/**
 * Materializes any transactions that came due for a user's active recurring
 * rules, up to today. There's no background scheduler in this app — this
 * runs lazily whenever the user's transactions are loaded, so a recurrence
 * "arrives" the next time they open the app rather than at the exact minute
 * it was due. Fine for a personal finance app; not fine for anything
 * time-sensitive.
 */
export function generateDueTransactions(userId: number): void {
  const db = getDb();
  const today = formatDate(new Date());

  const dueRules = db
    .prepare(
      "SELECT * FROM recurring_transactions WHERE user_id = ? AND active = 1 AND next_run_date <= ?"
    )
    .all(userId, today) as RecurringTransaction[];

  if (dueRules.length === 0) return;

  const insertTransaction = db.prepare(
    "INSERT INTO transactions (user_id, type, amount, description, date, category, recurring_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const updateNextRun = db.prepare(
    "UPDATE recurring_transactions SET next_run_date = ? WHERE id = ?"
  );

  const runRule = db.transaction((rule: RecurringTransaction) => {
    let nextRunDate = rule.next_run_date;
    let count = 0;

    while (nextRunDate <= today && count < MAX_CATCH_UP_OCCURRENCES) {
      insertTransaction.run(
        rule.user_id,
        rule.type,
        rule.amount,
        rule.description,
        nextRunDate,
        rule.category,
        rule.id
      );
      nextRunDate = addPeriod(nextRunDate, rule.frequency);
      count++;
    }

    updateNextRun.run(nextRunDate, rule.id);
  });

  for (const rule of dueRules) {
    runRule(rule);
  }
}
