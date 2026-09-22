import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DivisaLogo from "../components/DivisaLogo";
import TextField from "../components/TextField";
import Button3D from "../components/Button3D";
import Alert from "../components/Alert";
import { resetPassword, isValidEmail, isValidPassword } from "../services/api";
import { useLocale } from "../context/LocaleContext";
import { useTheme } from "../context/ThemeContext";
import { translateError } from "../lib/i18n";

export default function ResetPasswordScreen({ navigation, route }) {
  const { locale, t } = useLocale();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Carried over from the previous screen so the person doesn't retype it.
  const [email, setEmail] = useState(route?.params?.email ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!isValidEmail(email)) {
      setError(translateError("Informe um e-mail válido.", locale));
      return;
    }
    if (code.trim().length !== 6) {
      setError(translateError("Informe o código recebido.", locale));
      return;
    }
    if (!isValidPassword(password)) {
      setError(
        translateError("A senha deve ter no mínimo 6 caracteres.", locale)
      );
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, code.trim(), password);
      setDone(true);
    } catch (err) {
      setError(
        translateError(err.message || "Erro ao redefinir a senha.", locale)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.logoWrapper}>
              <DivisaLogo size="large" />
            </View>

            <Text style={styles.title}>{t("resetPasswordTitle")}</Text>
            <Text style={styles.subtitle}>{t("resetPasswordSubtitle")}</Text>

            {done ? (
              <View style={styles.form}>
                <Alert type="success" message={t("resetPasswordDone")} />
                <Button3D fullWidth onPress={() => navigation.navigate("Login")}>
                  {t("backToLogin")}
                </Button3D>
              </View>
            ) : (
              <View style={styles.form}>
                <TextField
                  label={t("emailLabel")}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t("emailPlaceholder")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TextField
                  label={t("resetPasswordCodeLabel")}
                  value={code}
                  onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  keyboardType="number-pad"
                />
                <TextField
                  label={t("resetPasswordNewLabel")}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t("passwordPlaceholder")}
                  secureTextEntry
                />

                {error ? <Alert type="error" message={error} /> : null}

                <Button3D fullWidth loading={loading} onPress={handleSubmit}>
                  {t("resetPasswordButton")}
                </Button3D>
              </View>
            )}

            <Text
              style={styles.backLink}
              onPress={() => navigation.navigate("Login")}
            >
              {t("backToLogin")}
            </Text>
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
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 20,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 28,
    },
    logoWrapper: {
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    subtitle: {
      marginTop: 4,
      fontSize: 14,
      color: colors.textMuted,
    },
    form: {
      marginTop: 24,
      gap: 16,
    },
    backLink: {
      marginTop: 24,
      fontSize: 14,
      textAlign: "center",
      textDecorationLine: "underline",
      color: colors.textMuted,
    },
  });
}
