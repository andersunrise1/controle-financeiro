import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useIAP } from "expo-iap";
import TopNavBar from "../components/TopNavBar";
import Button3D from "../components/Button3D";
import Alert from "../components/Alert";
import { verifyGooglePlayPurchase } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { useTheme } from "../context/ThemeContext";
import { translateError } from "../lib/i18n";

// Tem de ser idêntico a LIFETIME_PRODUCT_ID em backend/lib/googlePlay.ts e ao
// produto cadastrado no Play Console. Divergir aqui não dá erro visível:
// a compra simplesmente nunca é encontrada.
const LIFETIME_PRODUCT_ID = "divisa_vitalicio";

/**
 * Compra do Vitalício pelo Google Play Billing.
 *
 * Não é preferência nossa: o Google exige o Play Billing para conteúdo
 * digital comprado dentro de um app da loja, e apontar para o Mercado Pago
 * aqui dentro é motivo de suspensão. O site segue vendendo pelo Mercado Pago
 * normalmente — os dois caminhos levam ao mesmo `plan = 'lifetime'`, então
 * quem compra por um tem o outro liberado.
 *
 * **O preço mostrado vem do Google, não de nós.** Um produto no app tem o
 * valor fixado no Play Console, que o Google cobra e localiza; nosso código
 * nunca vê nem controla esse número. Exibir `displayPrice` é a única forma de
 * a tela prometer exatamente o que será cobrado.
 */
export default function VitalicioScreen() {
  const navigation = useNavigation();
  const { access, refreshUser } = useAuth();
  const { locale, t } = useLocale();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const jaTem = access?.plan === "lifetime";

  // `useIAP` vem antes de `concluir` de propósito, embora as opções abaixo
  // chamem `concluir`: a referência está dentro de uma função de seta, que só
  // roda quando uma compra acontece — e nesse momento tudo já existe. O
  // inverso (concluir antes) faria `finishTransaction` ser lido de uma
  // constante ainda não inicializada no mesmo escopo.
  const { connected, products, fetchProducts, requestPurchase, finishTransaction } =
    useIAP({
      onPurchaseSuccess: (compra) => concluir(compra),
      onPurchaseError: (err) => {
        setError(translateError(err?.message || t("vitalicioUnavailable"), locale));
        setLoading(false);
      },
    });

  const concluir = useCallback(
    async (compra) => {
      try {
        const token = compra?.purchaseToken;
        if (!token) {
          throw new Error(t("vitalicioUnavailable"));
        }

        // O servidor confere com o Google antes de liberar. Só depois disso a
        // transação é encerrada: o backend é quem decide se a compra vale, e
        // encerrar antes seria dar por boa uma compra ainda não verificada.
        await verifyGooglePlayPurchase(token);
        await finishTransaction({ purchase: compra, isConsumable: false });
        await refreshUser();
        setSucesso(true);
      } catch (err) {
        setError(translateError(err.message || t("vitalicioUnavailable"), locale));
      } finally {
        setLoading(false);
      }
    },
    [finishTransaction, locale, refreshUser, t],
  );

  useEffect(() => {
    if (Platform.OS !== "android" || !connected) return;
    // Engolir a falha é proposital: sem o produto a tela ainda funciona, só
    // não mostra o preço — e um erro aqui normalmente é a loja do aparelho
    // ainda não estar pronta, não algo que o usuário possa resolver.
    fetchProducts({ skus: [LIFETIME_PRODUCT_ID], type: "in-app" }).catch(() => {});
  }, [connected, fetchProducts]);

  const produto = products.find((p) => p.id === LIFETIME_PRODUCT_ID);

  async function comprar() {
    if (Platform.OS !== "android") {
      setError(t("vitalicioAndroidOnly"));
      return;
    }

    setLoading(true);
    setError("");
    try {
      await requestPurchase({
        request: { google: { skus: [LIFETIME_PRODUCT_ID] } },
        type: "in-app",
      });
      // O resultado não chega como retorno desta chamada: vem pelos callbacks
      // onPurchaseSuccess/onPurchaseError passados ao useIAP acima.
    } catch (err) {
      setError(translateError(err.message || t("vitalicioUnavailable"), locale));
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <TopNavBar />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{t("vitalicioTitle")}</Text>
          <Text style={styles.subtitle}>{t("vitalicioSubtitle")}</Text>

          <Text style={styles.price}>
            {produto?.displayPrice ?? t("vitalicioLoadingPrice")}
          </Text>

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

          {jaTem || sucesso ? (
            <Alert type="success" message={t("vitalicioOwned")} />
          ) : (
            <Button3D fullWidth loading={loading} onPress={comprar}>
              {loading ? t("vitalicioProcessing") : t("vitalicioBuyButton")}
            </Button3D>
          )}

          {error ? <Alert type="error" message={error} /> : null}
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
    price: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.accentGreenText,
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
