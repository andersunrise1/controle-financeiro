"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import BalanceCard from "@/components/BalanceCard";
import ClusteredChart from "@/components/ClusteredChart";
import CategoryChart from "@/components/CategoryChart";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import Button3D from "@/components/Button3D";
import { useAuth } from "@/lib/auth-context";
import {
  getTransactions,
  logout,
  Transaction,
  Summary,
} from "@/lib/api";

function DashboardContent() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await getTransactions();
      setTransactions(data.transactions);
      setSummary(data.summary);
    } catch {
      setUser(null);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router, setUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-dark">
        <p className="text-gray-400">Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <header className="border-b border-[#555] bg-bg-card shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo-takenote.svg" alt="Takenote" className="h-14 w-auto" />
            <p className="text-sm text-gray-400">
              Olá, <span className="font-semibold text-gray-200">{user?.name}</span>
            </p>
          </div>
          <Button3D variant="secondary" onClick={handleLogout}>
            Sair
          </Button3D>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <BalanceCard
          balance={summary.balance}
          totalIncome={summary.totalIncome}
          totalExpense={summary.totalExpense}
        />

        <ClusteredChart transactions={transactions} />
        <CategoryChart transactions={transactions} />

        <div className="grid gap-6 lg:grid-cols-2">
          <TransactionForm onSuccess={loadData} />
          <TransactionList transactions={transactions} onDelete={loadData} />
        </div>
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
