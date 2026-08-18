"use client";

import { Transaction, formatCurrency, deleteTransaction } from "@/lib/api";
import { getCategoryColor } from "@/lib/categories";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: () => void;
}

export default function TransactionList({
  transactions,
  onDelete,
}: TransactionListProps) {
  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id);
      onDelete();
    } catch {
      alert("Erro ao remover transação.");
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="card-dark rounded-2xl p-6 shadow-md">
        <p className="text-center text-gray-400">
          Nenhuma transação registrada ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="card-dark rounded-2xl p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-gray-100">
        Histórico
      </h2>
      <div className="space-y-3">
        {transactions.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-xl border border-[#555] bg-[#2a2a2a] px-4 py-3"
          >
            <div>
              <p className="font-medium text-gray-100">
                {t.description || (t.type === "income" ? "Entrada" : "Saída")}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{
                    color: getCategoryColor(t.category),
                    backgroundColor: `${getCategoryColor(t.category)}22`,
                    boxShadow: `0 0 6px ${getCategoryColor(t.category)}66`,
                  }}
                >
                  {t.category}
                </span>
                <p className="text-xs text-gray-400">
                  {new Date(t.date + "T00:00:00").toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`font-semibold ${
                  t.type === "income" ? "neon-green" : "neon-red"
                }`}
              >
                {t.type === "income" ? "+" : "-"}
                {formatCurrency(t.amount)}
              </span>
              <button
                onClick={() => handleDelete(t.id)}
                className="text-xs text-gray-500 hover:text-[#ff073a]"
                title="Remover"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
