import { View, Text, Pressable, StyleSheet } from "react-native";
import { setRecurringActive } from "../services/api";
import { translateCategory } from "../lib/i18n";
import { formatCurrencyForLocale, formatDateForRegion } from "../lib/currency";
import { useLocale } from "../context/LocaleContext";
import { colors } from "../theme";

const FREQUENCY_KEY = { weekly: "recurrenceWeekly", monthly: "recurrenceMonthly", yearly: "recurrenceYearly" };

// Mirrors components/RecurringTransactionsList.tsx.
export default function RecurringTransactionsList({ recurring, onChange }) {
  const { locale, region, rates, t } = useLocale();
  const active = recurring.filter((r) => r.active === 1);
  if (active.length === 0) return null;

  const handleStop = async (id) => {
    await setRecurringActive(id, false);
    onChange();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("recurringListTitle")}</Text>
      <View style={{ gap: 10 }}>
        {active.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>
                🔁 {item.description || (item.type === "income" ? t("incomeButton") : t("expenseButton"))} · {t(FREQUENCY_KEY[item.frequency])}
              </Text>
              <Text style={styles.itemMeta}>
                {translateCategory(item.category, locale)} · {t("recurringNextLabel")} {formatDateForRegion(new Date(`${item.next_run_date}T00:00:00`), region)}
              </Text>
            </View>
            <Text style={[styles.amount, { color: item.type === "income" ? colors.neonGreen : colors.neonRed }]}>
              {item.type === "income" ? "+" : "-"}{formatCurrencyForLocale(item.amount, region, rates.rates)}
            </Text>
            <Pressable style={styles.stopButton} onPress={() => handleStop(item.id)}>
              <Text style={styles.stopText}>{t("recurringStopButton")}</Text>
            </Pressable>
          </View>
        ))}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    padding: 12,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 13,
  },
  itemMeta: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 2,
  },
  amount: {
    fontWeight: "700",
    fontSize: 13,
  },
  stopButton: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  stopText: {
    color: "#d1d5db",
    fontSize: 11,
    fontWeight: "700",
  },
});
