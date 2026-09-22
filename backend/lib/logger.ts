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
