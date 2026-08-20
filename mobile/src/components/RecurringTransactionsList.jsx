import { View, Text, Pressable, StyleSheet } from "react-native";
import { setRecurringActive } from "../services/api";
import { formatBRL, formatDateBR } from "../lib/currency";
import { colors } from "../theme";

const FREQUENCY_LABEL = { weekly: "Semanal", monthly: "Mensal", yearly: "Anual" };

// Mirrors components/RecurringTransactionsList.tsx.
export default function RecurringTransactionsList({ recurring, onChange }) {
  const active = recurring.filter((r) => r.active === 1);
  if (active.length === 0) return null;

  const handleStop = async (id) => {
    await setRecurringActive(id, false);
    onChange();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Recorrências Ativas</Text>
      <View style={{ gap: 10 }}>
        {active.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>
                🔁 {item.description || (item.type === "income" ? "Entrada" : "Saída")} · {FREQUENCY_LABEL[item.frequency]}
              </Text>
              <Text style={styles.itemMeta}>
                {item.category} · Próxima: {formatDateBR(item.next_run_date)}
              </Text>
            </View>
            <Text style={[styles.amount, { color: item.type === "income" ? colors.neonGreen : colors.neonRed }]}>
              {item.type === "income" ? "+" : "-"}{formatBRL(item.amount)}
            </Text>
            <Pressable style={styles.stopButton} onPress={() => handleStop(item.id)}>
              <Text style={styles.stopText}>Parar</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    padding: 12,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 13,
  },
  itemMeta: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 2,
  },
  amount: {
    fontWeight: "700",
    fontSize: 13,
  },
  stopButton: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  stopText: {
    color: "#d1d5db",
    fontSize: 11,
    fontWeight: "700",
  },
});
