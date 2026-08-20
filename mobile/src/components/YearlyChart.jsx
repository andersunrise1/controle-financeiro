import { View, Text, StyleSheet } from "react-native";
import GroupedBarChart from "./GroupedBarChart";
import GradientText from "./GradientText";
import { groupByYear } from "../lib/chartGrouping";
import { formatBRL } from "../lib/currency";
import { colors } from "../theme";

// Mirrors components/YearlyChart.tsx.
export default function YearlyChart({ transactions }) {
  const yearly = groupByYear(transactions);

  if (yearly.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>Adicione transações para visualizar os gastos por ano.</Text>
      </View>
    );
  }

  const topYear = yearly.reduce((max, d) => (d.total > max.total ? d : max), yearly[0]);
  const highlightText = `${topYear.year} (${formatBRL(topYear.total)})`;

  const data = yearly.map((d) => ({
    label: d.year,
    bars: [{ key: "total", value: d.total, gradientId: "yearlyGrad", gradient: ["#ffd93d", "#d6249f"] }],
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Gastos por Ano</Text>
      <GroupedBarChart data={data} barWidth={28} />
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>Ano que você mais gastou: </Text>
        <GradientText fontSize={15} fontWeight="700" width={Math.max(120, highlightText.length * 10)} height={22} letterSpacing={0}>
          {highlightText}
        </GradientText>
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
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 20,
  },
  footer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  footerLabel: {
    fontSize: 13,
    color: "#d1d5db",
  },
});
