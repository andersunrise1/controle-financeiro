import { View, Text, StyleSheet } from "react-native";
import { formatBRL } from "../lib/currency";
import { colors } from "../theme";

// Mirrors components/BalanceCard.tsx.
export default function BalanceCard({ balance, totalIncome, totalExpense }) {
  const isPositive = balance >= 0;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>SALDO ATUAL</Text>
      <Text style={[styles.balance, { color: isPositive ? colors.neonGreen : colors.neonRed }]}>
        {formatBRL(balance)}
      </Text>
      <View style={styles.row}>
        <Text style={styles.muted}>
          Entradas: <Text style={{ color: colors.neonGreen, fontWeight: "700" }}>{formatBRL(totalIncome)}</Text>
        </Text>
        <Text style={styles.muted}>
          Saídas: <Text style={{ color: colors.neonRed, fontWeight: "700" }}>{formatBRL(totalExpense)}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    padding: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  balance: {
    marginTop: 8,
    fontSize: 34,
    fontWeight: "800",
  },
  row: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  muted: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
