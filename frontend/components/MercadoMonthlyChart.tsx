"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Transaction } from "@/lib/api";
import { groupMonthlyTotals } from "@/lib/mercadoGrouping";
import { formatCurrencyForLocale, formatCompactNumberForLocale } from "@/lib/currency";
import { useI18n } from "@/lib/i18n-context";

interface MercadoMonthlyChartProps {
  transactions: Transaction[];
  year: number;
}

// Always the 12 months of the selected year (see groupMonthlyTotals) — the
// "estilo Entradas vs Saídas por Mês" the user asked for, one bar per
// month, so the overall spending trend across the year is visible at a
// glance, independent of whichever single month the product chart below is
// currently scoped to.
export default function MercadoMonthlyChart({ transactions, year }: MercadoMonthlyChartProps) {
  const { region, rates, t } = useI18n();
  const data = groupMonthlyTotals(transactions, year, region);
  const hasData = data.some((d) => d.total > 0);

  if (!hasData) {
    return (
      <div className="card-dark flex h-64 items-center justify-center rounded-2xl p-6 shadow-md">
        <p className="text-[color:var(--text-muted)]">{t("mercadoMonthlyChartEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="card-dark rounded-2xl p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-[color:var(--text-primary)]">
        {t("mercadoMonthlyChartTitle")}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barCategoryGap="20%">
          <defs>
            <linearGradient id="mercadoMonthlyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffd93d" />
              <stop offset="45%" stopColor="#ff8c42" />
              <stop offset="100%" stopColor="#d6249f" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickFormatter={(v) => formatCompactNumberForLocale(v, region, rates.rates)}
          />
          <Tooltip
            formatter={(value) => formatCurrencyForLocale(Number(value), region, rates.rates)}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #555",
              background: "#3a3a3a",
              color: "#f3f4f6",
            }}
            labelStyle={{ color: "#f3f4f6" }}
          />
          <Bar dataKey="total" name={t("mercadoMonthlyChartTitle")} fill="url(#mercadoMonthlyGrad)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
