export interface CategoryDef {
  name: string;
  color: string;
}

// Cores derivadas do degradê padrão "pôr do sol" da marca (#ffd93d -> #ff8c42 45% -> #d6249f),
// uma amostra por categoria, da mais clara/amarela à mais escura/magenta.
export const CATEGORIES: CategoryDef[] = [
  { name: "Salário", color: "#ffd93d" },
  { name: "Mercado", color: "#ffbc3f" },
  { name: "Moradia", color: "#ffa041" },
  { name: "Transporte", color: "#fb834a" },
  { name: "Lazer", color: "#ef6367" },
  { name: "Saúde", color: "#e24483" },
  { name: "Outros", color: "#d6249f" },
];

export const DEFAULT_CATEGORY = "Outros";

export function getCategoryColor(name: string): string {
  return CATEGORIES.find((c) => c.name === name)?.color ?? "#d6249f";
}
