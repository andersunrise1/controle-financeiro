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
import { useI18n } from "@/lib/i18n-context";

const MERCADO_CATEGORY = "Mercado";
const MAX_PRODUCTS_SHOWN = 10;

interface MercadoChartProps {
  transactions: Transaction[];
}

// Groups by a normalized (trimmed, lowercased) key so "Leite" and "leite"
// count as the same product, but displays the first-seen casing the user
// actually typed.
function groupByProduct(transactions: Transaction[]) {
  const counts: Record<string, { product: string; count: number }> = {};

  transactions.forEach((t) => {
    if (t.category !== MERCADO_CATEGORY) return;
    const name = t.description.trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (!counts[key]) {
      counts[key] = { product: name, count: 0 };
    }
    counts[key].count += 1;
  });

  return Object.values(counts).sort((a, b) => b.count - a.count);
}

export default function MercadoChart({ transactions }: MercadoChartProps) {
  const { t } = useI18n();
  const data = groupByProduct(transactions).slice(0, MAX_PRODUCTS_SHOWN);

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
          <defs>
            <linearGradient id="mercadoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffd93d" />
              <stop offset="45%" stopColor="#ff8c42" />
              <stop offset="100%" stopColor="#d6249f" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis
            dataKey="product"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis allowDecimals={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #555",
              background: "#3a3a3a",
              color: "#f3f4f6",
            }}
            labelStyle={{ color: "#f3f4f6" }}
          />
          <Bar dataKey="count" name={t("mercadoChartTitle")} fill="url(#mercadoGrad)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-3 text-xs text-[color:var(--text-faint)]">{t("mercadoChartFooter")}</p>
    </div>
  );
}
