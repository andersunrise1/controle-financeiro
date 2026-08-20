import { View, Text, StyleSheet } from "react-native";
import GroupedBarChart from "./GroupedBarChart";
import { groupByMonth } from "../lib/chartGrouping";
import { colors } from "../theme";

// Mirrors components/ClusteredChart.tsx.
export default function ClusteredChart({ transactions }) {
  const data = groupByMonth(transactions);

  if (data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>Adicione transações para visualizar o gráfico.</Text>
      </View>
    );
  }

  const chartData = data.map((d) => ({
    label: d.month,
    bars: [
      { key: "entradas", value: d.entradas, color: colors.neonGreen },
      { key: "saidas", value: d.saidas, color: colors.neonRed },
    ],
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Entradas vs Saídas por Mês</Text>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.neonGreen }]} />
          <Text style={styles.legendText}>Entradas</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.neonRed }]} />
          <Text style={styles.legendText}>Saídas</Text>
        </View>
      </View>
      <GroupedBarChart data={chartData} />
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
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 20,
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
