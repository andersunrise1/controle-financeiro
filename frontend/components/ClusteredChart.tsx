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
import {
  formatCurrencyForLocale,
  formatCompactNumberForLocale,
  formatMonthLabel,
} from "@/lib/currency";
import { useI18n } from "@/lib/i18n-context";
import { Region } from "@/lib/regions";

const NEON_GREEN = "#39ff14";
const NEON_RED = "#ff073a";

interface ClusteredChartProps {
  transactions: Transaction[];
}

function groupByMonth(transactions: Transaction[], region: Region) {
  const grouped: Record<string, { month: string; entradas: number; saidas: number }> = {};

  transactions.forEach((t) => {
    const date = new Date(t.date + "T00:00:00");
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = formatMonthLabel(date, region);

    if (!grouped[key]) {
      grouped[key] = { month: label, entradas: 0, saidas: 0 };
    }

    if (t.type === "income") {
      grouped[key].entradas += t.amount;
    } else {
      grouped[key].saidas += t.amount;
    }
  });

  return Object.keys(grouped)
    .sort()
    .map((key) => grouped[key]);
}

export default function ClusteredChart({ transactions }: ClusteredChartProps) {
  const { region, rates, t } = useI18n();
  const data = groupByMonth(transactions, region);

  if (data.length === 0) {
    return (
      <div className="card-dark flex h-64 items-center justify-center rounded-2xl p-6 shadow-md">
        <p className="text-[color:var(--text-muted)]">{t("chartEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="card-dark rounded-2xl p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-[color:var(--text-primary)]">
        {t("chartTitle")}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={4} barCategoryGap="20%">
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
          <Bar
            dataKey="entradas"
            name={t("incomeLabel")}
            fill={NEON_GREEN}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="saidas"
            name={t("expenseLabel")}
            fill={NEON_RED}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
