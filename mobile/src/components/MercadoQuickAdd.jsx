import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import TextField from "./TextField";
import SelectField from "./SelectField";
import Button3D from "./Button3D";
import Alert from "./Alert";
import { createTransaction, updateTransaction } from "../services/api";
import { translateError } from "../lib/i18n";
import { useLocale } from "../context/LocaleContext";
import { useTheme } from "../context/ThemeContext";
import { UNITS } from "../lib/units";

const MERCADO_CATEGORY = "Mercado";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Mirrors components/MercadoQuickAdd.tsx. One dynamic-label button instead
// of TransactionForm's Entrada/Saída toggle — this is always an expense
// (money leaves the balance the same way a Saída would, even if the user
// never logged a single Entrada). The label tracks whether a Mercado
// purchase already happened this calendar month.
function hasPurchaseThisMonth(transactions) {
  const now = new Date();
  return transactions.some((t) => {
    if (t.category !== MERCADO_CATEGORY) return false;
    const d = new Date(`${t.date}T00:00:00`);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
}

export default function MercadoQuickAdd({ transactions, onSuccess, editingTransaction, onCancelEdit }) {
  const { locale, t } = useLocale();
  const { colors } = useTheme();
  const styles = getStyles(colors);
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
    setQuantity(editingTransaction.quantity !== null && editingTransaction.quantity !== undefined ? String(editingTransaction.quantity) : "");
    setUnit(editingTransaction.unit || "");
    setExpanded(true);
    setError("");
  }, [editingTransaction]);

  const buttonLabel = hasPurchaseThisMonth(transactions) ? t("mercadoButtonNext") : t("mercadoButtonFirst");

  const reset = () => {
    setExpanded(false);
    setProduct("");
    setPrice("");
    setQuantity("");
    setUnit("");
    setError("");
    onCancelEdit?.();
  };

  const handleSubmit = async () => {
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

    let parsedQuantity = null;
    if (quantity.trim()) {
      parsedQuantity = parseFloat(quantity.replace(",", "."));
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        setError(translateError("Informe uma quantidade válida maior que zero.", locale));
        return;
      }
    }

    setLoading(true);
    try {
      if (isEditing) {
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
        await createTransaction({
          type: "expense",
          amount: parsedPrice,
          description: product.trim(),
          date: todayStr(),
          category: MERCADO_CATEGORY,
          quantity: parsedQuantity,
          unit: unit || null,
        });
      }
      setSuccess(isEditing ? t("mercadoUpdatedMessage") : t("mercadoSuccessMessage"));
      reset();
      onSuccess();
    } catch (err) {
      setError(translateError(err.message || "Erro ao salvar.", locale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("mercadoPageTitle")}</Text>
      <Text style={styles.subtitle}>{t("mercadoPageSubtitle")}</Text>

      {!expanded ? (
        <Button3D fullWidth onPress={() => setExpanded(true)}>
          {buttonLabel}
        </Button3D>
      ) : (
        <View style={{ gap: 14 }}>
          <TextField
            label={t("mercadoProductLabel")}
            value={product}
            onChangeText={setProduct}
            placeholder={t("mercadoProductPlaceholder")}
            autoFocus
          />
          <TextField
            label={t("mercadoPriceLabel")}
            value={price}
            onChangeText={setPrice}
            placeholder="0,00"
            keyboardType="decimal-pad"
          />

          <View style={styles.buttonRow}>
            <View style={{ flex: 1 }}>
              <TextField
                label={t("mercadoQuantityLabel")}
                value={quantity}
                onChangeText={setQuantity}
                placeholder={t("mercadoQuantityPlaceholder")}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <SelectField
                label={t("mercadoUnitLabel")}
                value={unit}
                onValueChange={setUnit}
                options={[{ label: t("mercadoUnitPlaceholder"), value: "" }, ...UNITS.map((u) => ({ label: u, value: u }))]}
              />
            </View>
          </View>

          {error ? <Alert type="error" message={error} /> : null}

          <View style={styles.buttonRow}>
            <View style={{ flex: 1 }}>
              <Button3D fullWidth loading={loading} onPress={handleSubmit}>
                {loading ? t("mercadoSaveButtonLoading") : isEditing ? t("saveChangesButton") : t("mercadoSaveButton")}
              </Button3D>
            </View>
            <Button3D variant="secondary" onPress={reset} disabled={loading}>
              {t("mercadoCancelButton")}
            </Button3D>
          </View>
        </View>
      )}

      {success && !expanded ? <Alert type="success" message={success} /> : null}
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: 16,
      padding: 20,
      gap: 12,
    },
    title: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: -6,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
    },
  });
}
