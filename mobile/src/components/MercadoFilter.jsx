import { View, StyleSheet } from "react-native";
import SelectField from "./SelectField";
import { useLocale } from "../context/LocaleContext";
import { formatMonthFullLabel } from "../lib/currency";

// Mirrors components/MercadoFilter.tsx — Ano + Mês selects that drive both
// Mercado charts and the history list to the same scope.
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function MercadoFilter({ years, year, onYearChange, month, onMonthChange }) {
  const { region, t } = useLocale();

  const yearOptions = years.map((y) => ({ label: String(y), value: y }));
  const monthOptions = [
    { label: t("mercadoFilterAllMonths"), value: "all" },
    ...Array.from({ length: 12 }, (_, i) => ({
      label: capitalize(formatMonthFullLabel(i, region)),
      value: i,
    })),
  ];

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <SelectField
          label={t("mercadoFilterYearLabel")}
          value={year}
          onValueChange={(v) => onYearChange(Number(v))}
          options={yearOptions}
        />
      </View>
      <View style={{ flex: 1 }}>
        <SelectField
          label={t("mercadoFilterMonthLabel")}
          value={month === null ? "all" : month}
          onValueChange={(v) => onMonthChange(v === "all" ? null : Number(v))}
          options={monthOptions}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
  },
});
