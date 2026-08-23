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
