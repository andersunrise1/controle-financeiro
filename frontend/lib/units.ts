// Mirrors backend/lib/categories.ts's UNITS exactly — kept as plain
// language-neutral abbreviations (not translated per locale) since kg/g/L/ml
// read the same regardless of language, and drift between a translated
// display label and the value actually stored would be a real bug risk.
export const UNITS = ["kg", "g", "L", "ml", "un"] as const;

export type Unit = (typeof UNITS)[number];
