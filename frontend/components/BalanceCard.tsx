"use client";

import { formatCurrency } from "@/lib/api";

interface BalanceCardProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

export default function BalanceCard({
  balance,
  totalIncome,
  totalExpense,
}: BalanceCardProps) {
  const isPositive = balance >= 0;

  return (
    <div className="card-dark rounded-2xl p-6 shadow-lg ring-2 ring-[#555]">
      <p className="text-sm font-medium uppercase tracking-wide text-gray-400">
        Saldo Atual
      </p>
      <p
        className={`mt-2 text-4xl font-bold ${isPositive ? "neon-green" : "neon-red"}`}
      >
        {formatCurrency(balance)}
      </p>
      <div className="mt-4 flex flex-wrap gap-6 text-sm">
        <div>
          <span className="text-gray-400">Entradas: </span>
          <span className="font-semibold neon-green">
            {formatCurrency(totalIncome)}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Saídas: </span>
          <span className="font-semibold neon-red">
            {formatCurrency(totalExpense)}
          </span>
        </div>
      </div>
    </div>
  );
}
