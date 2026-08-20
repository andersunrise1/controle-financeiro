import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import TextField from "./TextField";
import SelectField from "./SelectField";
import { deleteTransaction } from "../services/api";
import { CATEGORIES, getCategoryColor } from "../lib/categories";
import { translateCategory } from "../lib/i18n";
import { formatCurrencyForLocale, formatDateForRegion } from "../lib/currency";
import { useLocale } from "../context/LocaleContext";
import { colors } from "../theme";

// Mirrors components/TransactionList.tsx — including deleting immediately
// on tap with no confirmation step, matching the web behavior exactly (an
// earlier version of this screen added a confirm dialog the web doesn't
// have; removed for fidelity, which also sidesteps Alert.alert's total
// lack of a react-native-web implementation).
export default function TransactionList({ transactions, onDelete }) {
  const { locale, region, rates, t } = useLocale();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const CATEGORY_FILTER_OPTIONS = [
    { label: t("allCategories"), value: "" },
    ...CATEGORIES.map((c) => ({ label: translateCategory(c.name, locale), value: c.name })),
  ];

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    onDelete();
  };

  if (transactions.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>{t("historyEmpty")}</Text>
      </View>
    );
  }

  const searchLower = search.trim().toLowerCase();
  const filtered = transactions.filter((item) => {
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (!searchLower) return true;
    const haystack = `${item.description} ${formatDateForRegion(new Date(`${item.date}T00:00:00`), region)} ${translateCategory(item.category, locale)}`.toLowerCase();
    return haystack.includes(searchLower);
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("historyTitle")}</Text>

      <TextField value={search} onChangeText={setSearch} placeholder={t("searchPlaceholder")} />
      <SelectField value={categoryFilter} onValueChange={setCategoryFilter} options={CATEGORY_FILTER_OPTIONS} />

      {filtered.length === 0 ? (
        <Text style={styles.empty}>{t("historyNoResults")}</Text>
      ) : (
        <View style={{ gap: 10, marginTop: 12 }}>
          {filtered.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>
                  {item.description || (item.type === "income" ? t("incomeButton") : t("expenseButton"))}
                  {item.recurring_id !== null ? " 🔁" : ""}
                </Text>
                <View style={styles.itemMetaRow}>
                  <View style={[styles.badge, { borderColor: getCategoryColor(item.category) }]}>
                    <Text style={[styles.badgeText, { color: getCategoryColor(item.category) }]}>
                      {translateCategory(item.category, locale)}
                    </Text>
                  </View>
                  <Text style={styles.itemDate}>{formatDateForRegion(new Date(`${item.date}T00:00:00`), region)}</Text>
                </View>
              </View>
              <Text style={[styles.amount, { color: item.type === "income" ? colors.neonGreen : colors.neonRed }]}>
                {item.type === "income" ? "+" : "-"}{formatCurrencyForLocale(item.amount, region, rates.rates)}
              </Text>
              <Pressable onPress={() => handleDelete(item.id)} hitSlop={10}>
                <Text style={styles.removeIcon}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 8,
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
    fontSize: 14,
  },
  itemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  itemDate: {
    color: colors.textFaint,
    fontSize: 11,
  },
  amount: {
    fontWeight: "700",
    fontSize: 13,
  },
  removeIcon: {
    color: colors.textFaint,
    fontSize: 16,
  },
});
