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
