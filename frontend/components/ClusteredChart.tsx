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

const NEON_GREEN = "#39ff14";
const NEON_RED = "#ff073a";

interface ClusteredChartProps {
  transactions: Transaction[];
}

function groupByMonth(transactions: Transaction[]) {
  const grouped: Record<string, { month: string; entradas: number; saidas: number }> = {};

  transactions.forEach((t) => {
    const date = new Date(t.date + "T00:00:00");
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });

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
  const data = groupByMonth(transactions);

  if (data.length === 0) {
    return (
      <div className="card-dark flex h-64 items-center justify-center rounded-2xl p-6 shadow-md">
        <p className="text-gray-400">
          Adicione transações para visualizar o gráfico.
        </p>
      </div>
    );
  }

  return (
    <div className="card-dark rounded-2xl p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-gray-100">
        Entradas vs Saídas por Mês
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
          <Bar
            dataKey="entradas"
            name="Entradas"
            fill={NEON_GREEN}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="saidas"
            name="Saídas"
            fill={NEON_RED}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
