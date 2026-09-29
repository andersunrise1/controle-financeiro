import { getDb } from "./db";

export interface DeletionSummary {
  transactions: number;
  recurring: number;
  feedback: number;
  passwordResets: number;
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
  // Os códigos de recuperação de senha ficavam para trás: a função prometia
  // apagar "todas as linhas que pertencem ao usuário" e deixava estas. São
  // linhas com o id da pessoa e o hash de um código morto, então não davam
  // acesso a nada — conferi que o id nunca é reaproveitado (AUTOINCREMENT
  // mantém uma marca d'água em sqlite_sequence), o que descarta o cenário de
  // um código pendente reaparecer na conta de outra pessoa. Mesmo assim, quem
  // pede para apagar os dados não espera que sobre resíduo.
  const deletePasswordResets = db.prepare(
    "DELETE FROM password_resets WHERE user_id = ?"
  );
  const deleteUser = db.prepare("DELETE FROM users WHERE id = ?");

  // login_attempts é indexada por e-mail, não por user_id — porque registra
  // também tentativas contra endereços sem conta. Isso significa que ela guarda
  // o e-mail da pessoa, que é dado pessoal e tem de sair junto.
  const deleteLoginAttempts = db.prepare(
    "DELETE FROM login_attempts WHERE email = ?"
  );

  const run = db.transaction((id: number): DeletionSummary => {
    const conta = db
      .prepare("SELECT email FROM users WHERE id = ?")
      .get(id) as { email: string } | undefined;

    const feedback = deleteFeedback.run(id).changes;
    const recurring = deleteRecurring.run(id).changes;
    const transactions = deleteTransactions.run(id).changes;
    const passwordResets = deletePasswordResets.run(id).changes;
    if (conta) deleteLoginAttempts.run(conta.email.toLowerCase().trim());
    deleteUser.run(id);
    return { transactions, recurring, feedback, passwordResets };
  });

  return run(userId);
}
