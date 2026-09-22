import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopNavBar from "../components/TopNavBar";
import TopTabBar from "../components/TopTabBar";
import TextField from "../components/TextField";
import Button3D from "../components/Button3D";
import Alert from "../components/Alert";
import { deleteAccount } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { useTheme } from "../context/ThemeContext";
import { translateError } from "../lib/i18n";
import { PRIVACY_POLICY_URL } from "../lib/links";

// Account deletion has to be reachable from inside the app, not only by
// writing to support — the Play Store requires it of any app that lets you
// create an account. Two steps on purpose: the first press only reveals the
// confirmation, so the destructive action is never one tap away.
export default function AccountScreen() {
  const { user, setUser } = useAuth();
  const { locale, t } = useLocale();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setError("");

    if (!password) {
      setError(
        translateError("Informe sua senha para confirmar a exclusão.", locale)
      );
      return;
    }

    setLoading(true);
    try {
      await deleteAccount(password);
      // The account no longer exists; dropping the user sends the navigator
      // back to the login stack on its own.
      setUser(null);
    } catch (err) {
      setError(translateError(err.message || "Erro ao excluir a conta.", locale));
      setLoading(false);
    }
  };

  const cancel = () => {
    setConfirming(false);
    setPassword("");
    setError("");
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <TopNavBar />
      <TopTabBar active="Conta" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("accountDataTitle")}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>{t("nameLabel")}</Text>
              <Text style={styles.value}>{user?.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t("emailLabel")}</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>
            <Text
              style={styles.policyLink}
              onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
            >
              {t("privacyPolicyLink")}
            </Text>
          </View>

          <View style={styles.dangerCard}>
            <Text style={styles.dangerTitle}>{t("deleteAccountTitle")}</Text>
            <Text style={styles.dangerText}>
              {t("deleteAccountExplanation")}
            </Text>

            {!confirming ? (
              <Button3D variant="danger" fullWidth onPress={() => setConfirming(true)}>
                {t("deleteAccountButton")}
              </Button3D>
            ) : (
              <View style={{ gap: 14 }}>
                <Text style={styles.dangerWarning}>
                  {t("deleteAccountWarning")}
                </Text>

                <TextField
                  label={t("deleteAccountPasswordLabel")}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t("passwordPlaceholder")}
                  secureTextEntry
                />

                {error ? <Alert type="error" message={error} /> : null}

                <Button3D
                  variant="danger"
                  fullWidth
                  loading={loading}
                  onPress={handleDelete}
                >
                  {t("deleteAccountConfirmButton")}
                </Button3D>
                <Button3D variant="secondary" fullWidth onPress={cancel} disabled={loading}>
                  {t("mercadoCancelButton")}
                </Button3D>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
      padding: 20,
      gap: 12,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    label: {
      fontSize: 13,
      color: colors.textMuted,
    },
    value: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
      flexShrink: 1,
      textAlign: "right",
    },
    policyLink: {
      marginTop: 4,
      fontSize: 13,
      textDecorationLine: "underline",
      color: colors.textMuted,
    },
    dangerCard: {
      backgroundColor: colors.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(255,7,58,0.4)",
      padding: 20,
      gap: 12,
    },
    dangerTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.accentRedText,
    },
    dangerText: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSecondary,
    },
    dangerWarning: {
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "700",
      color: colors.accentRedText,
    },
  });
}
