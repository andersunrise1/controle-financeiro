"use client";

import { useState } from "react";
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
import { formatCurrencyForLocale, formatCompactNumberForLocale } from "@/lib/currency";
import { useI18n } from "@/lib/i18n-context";

interface YearlyChartProps {
  transactions: Transaction[];
}

function groupByYear(transactions: Transaction[]) {
  const grouped: Record<string, number> = {};

  transactions.forEach((t) => {
    if (t.type !== "expense") return;
    const year = t.date.slice(0, 4);
    grouped[year] = (grouped[year] || 0) + t.amount;
  });

  return Object.keys(grouped)
    .sort()
    .map((year) => ({ year, total: grouped[year] }));
}

export default function YearlyChart({ transactions }: YearlyChartProps) {
  const { region, rates, t } = useI18n();
  const data = groupByYear(transactions);
  // null until the user clicks a bar — defaults to the highest-spend year,
  // same as the chart's original static behavior, but clicking any other
  // bar overrides it to show that year's total instead.
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  if (data.length === 0) {
    return (
      <div className="card-dark flex h-64 items-center justify-center rounded-2xl p-6 shadow-md">
        <p className="text-[color:var(--text-muted)]">{t("yearlyChartEmpty")}</p>
      </div>
    );
  }

  const topYear = data.reduce((max, d) => (d.total > max.total ? d : max), data[0]);
  const activeData = data.find((d) => d.year === selectedYear) ?? topYear;

  return (
    <div className="card-dark rounded-2xl p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-[color:var(--text-primary)]">
        {t("yearlyChartTitle")}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barCategoryGap="30%">
          <defs>
            <linearGradient id="sunsetGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffd93d" />
              <stop offset="45%" stopColor="#ff8c42" />
              <stop offset="100%" stopColor="#d6249f" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis dataKey="year" tick={{ fill: "#9ca3af", fontSize: 12 }} />
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
          <Bar
            dataKey="total"
            name={t("expenseLabel")}
            radius={[6, 6, 0, 0]}
            cursor="pointer"
            onClick={(barData) => setSelectedYear(barData.payload.year)}
          >
            {data.map((entry) => (
              <Cell
                key={entry.year}
                fill="url(#sunsetGrad)"
                fillOpacity={entry.year === activeData.year ? 1 : 0.35}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
        {t("yearlyChartTotalLabel")}{" "}
        <span
          className="font-semibold"
          style={{
            background: "linear-gradient(90deg, #ffd93d, #ff8c42, #d6249f)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {activeData.year} ({formatCurrencyForLocale(activeData.total, region, rates.rates)})
        </span>
      </p>
      <p className="mt-1 text-xs text-[color:var(--text-faint)]">{t("yearlyChartClickHint")}</p>
    </div>
  );
}
