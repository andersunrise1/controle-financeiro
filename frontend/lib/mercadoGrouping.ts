import { Transaction } from "./api";
import { Region } from "./regions";
import { formatMonthOnlyLabel } from "./currency";

export const MERCADO_CATEGORY = "Mercado";

export function getMercadoTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => t.category === MERCADO_CATEGORY);
}

// Every distinct year with at least one Mercado purchase, newest first —
// feeds the year <select>, and picking a sensible default (most recent year
// with data, not necessarily the calendar year) when the page first loads.
export function getMercadoYears(transactions: Transaction[]): number[] {
  const years = new Set<number>();
  getMercadoTransactions(transactions).forEach((t) => {
    years.add(new Date(t.date + "T00:00:00").getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
}

// month is 0-11 (Date's own convention) or null for "the whole year".
export function filterMercadoByScope(
  transactions: Transaction[],
  year: number,
  month: number | null
): Transaction[] {
  return getMercadoTransactions(transactions).filter((t) => {
    const d = new Date(t.date + "T00:00:00");
    if (d.getFullYear() !== year) return false;
    if (month !== null && d.getMonth() !== month) return false;
    return true;
  });
}

// Always all 12 months of the given year, even the empty ones — an empty
// month is itself information (nothing spent that month), and a chart that
// silently skipped it would look like a shorter year than it really was.
export function groupMonthlyTotals(
  transactions: Transaction[],
  year: number,
  region: Region
): { month: string; total: number }[] {
  const totals = new Array(12).fill(0) as number[];
  getMercadoTransactions(transactions).forEach((t) => {
    const d = new Date(t.date + "T00:00:00");
    if (d.getFullYear() !== year) return;
    totals[d.getMonth()] += t.amount;
  });
  return totals.map((total, i) => ({ month: formatMonthOnlyLabel(i, region), total }));
}

export interface ProductTotal {
  product: string;
  total: number;
}

// Expects transactions already scoped (via filterMercadoByScope) by the
// caller — this just aggregates whatever it's given, same normalization
// (trim + lowercase) as everywhere else products are grouped, so "Leite"
// and "leite" count as one product but keep the first-seen display casing.
export function groupByProductTotal(transactions: Transaction[]): ProductTotal[] {
  const totals: Record<string, ProductTotal> = {};
  transactions.forEach((t) => {
    const name = t.description.trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (!totals[key]) totals[key] = { product: name, total: 0 };
    totals[key].total += t.amount;
  });
  return Object.values(totals).sort((a, b) => b.total - a.total);
}
