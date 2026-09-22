import crypto from "crypto";
import { getDb, PasswordReset } from "./db";

// Short-lived on purpose: the code travels through email, which is outside
// our control once it leaves.
const CODE_TTL_MINUTES = 30;

// A 6-digit code is only a million possibilities, so guessing has to be
// capped rather than merely slowed down.
const MAX_ATTEMPTS = 5;

// Anti-spam: someone typing a stranger's address into the form repeatedly
// shouldn't be able to flood that person's inbox.
const MAX_REQUESTS_PER_HOUR = 3;

export const RESET_CODE_LENGTH = 6;

/** Six digits, uniformly distributed, from a cryptographic source. */
export function generateCode(): string {
  // randomInt's upper bound is exclusive, so this covers 000000-999999 and
  // keeps leading zeros via padStart — "007431" is a valid code.
  return String(crypto.randomInt(0, 1_000_000)).padStart(RESET_CODE_LENGTH, "0");
}

/**
 * Codes are stored as a SHA-256 hash. bcrypt would be overkill here and
 * measurably slow: unlike a password, this secret is high-entropy relative
 * to its lifetime — it expires in 30 minutes and dies after 5 wrong tries,
 * so offline cracking isn't the threat model. Not storing it in the clear
 * is.
 */
function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/**
 * Every timestamp in this table is written and compared by SQLite itself,
 * never by JavaScript.
 *
 * Mixing the two silently breaks comparisons: created_at defaults to
 * datetime('now'), which is "2026-09-22 22:38:20", while Date#toISOString
 * produces "2026-09-22T23:08:20.112Z". Compared as text — which is all
 * SQLite does with them — the space sorts before the "T", so every row
 * looks older than any ISO string it is measured against, and a window
 * check like "created in the last hour" quietly matches nothing.
 */
export function countRecentRequests(userId: number): number {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT COUNT(*) as n FROM password_resets
        WHERE user_id = ? AND created_at > datetime('now', '-1 hour')`
    )
    .get(userId) as { n: number };
  return row.n;
}

export function isRateLimited(userId: number): boolean {
  return countRecentRequests(userId) >= MAX_REQUESTS_PER_HOUR;
}

/**
 * Issues a new code, invalidating any earlier one for the same user so a
 * second request doesn't leave two working codes in circulation.
 */
export function createResetCode(userId: number): string {
  const db = getDb();
  const code = generateCode();

  const run = db.transaction(() => {
    db.prepare(
      "UPDATE password_resets SET used_at = datetime('now') WHERE user_id = ? AND used_at IS NULL"
    ).run(userId);

    db.prepare(
      `INSERT INTO password_resets (user_id, code_hash, expires_at)
       VALUES (?, ?, datetime('now', ?))`
    ).run(userId, hashCode(code), `+${CODE_TTL_MINUTES} minutes`);
  });

  run();
  return code;
}

export type VerifyResult =
  | { ok: true; resetId: number }
  | { ok: false; reason: "invalid" | "expired" | "too_many_attempts" };

/**
 * Checks a code without consuming it. A wrong code burns an attempt; the
 * attempt counter is what stops someone working through all million codes.
 */
export function verifyResetCode(userId: number, code: string): VerifyResult {
  const db = getDb();

  // expires_at is compared by SQLite against its own clock, for the same
  // reason the window check above is.
  const row = db
    .prepare(
      `SELECT *, (expires_at < datetime('now')) AS is_expired
         FROM password_resets
        WHERE user_id = ? AND used_at IS NULL
        ORDER BY id DESC LIMIT 1`
    )
    .get(userId) as (PasswordReset & { is_expired: number }) | undefined;

  if (!row) return { ok: false, reason: "invalid" };

  if (row.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: "too_many_attempts" };
  }

  if (row.is_expired) {
    return { ok: false, reason: "expired" };
  }

  const submitted = hashCode(code);
  // timingSafeEqual needs equal lengths; both sides are fixed-size SHA-256
  // hex here, so this is safe to call directly.
  const matches = crypto.timingSafeEqual(
    Buffer.from(submitted, "hex"),
    Buffer.from(row.code_hash, "hex")
  );

  if (!matches) {
    db.prepare(
      "UPDATE password_resets SET attempts = attempts + 1 WHERE id = ?"
    ).run(row.id);
    return { ok: false, reason: "invalid" };
  }

  return { ok: true, resetId: row.id };
}

export function consumeResetCode(resetId: number): void {
  getDb()
    .prepare("UPDATE password_resets SET used_at = datetime('now') WHERE id = ?")
    .run(resetId);
}

export const RESET_CONFIG = {
  CODE_TTL_MINUTES,
  MAX_ATTEMPTS,
  MAX_REQUESTS_PER_HOUR,
};
