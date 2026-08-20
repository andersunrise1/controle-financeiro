// Mirrors frontend/lib/categories.ts exactly — same names, same sunset-gradient
// hex values (see CLAUDE.md's "Identidade visual" section for the source math).
export const CATEGORIES = [
  { name: "Salário", color: "#ffd93d" },
  { name: "Mercado", color: "#ffbc3f" },
  { name: "Moradia", color: "#ffa041" },
  { name: "Transporte", color: "#fb834a" },
  { name: "Lazer", color: "#ef6367" },
  { name: "Saúde", color: "#e24483" },
  { name: "Outros", color: "#d6249f" },
];

export const DEFAULT_CATEGORY = "Outros";

export function getCategoryColor(name) {
  return CATEGORIES.find((c) => c.name === name)?.color ?? "#d6249f";
}
