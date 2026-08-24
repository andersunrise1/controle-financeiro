import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import GroupedBarChart from "./GroupedBarChart";
import GradientText from "./GradientText";
import { groupByYear } from "../lib/chartGrouping";
import { formatCurrencyForLocale, formatCompactNumberForLocale } from "../lib/currency";
import { useLocale } from "../context/LocaleContext";
import { useTheme } from "../context/ThemeContext";

// Mirrors components/YearlyChart.tsx, including tap-to-select: tapping a
// year's bar shows that year's total below instead of always the
// highest-spend year (which is still the default before any tap).
export default function YearlyChart({ transactions }) {
  const { region, rates, t } = useLocale();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const yearly = groupByYear(transactions);
  const [selectedYear, setSelectedYear] = useState(null);

  if (yearly.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>{t("yearlyChartEmpty")}</Text>
      </View>
    );
  }

  const topYear = yearly.reduce((max, d) => (d.total > max.total ? d : max), yearly[0]);
  const activeYear = yearly.find((d) => d.year === selectedYear) ?? topYear;
  const highlightText = `${activeYear.year} (${formatCurrencyForLocale(activeYear.total, region, rates.rates)})`;

  const data = yearly.map((d) => ({
    label: d.year,
    year: d.year,
    bars: [
      {
        key: "total",
        value: d.total,
        gradientId: "yearlyGrad",
        gradient: ["#ffd93d", "#d6249f"],
        opacity: d.year === activeYear.year ? 1 : 0.35,
      },
    ],
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("yearlyChartTitle")}</Text>
      <GroupedBarChart
        data={data}
        barWidth={28}
        formatY={(v) => formatCompactNumberForLocale(v, region, rates.rates)}
        onGroupPress={(group) => setSelectedYear(group.year)}
      />
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>{t("yearlyChartTotalLabel")} </Text>
        <GradientText fontSize={15} fontWeight="700" width={Math.max(120, highlightText.length * 10)} height={22} letterSpacing={0}>
          {highlightText}
        </GradientText>
      </View>
      <Text style={styles.hint}>{t("yearlyChartClickHint")}</Text>
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
    footer: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },
    footerLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    hint: {
      marginTop: 4,
      fontSize: 11,
      color: colors.textFaint,
    },
  });
}
