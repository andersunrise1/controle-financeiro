"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Transaction } from "@/lib/api";
import { CATEGORIES } from "@/lib/categories";
import {
  formatCurrencyForLocale,
  formatCompactNumberForLocale,
  formatMonthLabel,
} from "@/lib/currency";
import { useI18n } from "@/lib/i18n-context";
import { translateCategory } from "@/lib/i18n";
import { Region } from "@/lib/regions";
import { sunsetColorAt } from "@/lib/sunsetGradient";

const GRADIENT_SPREAD = 0.07;

interface CategoryChartProps {
  transactions: Transaction[];
}

// Recharts wants one flat object per month: the `month` label plus one key
// per category holding its total — so the index signature has to allow both
// a string and a number, and reads coerce with Number() where a total is
// expected.
interface MonthCategoryRow {
  month: string;
  [category: string]: string | number;
}

function groupByMonthAndCategory(transactions: Transaction[], region: Region) {
  const grouped: Record<string, MonthCategoryRow> = {};

  transactions.forEach((t) => {
    if (t.type !== "expense") return;

    const date = new Date(t.date + "T00:00:00");
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = formatMonthLabel(date, region);

    if (!grouped[key]) {
      grouped[key] = { month: label };
    }

    grouped[key][t.category] = Number(grouped[key][t.category] ?? 0) + t.amount;
  });

  return Object.keys(grouped)
    .sort()
    .map((key) => grouped[key]);
}

export default function CategoryChart({ transactions }: CategoryChartProps) {
  const { locale, region, rates, t } = useI18n();
  const data = groupByMonthAndCategory(transactions, region);

  const usedCategories = CATEGORIES.filter((c) =>
    data.some((month) => Number(month[c.name] ?? 0) > 0)
  );

  if (data.length === 0) {
    return (
      <div className="card-dark flex h-64 items-center justify-center rounded-2xl p-6 shadow-md">
        <p className="text-[color:var(--text-muted)]">{t("categoryChartEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="card-dark rounded-2xl p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-[color:var(--text-primary)]">
        {t("categoryChartTitle")}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={4} barCategoryGap="20%">
          <defs>
            {CATEGORIES.map((c, i) => {
              const t = i / (CATEGORIES.length - 1);
              return (
                <linearGradient
                  key={c.name}
                  id={`cat-grad-${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={sunsetColorAt(t - GRADIENT_SPREAD)} />
                  <stop offset="100%" stopColor={sunsetColorAt(t + GRADIENT_SPREAD)} />
                </linearGradient>
              );
            })}
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
          <Legend wrapperStyle={{ color: "#f3f4f6" }} />
          {usedCategories.map((c) => {
            const originalIndex = CATEGORIES.findIndex((cat) => cat.name === c.name);
            return (
              <Bar
                key={c.name}
                dataKey={c.name}
                name={translateCategory(c.name, locale)}
                fill={`url(#cat-grad-${originalIndex})`}
                radius={[4, 4, 0, 0]}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-3 text-xs text-[color:var(--text-faint)]">{t("categoryChartFooter")}</p>
    </div>
  );
}
