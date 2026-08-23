"use client";

import { useState, useEffect, FormEvent } from "react";
import Button3D from "./Button3D";
import Alert from "./Alert";
import { createTransaction, updateTransaction, Transaction } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";
import { translateError } from "@/lib/i18n";
import { UNITS } from "@/lib/units";

const MERCADO_CATEGORY = "Mercado";

interface MercadoQuickAddProps {
  transactions: Transaction[];
  onSuccess: () => void;
  editingTransaction?: Transaction | null;
  onCancelEdit?: () => void;
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

export default function MercadoQuickAdd({ transactions, onSuccess, editingTransaction, onCancelEdit }: MercadoQuickAddProps) {
  const { locale, t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = !!editingTransaction;

  useEffect(() => {
    if (!editingTransaction) return;
    setProduct(editingTransaction.description);
    setPrice(String(editingTransaction.amount));
    setQuantity(editingTransaction.quantity !== null ? String(editingTransaction.quantity) : "");
    setUnit(editingTransaction.unit || "");
    setExpanded(true);
    setError("");
  }, [editingTransaction]);

  const buttonLabel = hasPurchaseThisMonth(transactions)
    ? t("mercadoButtonNext")
    : t("mercadoButtonFirst");

  const reset = () => {
    setExpanded(false);
    setProduct("");
    setPrice("");
    setQuantity("");
    setUnit("");
    setError("");
    onCancelEdit?.();
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

    let parsedQuantity: number | null = null;
    if (quantity.trim()) {
      parsedQuantity = parseFloat(quantity.replace(",", "."));
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        setError(translateError("Informe uma quantidade válida maior que zero.", locale));
        return;
      }
    }

    setLoading(true);
    try {
      if (isEditing && editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          type: "expense",
          amount: parsedPrice,
          description: product.trim(),
          date: editingTransaction.date,
          category: MERCADO_CATEGORY,
          quantity: parsedQuantity,
          unit: unit || null,
        });
      } else {
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        await createTransaction({
          type: "expense",
          amount: parsedPrice,
          description: product.trim(),
          date: today,
          category: MERCADO_CATEGORY,
          quantity: parsedQuantity,
          unit: unit || null,
        });
      }
      setSuccess(isEditing ? t("mercadoUpdatedMessage") : t("mercadoSuccessMessage"));
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
      <h2 className="mb-1 text-lg font-semibold text-[color:var(--text-primary)]">{t("mercadoPageTitle")}</h2>
      <p className="mb-4 text-sm text-[color:var(--text-muted)]">{t("mercadoPageSubtitle")}</p>

      {!expanded ? (
        <Button3D fullWidth onClick={() => setExpanded(true)}>
          {buttonLabel}
        </Button3D>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[color:var(--text-secondary)]">
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
            <label className="mb-1 block text-sm font-medium text-[color:var(--text-secondary)]">
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

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-[color:var(--text-secondary)]">
                {t("mercadoQuantityLabel")}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={t("mercadoQuantityPlaceholder")}
                className="input-dark w-full rounded-xl px-4 py-3"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-[color:var(--text-secondary)]">
                {t("mercadoUnitLabel")}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="input-dark w-full rounded-xl px-4 py-3"
              >
                <option value="">{t("mercadoUnitPlaceholder")}</option>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <Alert type="error" message={error} />}

          <div className="flex gap-2">
            <Button3D type="submit" fullWidth disabled={loading}>
              {loading
                ? t("mercadoSaveButtonLoading")
                : isEditing
                  ? t("saveChangesButton")
                  : t("mercadoSaveButton")}
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
