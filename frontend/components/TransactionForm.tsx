"use client";

import { useState, FormEvent, useEffect } from "react";
import Button3D from "./Button3D";
import Alert from "./Alert";
import { createTransaction } from "@/lib/api";
import { CATEGORIES, DEFAULT_CATEGORY } from "@/lib/categories";
import { useI18n } from "@/lib/i18n-context";
import { translateCategory, translateError } from "@/lib/i18n";

interface TransactionFormProps {
  onSuccess: () => void;
}

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { locale, t } = useI18n();
  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(""), 3000);
    return () => clearTimeout(timer);
  }, [success]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(translateError("Informe um valor válido maior que zero.", locale));
      return;
    }

    if (!date) {
      setError(translateError("Informe a data da transação.", locale));
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
      setSuccess(type === "income" ? t("successIncome") : t("successExpense"));
      setAmount("");
      setDescription("");
      onSuccess();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Erro ao salvar.";
      setError(translateError(raw, locale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-dark rounded-2xl p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-gray-100">
        {t("newTransactionTitle")}
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
            {t("incomeButton")}
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
            {t("expenseButton")}
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            {t("amountLabel")}
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
            {t("descriptionLabel")}
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            className="input-dark w-full rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            {t("categoryLabel")}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-dark w-full rounded-xl px-4 py-3"
          >
            {CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>
                {translateCategory(c.name, locale)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            {t("dateLabel")}
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
          {loading ? t("addButtonLoading") : t("addButton")}
        </Button3D>
      </form>
    </div>
  );
}
