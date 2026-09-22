import { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DivisaLogo from "../components/DivisaLogo";
import TextField from "../components/TextField";
import Button3D from "../components/Button3D";
import Alert from "../components/Alert";
import RegionPicker from "../components/RegionPicker";
import { login, setToken, setCachedUser, isValidEmail, isValidPassword } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { translateError } from "../lib/i18n";
import { useTheme } from "../context/ThemeContext";
import { PRIVACY_POLICY_URL } from "../lib/links";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const { region, setRegion, locale, t } = useLocale();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleSubmit = async () => {
    setError("");

    if (!isValidEmail(email)) {
      setError(translateError("Informe um e-mail válido.", locale));
      return;
    }

    if (!isValidPassword(password)) {
      setError(translateError("A senha deve ter no mínimo 6 caracteres.", locale));
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      await setToken(data.token);
      await setCachedUser(data.user);
      setUser(data.user);
    } catch (err) {
      setError(translateError(err.message || "Erro ao fazer login.", locale));
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
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.switcherRow}>
            <RegionPicker value={region} onChange={setRegion} compact />
          </View>

          <View style={styles.card}>
            <View style={styles.logoWrapper}>
              <DivisaLogo size="large" />
            </View>

            <Text style={styles.title}>{t("loginTitle")}</Text>
            <Text style={styles.subtitle}>{t("loginSubtitle")}</Text>

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
                label={t("passwordLabel")}
                value={password}
                onChangeText={setPassword}
                placeholder={t("passwordPlaceholder")}
                secureTextEntry
              />

              {error ? <Alert type="error" message={error} /> : null}

              <Button3D fullWidth loading={loading} onPress={handleSubmit}>
                {t("loginButton")}
              </Button3D>
            </View>

            <Text
              style={styles.forgotLink}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              {t("forgotPasswordLink")}
            </Text>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t("noAccount")} </Text>
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate("Register")}
              >
                {t("signUpLink")}
              </Text>
            </View>

            {/* The Play Store requires the privacy policy to be reachable
                from inside the app, not only from the store listing. */}
            <Text
              style={styles.policyLink}
              onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
            >
              {t("privacyPolicyLink")}
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
    switcherRow: {
      alignItems: "flex-end",
      marginBottom: 12,
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
    forgotLink: {
      marginTop: 18,
      fontSize: 14,
      textAlign: "center",
      textDecorationLine: "underline",
      color: colors.textMuted,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 24,
    },
    footerText: {
      fontSize: 14,
      color: colors.textMuted,
    },
    footerLink: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.accentGreenText,
    },
    policyLink: {
      marginTop: 18,
      fontSize: 12,
      textAlign: "center",
      textDecorationLine: "underline",
      color: colors.textMuted,
    },
  });
}
