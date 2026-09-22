"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import BalanceCard from "@/components/BalanceCard";
import ClusteredChart from "@/components/ClusteredChart";
import CategoryChart from "@/components/CategoryChart";
import YearlyChart from "@/components/YearlyChart";
import CurrencyConverter from "@/components/CurrencyConverter";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import RecurringTransactionsList from "@/components/RecurringTransactionsList";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import {
  getTransactions,
  getRecurringTransactions,
  Transaction,
  RecurringTransaction,
  Summary,
  ApiError,
} from "@/lib/api";

function DashboardContent() {
  const { setUser } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [transactionsData, recurringData] = await Promise.all([
        getTransactions(),
        getRecurringTransactions(),
      ]);
      setTransactions(transactionsData.transactions);
      setSummary(transactionsData.summary);
      setRecurring(recurringData.recurring);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-dark">
        <p className="text-[color:var(--text-muted)]">{t("loadingDashboard")}</p>
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

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <BalanceCard
              balance={summary.balance}
              totalIncome={summary.totalIncome}
              totalExpense={summary.totalExpense}
            />
            <TransactionForm
              onSuccess={loadData}
              editingTransaction={editingTransaction}
              onCancelEdit={() => setEditingTransaction(null)}
            />
            <RecurringTransactionsList recurring={recurring} onChange={loadData} />
          </div>
          <div className="space-y-6">
            <YearlyChart transactions={transactions} />
            <CurrencyConverter />
          </div>
        </div>

        <ClusteredChart transactions={transactions} />
        <CategoryChart transactions={transactions} />

        <TransactionList
          transactions={transactions}
          onDelete={loadData}
          onEdit={(t) => {
            setEditingTransaction(t);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
