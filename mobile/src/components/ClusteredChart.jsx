import { View, Text, StyleSheet } from "react-native";
import GroupedBarChart from "./GroupedBarChart";
import { groupByMonth } from "../lib/chartGrouping";
import { formatCompactNumberForLocale } from "../lib/currency";
import { useLocale } from "../context/LocaleContext";
import { useTheme } from "../context/ThemeContext";

// Mirrors components/ClusteredChart.tsx.
export default function ClusteredChart({ transactions }) {
  const { region, rates, t } = useLocale();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const data = groupByMonth(transactions, region);

  if (data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>{t("chartEmpty")}</Text>
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
      <Text style={styles.title}>{t("chartTitle")}</Text>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.neonGreen }]} />
          <Text style={styles.legendText}>{t("incomeLabel")}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.neonRed }]} />
          <Text style={styles.legendText}>{t("expenseLabel")}</Text>
        </View>
      </View>
      <GroupedBarChart data={chartData} formatY={(v) => formatCompactNumberForLocale(v, region, rates.rates)} />
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
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
}
