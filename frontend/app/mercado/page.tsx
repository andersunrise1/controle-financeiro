"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import MercadoQuickAdd from "@/components/MercadoQuickAdd";
import MercadoChart from "@/components/MercadoChart";
import TransactionList from "@/components/TransactionList";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { getTransactions, Transaction } from "@/lib/api";

const MERCADO_CATEGORY = "Mercado";

function MercadoContent() {
  const { setUser } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await getTransactions();
      setTransactions(data.transactions);
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

  const mercadoTransactions = transactions.filter((t) => t.category === MERCADO_CATEGORY);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-dark">
        <p className="text-gray-400">{t("loading")}</p>
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
        <MercadoChart transactions={mercadoTransactions} />
        <TransactionList
          transactions={mercadoTransactions}
          onDelete={loadData}
          onEdit={(t) => {
            setEditingTransaction(t);
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
