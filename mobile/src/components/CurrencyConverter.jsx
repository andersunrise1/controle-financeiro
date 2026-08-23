import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import TextField from "./TextField";
import RegionPicker from "./RegionPicker";
import { useLocale } from "../context/LocaleContext";
import { REGION_CURRENCY, REGION_INTL_LOCALE, VOLATILE_REGIONS } from "../lib/regions";
import { useTheme } from "../context/ThemeContext";

// Mirrors components/CurrencyConverter.tsx.
export default function CurrencyConverter() {
  const { region, rates, t } = useLocale();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState(region);
  const [to, setTo] = useState(region === "BR" ? "US" : "BR");

  const parsedAmount = parseFloat(amount.replace(",", ".")) || 0;
  const inBRL = parsedAmount / rates.rates[from];
  const converted = inBRL * rates.rates[to];

  const resultFormatted = new Intl.NumberFormat(REGION_INTL_LOCALE[to], {
    style: "currency",
    currency: REGION_CURRENCY[to],
  }).format(converted);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const isVolatile = VOLATILE_REGIONS.includes(from) || VOLATILE_REGIONS.includes(to);
  const updatedAtFormatted = rates.updatedAt
    ? new Date(rates.updatedAt).toLocaleString(REGION_INTL_LOCALE[region])
    : null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("converterTitle")}</Text>
      <Text style={styles.subtitle}>{t("converterSubtitle")}</Text>

      <TextField
        label={t("converterAmountLabel")}
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{t("converterFrom")}</Text>
          <RegionPicker value={from} onChange={setFrom} />
        </View>

        <Pressable style={styles.swapButton} onPress={handleSwap}>
          <Text style={styles.swapIcon}>⇄</Text>
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{t("converterTo")}</Text>
          <RegionPicker value={to} onChange={setTo} />
        </View>
      </View>

      <Text style={styles.result}>{resultFormatted}</Text>

      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: rates.isLive ? colors.neonGreen : colors.textMuted }]} />
        <Text style={styles.statusText}>
          {rates.isLive ? t("ratesLive") : t("ratesFallback")}
          {updatedAtFormatted ? ` · ${t("ratesUpdatedAt")} ${updatedAtFormatted}` : ""}
        </Text>
      </View>

      {isVolatile && <Text style={styles.warning}>⚠ {t("volatileCurrencyWarning")}</Text>}
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: 16,
      padding: 20,
      gap: 14,
    },
    title: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    subtitle: {
      marginTop: -8,
      fontSize: 13,
      color: colors.textMuted,
    },
    label: {
      marginBottom: 6,
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    row: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
    },
    swapButton: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.inputBg,
      borderRadius: 100,
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 1,
    },
    swapIcon: {
      color: colors.textSecondary,
      fontSize: 18,
    },
    result: {
      marginTop: 6,
      textAlign: "center",
      fontSize: 30,
      fontWeight: "800",
      color: colors.accentGreenText,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      fontSize: 11,
      color: colors.textFaint,
    },
    warning: {
      textAlign: "center",
      fontSize: 11,
      color: colors.warningText,
    },
  });
}
