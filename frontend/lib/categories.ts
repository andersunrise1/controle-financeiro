export interface CategoryDef {
  name: string;
  color: string;
}

export const CATEGORIES: CategoryDef[] = [
  { name: "Salário", color: "#00e5ff" },
  { name: "Mercado", color: "#ff8c00" },
  { name: "Moradia", color: "#b026ff" },
  { name: "Transporte", color: "#faff00" },
  { name: "Lazer", color: "#ff2fb0" },
  { name: "Saúde", color: "#ff1744" },
  { name: "Outros", color: "#d896ff" },
];

export const DEFAULT_CATEGORY = "Outros";

export function getCategoryColor(name: string): string {
  return CATEGORIES.find((c) => c.name === name)?.color ?? "#d896ff";
}
