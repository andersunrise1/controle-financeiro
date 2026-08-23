export const CATEGORIES = [
  "Salário",
  "Mercado",
  "Moradia",
  "Transporte",
  "Lazer",
  "Saúde",
  "Outros",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DEFAULT_CATEGORY: Category = "Outros";

export function isValidCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}

// Units for the Mercado quantity field — common Brazilian grocery units,
// covers weight, volume, and count.
export const UNITS = ["kg", "g", "L", "ml", "un"] as const;

export type Unit = (typeof UNITS)[number];

export function isValidUnit(value: unknown): value is Unit {
  return typeof value === "string" && (UNITS as readonly string[]).includes(value);
}
