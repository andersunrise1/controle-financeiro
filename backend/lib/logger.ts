/**
 * Server-side error logging.
 *
 * Every route used to answer a failure with a bare "Erro interno do
 * servidor." and throw the real exception away, which meant a production
 * problem left no trace anywhere — a misconfigured JWT_SECRET, a disk-full
 * database and a genuine bug all looked identical from the outside and from
 * the logs.
 *
 * The client still only ever sees the generic message (an exception's text
 * can carry table and column names); the real cause goes to stderr, which is
 * what the hosting platform collects.
 */
export function logError(context: string, error: unknown): void {
  const detail =
    error instanceof Error ? `${error.message}\n${error.stack ?? ""}` : String(error);
  console.error(`[divisa] ${context}: ${detail}`);
}

/**
 * Records something that went right.
 *
 * Only logging failures sounds economical until something doesn't happen:
 * an empty log then means either "it worked" or "it was never attempted",
 * and there is no way to tell which. That ambiguity cost a long debugging
 * session on email delivery, where silence looked like success.
 */
export function logInfo(context: string, detail: string): void {
  console.log(`[divisa] ${context}: ${detail}`);
}
