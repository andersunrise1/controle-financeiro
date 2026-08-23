import { View, Text, StyleSheet } from "react-native";
import GroupedBarChart from "./GroupedBarChart";
import { groupByProductTotal } from "../lib/mercadoGrouping";
import { getProductColor } from "../lib/productColors";
import { formatCompactNumberForLocale } from "../lib/currency";
import { useLocale } from "../context/LocaleContext";
import { useTheme } from "../context/ThemeContext";

const MAX_PRODUCTS_SHOWN = 15;

// Mirrors components/MercadoChart.tsx — expects transactions already scoped
// to a year (or year+month) by the caller (MercadoScreen.jsx). Each product
// keeps a fixed color (getProductColor) instead of the shared sunset
// gradient, so switching the filter month-to-month still lets "which bar is
// arroz" stay recognizable at a glance.
export default function MercadoChart({ transactions }) {
  const { region, rates, t } = useLocale();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const products = groupByProductTotal(transactions).slice(0, MAX_PRODUCTS_SHOWN);

  if (products.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>{t("mercadoChartEmpty")}</Text>
      </View>
    );
  }

  const data = products.map((p) => ({
    label: p.product,
    bars: [{ key: "total", value: p.total, color: getProductColor(p.product) }],
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("mercadoChartTitle")}</Text>
      <GroupedBarChart
        data={data}
        barWidth={28}
        formatY={(v) => formatCompactNumberForLocale(v, region, rates.rates)}
      />
      <Text style={styles.footer}>{t("mercadoChartFooter")}</Text>
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
      marginTop: 10,
      fontSize: 11,
      color: colors.textFaint,
    },
  });
}
