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

interface CategoryChartProps {
  transactions: Transaction[];
}

function groupByMonthAndCategory(transactions: Transaction[], region: Region) {
  const grouped: Record<string, { month: string } & Record<string, number>> =
    {};

  transactions.forEach((t) => {
    const date = new Date(t.date + "T00:00:00");
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = formatMonthLabel(date, region);

    if (!grouped[key]) {
      grouped[key] = { month: label };
    }

    grouped[key][t.category] = (grouped[key][t.category] || 0) + t.amount;
  });

  return Object.keys(grouped)
    .sort()
    .map((key) => grouped[key]);
}

export default function CategoryChart({ transactions }: CategoryChartProps) {
  const { locale, region, t } = useI18n();
  const data = groupByMonthAndCategory(transactions, region);

  const usedCategories = CATEGORIES.filter((c) =>
    data.some((month) => (month[c.name] || 0) > 0)
  );

  if (data.length === 0) {
    return (
      <div className="card-dark flex h-64 items-center justify-center rounded-2xl p-6 shadow-md">
        <p className="text-gray-400">{t("categoryChartEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="card-dark rounded-2xl p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-gray-100">
        {t("categoryChartTitle")}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={4} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickFormatter={(v) => formatCompactNumberForLocale(v, region)}
          />
          <Tooltip
            formatter={(value) => formatCurrencyForLocale(Number(value), region)}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #555",
              background: "#3a3a3a",
              color: "#f3f4f6",
            }}
            labelStyle={{ color: "#f3f4f6" }}
          />
          <Legend wrapperStyle={{ color: "#f3f4f6" }} />
          {usedCategories.map((c) => (
            <Bar
              key={c.name}
              dataKey={c.name}
              name={translateCategory(c.name, locale)}
              fill={c.color}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-3 text-xs text-gray-500">{t("categoryChartFooter")}</p>
    </div>
  );
}
