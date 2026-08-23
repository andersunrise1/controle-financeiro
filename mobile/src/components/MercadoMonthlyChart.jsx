import { View, Text, StyleSheet } from "react-native";
import GroupedBarChart from "./GroupedBarChart";
import { groupMonthlyTotals } from "../lib/mercadoGrouping";
import { formatCompactNumberForLocale } from "../lib/currency";
import { useLocale } from "../context/LocaleContext";
import { useTheme } from "../context/ThemeContext";

// Mirrors components/MercadoMonthlyChart.tsx — always the 12 months of the
// selected year (see groupMonthlyTotals), independent of whichever single
// month the product chart below is currently scoped to.
export default function MercadoMonthlyChart({ transactions, year }) {
  const { region, rates, t } = useLocale();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const data = groupMonthlyTotals(transactions, year, region);
  const hasData = data.some((d) => d.total > 0);

  if (!hasData) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>{t("mercadoMonthlyChartEmpty")}</Text>
      </View>
    );
  }

  const chartData = data.map((d) => ({
    label: d.month,
    bars: [{ key: "total", value: d.total, gradientId: "mercadoMonthlyGrad", gradient: ["#ffd93d", "#d6249f"] }],
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("mercadoMonthlyChartTitle")}</Text>
      <GroupedBarChart
        data={chartData}
        barWidth={18}
        formatY={(v) => formatCompactNumberForLocale(v, region, rates.rates)}
      />
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
      marginBottom: 12,
    },
    empty: {
      color: colors.textMuted,
      textAlign: "center",
      paddingVertical: 20,
    },
  });
}
