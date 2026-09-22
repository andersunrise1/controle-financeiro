import { View, Text, StyleSheet } from "react-native";
import Button3D from "./Button3D";
import { useLocale } from "../context/LocaleContext";
import { useTheme } from "../context/ThemeContext";

// Shown when a screen's data fetch fails. Before this, those screens caught
// nothing at all: a failed load left the balance sitting at R$ 0,00 with no
// message, which reads as "your money is gone" rather than "we couldn't
// reach the server".
export default function LoadError({ message, onRetry }) {
  const { t } = useLocale();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message || t("loadErrorMessage")}</Text>
      {onRetry ? (
        <Button3D onPress={onRetry}>{t("loadErrorRetry")}</Button3D>
      ) : null}
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    wrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      gap: 14,
    },
    icon: {
      fontSize: 34,
    },
    message: {
      color: colors.textSecondary,
      fontSize: 15,
      textAlign: "center",
      lineHeight: 21,
    },
  });
}
