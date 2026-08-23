import { formatMonthOnlyLabel } from "./currency";

// Mirrors frontend/lib/mercadoGrouping.ts exactly — same functions, same
// scope semantics (month is 0-11 or null for "the whole year").
export const MERCADO_CATEGORY = "Mercado";

export function getMercadoTransactions(transactions) {
  return transactions.filter((t) => t.category === MERCADO_CATEGORY);
}

export function getMercadoYears(transactions) {
  const years = new Set();
  getMercadoTransactions(transactions).forEach((t) => {
    years.add(new Date(`${t.date}T00:00:00`).getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
}

export function filterMercadoByScope(transactions, year, month) {
  return getMercadoTransactions(transactions).filter((t) => {
    const d = new Date(`${t.date}T00:00:00`);
    if (d.getFullYear() !== year) return false;
    if (month !== null && d.getMonth() !== month) return false;
    return true;
  });
}

// Always all 12 months of the given year, even the empty ones.
export function groupMonthlyTotals(transactions, year, region) {
  const totals = new Array(12).fill(0);
  getMercadoTransactions(transactions).forEach((t) => {
    const d = new Date(`${t.date}T00:00:00`);
    if (d.getFullYear() !== year) return;
    totals[d.getMonth()] += t.amount;
  });
  return totals.map((total, i) => ({ month: formatMonthOnlyLabel(i, region), total }));
}

// Expects transactions already scoped by the caller (filterMercadoByScope) —
// same normalization (trim + lowercase) used everywhere else products are
// grouped, so "Leite"/"leite" count as one product.
export function groupByProductTotal(transactions) {
  const totals = {};
  transactions.forEach((t) => {
    const name = t.description.trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (!totals[key]) totals[key] = { product: name, total: 0 };
    totals[key].total += t.amount;
  });
  return Object.values(totals).sort((a, b) => b.total - a.total);
}
