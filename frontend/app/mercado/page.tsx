"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import MercadoQuickAdd from "@/components/MercadoQuickAdd";
import MercadoFilter from "@/components/MercadoFilter";
import MercadoMonthlyChart from "@/components/MercadoMonthlyChart";
import MercadoChart from "@/components/MercadoChart";
import TransactionList from "@/components/TransactionList";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { getTransactions, Transaction, ApiError } from "@/lib/api";
import { getMercadoTransactions, getMercadoYears, filterMercadoByScope } from "@/lib/mercadoGrouping";

function MercadoContent() {
  const { setUser } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await getTransactions();
      setTransactions(data.transactions);
    } catch (err) {
      // Only an invalid session belongs on the login page. A network blip
      // used to bounce the user out of the app entirely.
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setUser(null);
        router.replace("/login");
      } else {
        setLoadError(err instanceof Error ? err.message : "");
      }
    } finally {
      setLoading(false);
    }
  }, [router, setUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const mercadoTransactions = getMercadoTransactions(transactions);
  const years = getMercadoYears(transactions);
  // Defaults to the most recent year with actual purchases (not necessarily
  // the calendar year) so a fresh visit lands somewhere with real data —
  // falls back to the current year for a brand new account with none yet.
  const year = selectedYear ?? years[0] ?? new Date().getFullYear();
  const scopedTransactions = filterMercadoByScope(transactions, year, selectedMonth);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-dark">
        <p className="text-[color:var(--text-muted)]">{t("loading")}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-dark px-6 text-center">
        <p className="text-3xl">⚠️</p>
        <p className="max-w-sm text-[color:var(--text-secondary)]">{loadError}</p>
        <button
          onClick={() => {
            setLoading(true);
            loadData();
          }}
          className="rounded-xl bg-neon-green px-5 py-2 font-bold text-gray-900"
        >
          {t("loadErrorRetry")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <Navbar />

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <MercadoQuickAdd
          transactions={transactions}
          onSuccess={loadData}
          editingTransaction={editingTransaction}
          onCancelEdit={() => setEditingTransaction(null)}
        />

        {years.length > 0 && (
          <MercadoFilter
            years={years}
            year={year}
            onYearChange={setSelectedYear}
            month={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        )}

        <MercadoMonthlyChart transactions={mercadoTransactions} year={year} />
        <MercadoChart transactions={scopedTransactions} />

        <TransactionList
          transactions={scopedTransactions}
          onDelete={loadData}
          onEdit={(item) => {
            setEditingTransaction(item);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          titleKey="mercadoHistoryTitle"
          emptyKey="mercadoHistoryEmpty"
        />
      </main>
    </div>
  );
}

export default function MercadoPage() {
  return (
    <ProtectedRoute>
      <MercadoContent />
    </ProtectedRoute>
  );
}
