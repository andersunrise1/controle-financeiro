"use client";

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Transaction } from "@/lib/api";
import { groupByProductTotal } from "@/lib/mercadoGrouping";
import { getProductColor } from "@/lib/productColors";
import { formatCurrencyForLocale, formatCompactNumberForLocale } from "@/lib/currency";
import { useI18n } from "@/lib/i18n-context";

const MAX_PRODUCTS_SHOWN = 15;

interface MercadoChartProps {
  transactions: Transaction[];
}

// Expects transactions already scoped to a year (or year+month) by the
// caller (app/mercado/page.tsx) — this chart only aggregates and renders.
// Each product keeps a fixed color (getProductColor) instead of the shared
// sunset gradient, so switching the filter month-to-month still lets "which
// bar is arroz" stay recognizable at a glance.
export default function MercadoChart({ transactions }: MercadoChartProps) {
  const { region, rates, t } = useI18n();
  const data = groupByProductTotal(transactions).slice(0, MAX_PRODUCTS_SHOWN);

  if (data.length === 0) {
    return (
      <div className="card-dark flex h-64 items-center justify-center rounded-2xl p-6 shadow-md">
        <p className="text-[color:var(--text-muted)]">{t("mercadoChartEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="card-dark rounded-2xl p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-[color:var(--text-primary)]">{t("mercadoChartTitle")}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis
            dataKey="product"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            angle={-20}
            textAnchor="end"
            height={60}
          />
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
          <Bar dataKey="total" name={t("mercadoChartTitle")} radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.product} fill={getProductColor(entry.product)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-3 text-xs text-[color:var(--text-faint)]">{t("mercadoChartFooter")}</p>
    </div>
  );
}
