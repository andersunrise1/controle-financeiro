"use client";

import { formatCurrencyForLocale } from "@/lib/currency";
import { useI18n } from "@/lib/i18n-context";

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
  const { region, t } = useI18n();
  const isPositive = balance >= 0;

  return (
    <div className="card-dark rounded-2xl p-6 shadow-lg ring-2 ring-[#555]">
      <p className="text-sm font-medium uppercase tracking-wide text-gray-400">
        {t("balanceLabel")}
      </p>
      <p
        className={`mt-2 text-4xl font-bold ${isPositive ? "neon-green" : "neon-red"}`}
      >
        {formatCurrencyForLocale(balance, region)}
      </p>
      <div className="mt-4 flex flex-wrap gap-6 text-sm">
        <div>
          <span className="text-gray-400">{t("incomeLabel")}: </span>
          <span className="font-semibold neon-green">
            {formatCurrencyForLocale(totalIncome, region)}
          </span>
        </div>
        <div>
          <span className="text-gray-400">{t("expenseLabel")}: </span>
          <span className="font-semibold neon-red">
            {formatCurrencyForLocale(totalExpense, region)}
          </span>
        </div>
      </div>
    </div>
  );
}
