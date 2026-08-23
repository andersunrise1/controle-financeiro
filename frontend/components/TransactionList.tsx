"use client";

import { useState } from "react";
import { Transaction, deleteTransaction } from "@/lib/api";
import { CATEGORIES, getCategoryColor } from "@/lib/categories";
import { formatCurrencyForLocale, formatDateForRegion } from "@/lib/currency";
import { useI18n } from "@/lib/i18n-context";
import { translateCategory, translateError } from "@/lib/i18n";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: () => void;
  onEdit?: (transaction: Transaction) => void;
  titleKey?: "historyTitle" | "mercadoHistoryTitle";
  emptyKey?: "historyEmpty" | "mercadoHistoryEmpty";
}

export default function TransactionList({
  transactions,
  onDelete,
  onEdit,
  titleKey = "historyTitle",
  emptyKey = "historyEmpty",
}: TransactionListProps) {
  const { locale, region, rates, t: tr } = useI18n();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id);
      onDelete();
    } catch {
      alert(translateError("Erro ao remover transação.", locale));
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="card-dark rounded-2xl p-6 shadow-md">
        <p className="text-center text-[color:var(--text-muted)]">{tr(emptyKey)}</p>
      </div>
    );
  }

  const searchLower = search.trim().toLowerCase();
  const filtered = transactions.filter((item) => {
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (!searchLower) return true;

    const formattedDate = formatDateForRegion(
      new Date(item.date + "T00:00:00"),
      region
    );
    const haystack = `${item.description} ${formattedDate} ${translateCategory(item.category, locale)}`
      .toLowerCase();
    return haystack.includes(searchLower);
  });

  return (
    <div className="card-dark rounded-2xl p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-[color:var(--text-primary)]">
        {tr(titleKey)}
      </h2>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tr("searchPlaceholder")}
          aria-label={tr("searchPlaceholder")}
          className="input-dark flex-1 rounded-xl px-4 py-2.5 text-sm"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label={tr("allCategories")}
          className="input-dark rounded-xl px-4 py-2.5 text-sm sm:w-56"
        >
          <option value="">{tr("allCategories")}</option>
          {CATEGORIES.map((c) => (
            <option key={c.name} value={c.name}>
              {translateCategory(c.name, locale)}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-[color:var(--text-muted)]">{tr("historyNoResults")}</p>
      ) : (
        <div className="scrollbar-neon max-h-[480px] space-y-3 overflow-y-auto pr-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-input)] px-4 py-3"
            >
              <div>
                <p className="font-medium text-[color:var(--text-primary)]">
                  {item.description ||
                    (item.type === "income" ? tr("incomeButton") : tr("expenseButton"))}
                  {item.quantity !== null && (
                    <span className="ml-1.5 text-xs font-normal text-[color:var(--text-faint)]">
                      · {item.quantity}
                      {item.unit ? ` ${item.unit}` : ""}
                    </span>
                  )}
                  {item.recurring_id !== null && (
                    <span className="ml-1.5" title={tr("recurringBadgeTitle")}>
                      🔁
                    </span>
                  )}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{
                      color: getCategoryColor(item.category),
                      backgroundColor: `${getCategoryColor(item.category)}22`,
                      boxShadow: `0 0 6px ${getCategoryColor(item.category)}66`,
                    }}
                  >
                    {translateCategory(item.category, locale)}
                  </span>
                  <p className="text-xs text-[color:var(--text-muted)]">
                    {formatDateForRegion(new Date(item.date + "T00:00:00"), region)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`font-semibold ${
                    item.type === "income" ? "neon-green" : "neon-red"
                  }`}
                >
                  {item.type === "income" ? "+" : "-"}
                  {formatCurrencyForLocale(item.amount, region, rates.rates)}
                </span>
                {onEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    className="text-xs text-[color:var(--text-faint)] hover:text-[color:var(--text-accent-green)]"
                    title={tr("editTitle")}
                  >
                    ✎
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs text-[color:var(--text-faint)] hover:text-[color:var(--text-accent-red)]"
                  title={tr("removeTitle")}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
