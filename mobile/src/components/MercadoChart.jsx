import { View, Text, StyleSheet } from "react-native";
import GroupedBarChart from "./GroupedBarChart";
import { groupByProduct } from "../lib/chartGrouping";
import { useLocale } from "../context/LocaleContext";
import { colors } from "../theme";

const MAX_PRODUCTS_SHOWN = 10;

// Mirrors components/MercadoChart.tsx. Built on GroupedBarChart (the same
// hand-rolled react-native-svg primitive behind Yearly/Clustered/Category)
// rather than a charting library — this project has already hit real
// cross-platform rendering surprises with third-party libraries.
export default function MercadoChart({ transactions }) {
  const { t } = useLocale();
  const products = groupByProduct(transactions).slice(0, MAX_PRODUCTS_SHOWN);

  if (products.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>{t("mercadoChartEmpty")}</Text>
      </View>
    );
  }

  const data = products.map((p) => ({
    label: p.product,
    bars: [{ key: "count", value: p.count, gradientId: "mercadoGrad", gradient: ["#ffd93d", "#d6249f"] }],
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("mercadoChartTitle")}</Text>
      <GroupedBarChart data={data} barWidth={28} formatY={(v) => Math.round(v)} />
      <Text style={styles.footer}>{t("mercadoChartFooter")}</Text>
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
    marginTop: 10,
    fontSize: 11,
    color: colors.textFaint,
  },
});
