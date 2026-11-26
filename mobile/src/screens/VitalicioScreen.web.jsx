import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import TopNavBar from "../components/TopNavBar";
import Button3D from "../components/Button3D";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { useTheme } from "../context/ThemeContext";

/**
 * Versão web desta tela, sem `expo-iap`.
 *
 * O Metro resolve `VitalicioScreen.web.jsx` no lugar de `VitalicioScreen.jsx`
 * quando o alvo é web — **e só com import sem extensão**
 * (`"../screens/VitalicioScreen"`). Com `.jsx` explícito, a resolução por
 * plataforma não acontece e o arquivo nativo é carregado também na web.
 *
 * Existe porque `expo-iap` não tem implementação para web: o `useIAP` monta
 * ouvintes nativos e estoura "Cannot find native module" assim que a tela
 * abre, antes mesmo de qualquer tentativa de compra. Mesmo padrão já usado
 * para o AdMob (`ads.web.js`, `BannerAdSlot.web.jsx`).
 *
 * Não é perda: a compra pelo Play Billing só existe no Android. Quem abre o
 * DIVISA no navegador compra pelo site, com Mercado Pago.
 */
export default function VitalicioScreen() {
  const navigation = useNavigation();
  const { access } = useAuth();
  const { t } = useLocale();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const jaTem = access?.plan === "lifetime";

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <TopNavBar />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{t("vitalicioTitle")}</Text>
          <Text style={styles.subtitle}>{t("vitalicioSubtitle")}</Text>

          <View style={styles.features}>
            {[t("vitalicioFeature1"), t("vitalicioFeature2"), t("vitalicioFeature3")].map(
              (texto) => (
                <View key={texto} style={styles.featureRow}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={styles.featureText}>{texto}</Text>
                </View>
              ),
            )}
          </View>

          {jaTem ? (
            <Alert type="success" message={t("vitalicioOwned")} />
          ) : (
            <Alert type="error" message={t("vitalicioAndroidOnly")} />
          )}
        </View>

        <Button3D variant="secondary" fullWidth onPress={() => navigation.goBack()}>
          {t("vitalicioBack")}
        </Button3D>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bgDark,
    },
    content: {
      padding: 16,
      gap: 16,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 20,
      gap: 14,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSecondary,
    },
    features: {
      gap: 8,
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    featureCheck: {
      fontSize: 14,
      color: colors.accentGreenText,
    },
    featureText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textPrimary,
    },
  });
}
