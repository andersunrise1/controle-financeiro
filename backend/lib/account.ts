import { getDb } from "./db";

export interface DeletionSummary {
  transactions: number;
  recurring: number;
  feedback: number;
}

/**
 * Erases a user and every row that belongs to them.
 *
 * The child tables are deleted explicitly rather than relying on the
 * `ON DELETE CASCADE` clauses in the schema: SQLite ignores foreign keys
 * unless `PRAGMA foreign_keys = ON` is set on the connection, and this app
 * has never set it. Trusting the cascade here would delete the account row
 * and silently leave every transaction, recurrence and feedback behind —
 * the exact opposite of what someone asking to delete their data expects.
 *
 * Wrapped in a transaction so a failure part-way through can't leave an
 * account whose data is half gone.
 */
export function deleteUserAccount(userId: number): DeletionSummary {
  const db = getDb();

  const deleteFeedback = db.prepare("DELETE FROM feedback WHERE user_id = ?");
  const deleteRecurring = db.prepare(
    "DELETE FROM recurring_transactions WHERE user_id = ?"
  );
  const deleteTransactions = db.prepare(
    "DELETE FROM transactions WHERE user_id = ?"
  );
  const deleteUser = db.prepare("DELETE FROM users WHERE id = ?");

  const run = db.transaction((id: number): DeletionSummary => {
    const feedback = deleteFeedback.run(id).changes;
    const recurring = deleteRecurring.run(id).changes;
    const transactions = deleteTransactions.run(id).changes;
    deleteUser.run(id);
    return { transactions, recurring, feedback };
  });

  return run(userId);
}
