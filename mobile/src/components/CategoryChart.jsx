import { View, Text, StyleSheet } from "react-native";
import GroupedBarChart from "./GroupedBarChart";
import { groupByMonthAndCategory } from "../lib/chartGrouping";
import { CATEGORIES } from "../lib/categories";
import { sunsetColorAt } from "../lib/sunsetGradient";
import { colors } from "../theme";

const GRADIENT_SPREAD = 0.07;

// Mirrors components/CategoryChart.tsx, including its per-bar local-gradient
// treatment (each category gets its own slice of the sunset spectrum,
// lighter at the top / darker at the bottom) added on the web side 2026-08-19.
export default function CategoryChart({ transactions }) {
  const data = groupByMonthAndCategory(transactions);
  const usedCategories = CATEGORIES.filter((c) => data.some((month) => (month[c.name] || 0) > 0));

  if (data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>Adicione transações para visualizar os gastos por categoria.</Text>
      </View>
    );
  }

  const chartData = data.map((month) => ({
    label: month.month,
    bars: usedCategories.map((c, i) => {
      const t = i / (CATEGORIES.length - 1);
      return {
        key: c.name,
        value: month[c.name] || 0,
        gradientId: `catGrad-${i}`,
        gradient: [sunsetColorAt(t - GRADIENT_SPREAD), sunsetColorAt(t + GRADIENT_SPREAD)],
      };
    }),
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Gastos por Categoria por Mês</Text>
      <View style={styles.legend}>
        {usedCategories.map((c) => (
          <View key={c.name} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: c.color }]} />
            <Text style={styles.legendText}>{c.name}</Text>
          </View>
        ))}
      </View>
      <GroupedBarChart data={chartData} barWidth={14} />
      <Text style={styles.footer}>
        Cada categoria ganha sua própria cor — quanto mais categorias você usar, mais cores aparecem no gráfico.
      </Text>
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
    flexWrap: "wrap",
    gap: 12,
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
    fontSize: 11,
    color: colors.textMuted,
  },
  footer: {
    marginTop: 10,
    fontSize: 11,
    color: colors.textFaint,
  },
});
