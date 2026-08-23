"use client";

import { RecurringTransaction, setRecurringActive } from "@/lib/api";
import { formatCurrencyForLocale, formatDateForRegion } from "@/lib/currency";
import { useI18n } from "@/lib/i18n-context";
import { translateCategory } from "@/lib/i18n";

interface RecurringTransactionsListProps {
  recurring: RecurringTransaction[];
  onChange: () => void;
}

const FREQUENCY_KEY = {
  weekly: "recurrenceWeekly",
  monthly: "recurrenceMonthly",
  yearly: "recurrenceYearly",
} as const;

export default function RecurringTransactionsList({
  recurring,
  onChange,
}: RecurringTransactionsListProps) {
  const { locale, region, rates, t } = useI18n();

  const active = recurring.filter((r) => r.active === 1);

  if (active.length === 0) return null;

  const handleStop = async (id: number) => {
    await setRecurringActive(id, false);
    onChange();
  };

  return (
    <div className="card-dark rounded-2xl p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-[color:var(--text-primary)]">
        {t("recurringListTitle")}
      </h2>

      <div className="space-y-3">
        {active.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-input)] px-4 py-3"
          >
            <div>
              <p className="font-medium text-[color:var(--text-primary)]">
                🔁{" "}
                {item.description ||
                  (item.type === "income" ? t("incomeButton") : t("expenseButton"))}
                {" · "}
                {t(FREQUENCY_KEY[item.frequency])}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-[color:var(--text-muted)]">
                  {translateCategory(item.category, locale)}
                </span>
                <span className="text-xs text-[color:var(--text-faint)]">
                  {t("recurringNextLabel")}{" "}
                  {formatDateForRegion(
                    new Date(item.next_run_date + "T00:00:00"),
                    region
                  )}
                </span>
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
              <button
                type="button"
                onClick={() => handleStop(item.id)}
                className="rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-input)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-secondary)] transition hover:border-[#ff073a]/50 hover:text-[color:var(--alert-error-text)]"
              >
                {t("recurringStopButton")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
