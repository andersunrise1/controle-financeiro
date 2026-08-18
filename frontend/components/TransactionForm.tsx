"use client";

import { useState, FormEvent } from "react";
import Button3D from "./Button3D";
import Alert from "./Alert";
import { createTransaction } from "@/lib/api";
import { CATEGORIES, DEFAULT_CATEGORY } from "@/lib/categories";

interface TransactionFormProps {
  onSuccess: () => void;
}

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Informe um valor válido maior que zero.");
      return;
    }

    if (!date) {
      setError("Informe a data da transação.");
      return;
    }

    setLoading(true);
    try {
      await createTransaction({
        type,
        amount: parsedAmount,
        description,
        date,
        category,
      });
      setSuccess(
        type === "income" ? "Entrada adicionada!" : "Saída adicionada!"
      );
      setAmount("");
      setDescription("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-dark rounded-2xl p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-gray-100">
        Nova Transação
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("income")}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
              type === "income"
                ? "bg-[#39ff14] text-gray-900 shadow-[0_3px_0_#2ecc0f,0_0_12px_rgba(57,255,20,0.4)]"
                : "bg-[#2a2a2a] text-gray-400 border border-[#555]"
            }`}
          >
            Entrada
          </button>
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
              type === "expense"
                ? "bg-[#ff073a] text-white shadow-[0_3px_0_#cc0530,0_0_12px_rgba(255,7,58,0.4)]"
                : "bg-[#2a2a2a] text-gray-400 border border-[#555]"
            }`}
          >
            Saída
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Valor (R$)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="input-dark w-full rounded-xl px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Descrição
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Salário, Aluguel..."
            className="input-dark w-full rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-dark w-full rounded-xl px-4 py-3"
          >
            {CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-dark w-full rounded-xl px-4 py-3"
            required
          />
        </div>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <Button3D type="submit" fullWidth disabled={loading}>
          {loading ? "Salvando..." : "Adicionar"}
        </Button3D>
      </form>
    </div>
  );
}
