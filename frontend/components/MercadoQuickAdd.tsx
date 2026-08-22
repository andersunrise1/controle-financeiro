"use client";

import { useState, FormEvent } from "react";
import Button3D from "./Button3D";
import Alert from "./Alert";
import { createTransaction, Transaction } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";
import { translateError } from "@/lib/i18n";

const MERCADO_CATEGORY = "Mercado";

interface MercadoQuickAddProps {
  transactions: Transaction[];
  onSuccess: () => void;
}

// One dynamic button instead of Nova Transação's Entrada/Saída toggle — this
// is always an expense (money leaves the balance the same way a Saída would,
// even if the user never logged a single Entrada). The label itself tracks
// whether a Mercado purchase already happened this calendar month.
function hasPurchaseThisMonth(transactions: Transaction[]): boolean {
  const now = new Date();
  return transactions.some((t) => {
    if (t.category !== MERCADO_CATEGORY) return false;
    const d = new Date(t.date + "T00:00:00");
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
}

export default function MercadoQuickAdd({ transactions, onSuccess }: MercadoQuickAddProps) {
  const { locale, t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const buttonLabel = hasPurchaseThisMonth(transactions)
    ? t("mercadoButtonNext")
    : t("mercadoButtonFirst");

  const reset = () => {
    setExpanded(false);
    setProduct("");
    setPrice("");
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const parsedPrice = parseFloat(price.replace(",", "."));
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError(translateError("Informe um valor válido maior que zero.", locale));
      return;
    }
    if (!product.trim()) {
      setError(translateError("Informe o nome do produto.", locale));
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      await createTransaction({
        type: "expense",
        amount: parsedPrice,
        description: product.trim(),
        date: today,
        category: MERCADO_CATEGORY,
      });
      setSuccess(t("mercadoSuccessMessage"));
      reset();
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
      <h2 className="mb-1 text-lg font-semibold text-gray-100">{t("mercadoPageTitle")}</h2>
      <p className="mb-4 text-sm text-gray-400">{t("mercadoPageSubtitle")}</p>

      {!expanded ? (
        <Button3D fullWidth onClick={() => setExpanded(true)}>
          {buttonLabel}
        </Button3D>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              {t("mercadoProductLabel")}
            </label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder={t("mercadoProductPlaceholder")}
              className="input-dark w-full rounded-xl px-4 py-3"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              {t("mercadoPriceLabel")}
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0,00"
              className="input-dark w-full rounded-xl px-4 py-3"
              required
            />
          </div>

          {error && <Alert type="error" message={error} />}

          <div className="flex gap-2">
            <Button3D type="submit" fullWidth disabled={loading}>
              {loading ? t("mercadoSaveButtonLoading") : t("mercadoSaveButton")}
            </Button3D>
            <Button3D type="button" variant="secondary" onClick={reset} disabled={loading}>
              {t("mercadoCancelButton")}
            </Button3D>
          </div>
        </form>
      )}

      {success && !expanded && <div className="mt-4"><Alert type="success" message={success} /></div>}
    </div>
  );
}
