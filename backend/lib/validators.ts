export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}

// Dates are stored and compared as plain "YYYY-MM-DD" strings everywhere
// (charts slice them, the recurrence engine string-compares them). Anything
// else silently poisons those: an unparseable date makes every chart bucket
// NaN, and feeding it back into the mobile date picker crashes it. The regex
// alone isn't enough — "2026-02-31" matches it but isn't a real day — so the
// parsed date has to round-trip back to the same string.
export function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
  );
}
