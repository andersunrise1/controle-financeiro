import { View, Text, StyleSheet } from "react-native";
import { formatCurrencyForLocale } from "../lib/currency";
import { useLocale } from "../context/LocaleContext";
import { useTheme } from "../context/ThemeContext";

// Mirrors components/BalanceCard.tsx.
export default function BalanceCard({ balance, totalIncome, totalExpense }) {
  const { region, rates, t } = useLocale();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const isPositive = balance >= 0;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t("balanceLabel").toUpperCase()}</Text>
      <Text style={[styles.balance, { color: isPositive ? colors.accentGreenText : colors.accentRedText }]}>
        {formatCurrencyForLocale(balance, region, rates.rates)}
      </Text>
      <View style={styles.row}>
        <Text style={styles.muted}>
          {t("incomeLabel")}: <Text style={{ color: colors.accentGreenText, fontWeight: "700" }}>{formatCurrencyForLocale(totalIncome, region, rates.rates)}</Text>
        </Text>
        <Text style={styles.muted}>
          {t("expenseLabel")}: <Text style={{ color: colors.accentRedText, fontWeight: "700" }}>{formatCurrencyForLocale(totalExpense, region, rates.rates)}</Text>
        </Text>
      </View>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.inputBorder,
      padding: 20,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 1,
      color: colors.textMuted,
    },
    balance: {
      marginTop: 8,
      fontSize: 34,
      fontWeight: "800",
    },
    row: {
      marginTop: 14,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 20,
    },
    muted: {
      fontSize: 13,
      color: colors.textMuted,
    },
  });
}
