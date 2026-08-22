import { formatMonthLabel as formatMonthLabelForRegion } from "./currency";

// Mirrors the grouping logic in ClusteredChart.tsx / CategoryChart.tsx /
// YearlyChart.tsx exactly (same date-key math, same field names).
export function groupByMonth(transactions, region) {
  const grouped = {};

  transactions.forEach((t) => {
    const date = new Date(`${t.date}T00:00:00`);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = formatMonthLabelForRegion(date, region);

    if (!grouped[key]) grouped[key] = { month: label, entradas: 0, saidas: 0 };
    if (t.type === "income") grouped[key].entradas += t.amount;
    else grouped[key].saidas += t.amount;
  });

  return Object.keys(grouped)
    .sort()
    .map((key) => grouped[key]);
}

export function groupByMonthAndCategory(transactions, region) {
  const grouped = {};

  transactions.forEach((t) => {
    if (t.type !== "expense") return;

    const date = new Date(`${t.date}T00:00:00`);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = formatMonthLabelForRegion(date, region);

    if (!grouped[key]) grouped[key] = { month: label };
    grouped[key][t.category] = (grouped[key][t.category] || 0) + t.amount;
  });

  return Object.keys(grouped)
    .sort()
    .map((key) => grouped[key]);
}

const MERCADO_CATEGORY = "Mercado";

// Mirrors MercadoChart.tsx's groupByProduct — normalized (trim + lowercase)
// key so "Leite"/"leite" count as the same product, displayed with the
// casing the user actually typed.
export function groupByProduct(transactions) {
  const counts = {};

  transactions.forEach((t) => {
    if (t.category !== MERCADO_CATEGORY) return;
    const name = t.description.trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (!counts[key]) counts[key] = { product: name, count: 0 };
    counts[key].count += 1;
  });

  return Object.values(counts).sort((a, b) => b.count - a.count);
}

export function groupByYear(transactions) {
  const grouped = {};

  transactions.forEach((t) => {
    if (t.type !== "expense") return;
    const year = t.date.slice(0, 4);
    grouped[year] = (grouped[year] || 0) + t.amount;
  });

  return Object.keys(grouped)
    .sort()
    .map((year) => ({ year, total: grouped[year] }));
}
