import { View, Text, StyleSheet } from "react-native";
import GroupedBarChart from "./GroupedBarChart";
import { groupByMonthAndCategory } from "../lib/chartGrouping";
import { CATEGORIES } from "../lib/categories";
import { translateCategory } from "../lib/i18n";
import { sunsetColorAt } from "../lib/sunsetGradient";
import { formatCompactNumberForLocale } from "../lib/currency";
import { useLocale } from "../context/LocaleContext";
import { colors } from "../theme";

const GRADIENT_SPREAD = 0.07;

// Mirrors components/CategoryChart.tsx, including its per-bar local-gradient
// treatment (each category gets its own slice of the sunset spectrum).
export default function CategoryChart({ transactions }) {
  const { locale, region, rates, t } = useLocale();
  const data = groupByMonthAndCategory(transactions, region);
  const usedCategories = CATEGORIES.filter((c) => data.some((month) => (month[c.name] || 0) > 0));

  if (data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>{t("categoryChartEmpty")}</Text>
      </View>
    );
  }

  const chartData = data.map((month) => ({
    label: month.month,
    bars: usedCategories.map((c, i) => {
      const tPos = i / (CATEGORIES.length - 1);
      return {
        key: c.name,
        value: month[c.name] || 0,
        gradientId: `catGrad-${i}`,
        gradient: [sunsetColorAt(tPos - GRADIENT_SPREAD), sunsetColorAt(tPos + GRADIENT_SPREAD)],
      };
    }),
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("categoryChartTitle")}</Text>
      <View style={styles.legend}>
        {usedCategories.map((c) => (
          <View key={c.name} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: c.color }]} />
            <Text style={styles.legendText}>{translateCategory(c.name, locale)}</Text>
          </View>
        ))}
      </View>
      <GroupedBarChart data={chartData} barWidth={14} formatY={(v) => formatCompactNumberForLocale(v, region, rates.rates)} />
      <Text style={styles.footer}>{t("categoryChartFooter")}</Text>
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
