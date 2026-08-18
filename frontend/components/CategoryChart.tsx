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
import { Transaction, formatCurrency } from "@/lib/api";
import { CATEGORIES } from "@/lib/categories";

interface CategoryChartProps {
  transactions: Transaction[];
}

function groupByMonthAndCategory(transactions: Transaction[]) {
  const grouped: Record<string, { month: string } & Record<string, number>> =
    {};

  transactions.forEach((t) => {
    const date = new Date(t.date + "T00:00:00");
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });

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
  const data = groupByMonthAndCategory(transactions);

  const usedCategories = CATEGORIES.filter((c) =>
    data.some((month) => (month[c.name] || 0) > 0)
  );

  if (data.length === 0) {
    return (
      <div className="card-dark flex h-64 items-center justify-center rounded-2xl p-6 shadow-md">
        <p className="text-gray-400">
          Adicione transações para visualizar os gastos por categoria.
        </p>
      </div>
    );
  }

  return (
    <div className="card-dark rounded-2xl p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-gray-100">
        Gastos por Categoria por Mês
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={4} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickFormatter={(v) =>
              new Intl.NumberFormat("pt-BR", {
                notation: "compact",
                compactDisplay: "short",
              }).format(v)
            }
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
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
              name={c.name}
              fill={c.color}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-3 text-xs text-gray-500">
        Cada categoria ganha sua própria cor neon — quanto mais categorias
        você usar, mais cores aparecem no gráfico.
      </p>
    </div>
  );
}
