import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import TextField from "./TextField";
import SelectField from "./SelectField";
import DateField from "./DateField";
import Button3D from "./Button3D";
import Alert from "./Alert";
import { createTransaction, createRecurringTransaction } from "../services/api";
import { CATEGORIES, DEFAULT_CATEGORY } from "../lib/categories";
import { colors } from "../theme";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ label: c.name, value: c.name }));
const FREQUENCY_OPTIONS = [
  { label: "Semanal", value: "weekly" },
  { label: "Mensal", value: "monthly" },
  { label: "Anual", value: "yearly" },
];

// Mirrors components/TransactionForm.tsx. Deliberately not ported yet: the
// "Bater foto do preço" camera+OCR button — Tesseract.js (web's zero-cost
// OCR engine) depends on browser Canvas/WASM APIs this environment can't
// verify work the same way with React Native's camera stack, and this pass
// is already large. Flagged as a known gap, not silently skipped.
export default function TransactionForm({ onSuccess }) {
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [date, setDate] = useState(todayStr());
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(""), 3000);
    return () => clearTimeout(timer);
  }, [success]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Informe um valor válido maior que zero.");
      return;
    }

    setLoading(true);
    try {
      if (isRecurring) {
        await createRecurringTransaction({ type, amount: parsedAmount, description, date, category, frequency });
      } else {
        await createTransaction({ type, amount: parsedAmount, description, date, category });
      }
      setSuccess(type === "income" ? "Entrada adicionada!" : "Saída adicionada!");
      setAmount("");
      setDescription("");
      setIsRecurring(false);
      setFrequency("monthly");
      onSuccess();
    } catch (err) {
      setError(err.message || "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Nova Transação</Text>

      <View style={styles.typeRow}>
        <Pressable
          onPress={() => setType("income")}
          style={[styles.typeButton, type === "income" ? styles.typeIncomeActive : styles.typeInactive]}
        >
          <Text style={type === "income" ? styles.typeTextActiveDark : styles.typeTextInactive}>Entrada</Text>
        </Pressable>
        <Pressable
          onPress={() => setType("expense")}
          style={[styles.typeButton, type === "expense" ? styles.typeExpenseActive : styles.typeInactive]}
        >
          <Text style={type === "expense" ? styles.typeTextActiveLight : styles.typeTextInactive}>Saída</Text>
        </Pressable>
      </View>

      <TextField
        label="Valor (R$)"
        value={amount}
        onChangeText={setAmount}
        placeholder="0,00"
        keyboardType="decimal-pad"
      />

      <TextField
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        placeholder="Ex: Salário, Aluguel..."
      />

      <SelectField label="Categoria" value={category} onValueChange={setCategory} options={CATEGORY_OPTIONS} />

      <DateField label="Data" value={date} onChange={setDate} />

      <Pressable style={styles.checkboxRow} onPress={() => setIsRecurring((v) => !v)}>
        <View style={[styles.checkbox, isRecurring && styles.checkboxChecked]}>
          {isRecurring && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>🔁 Repetir</Text>
      </Pressable>

      {isRecurring && (
        <SelectField value={frequency} onValueChange={setFrequency} options={FREQUENCY_OPTIONS} />
      )}

      {error ? <Alert type="error" message={error} /> : null}
      {success ? <Alert type="success" message={success} /> : null}

      <Button3D fullWidth loading={loading} onPress={handleSubmit}>
        Adicionar
      </Button3D>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
  },
  typeButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  typeIncomeActive: {
    backgroundColor: colors.neonGreen,
  },
  typeExpenseActive: {
    backgroundColor: colors.neonRed,
  },
  typeInactive: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  typeTextActiveDark: {
    fontWeight: "700",
    color: "#111827",
  },
  typeTextActiveLight: {
    fontWeight: "700",
    color: "#ffffff",
  },
  typeTextInactive: {
    fontWeight: "700",
    color: colors.textMuted,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.neonGreen,
    borderColor: colors.neonGreen,
  },
  checkmark: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "800",
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#d1d5db",
  },
});
