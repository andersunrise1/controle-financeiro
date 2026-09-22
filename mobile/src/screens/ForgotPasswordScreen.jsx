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
import { forgotPassword, isValidEmail } from "../services/api";
import { useLocale } from "../context/LocaleContext";
import { useTheme } from "../context/ThemeContext";
import { translateError } from "../lib/i18n";

// The code is typed into the next screen rather than followed from a link:
// there's no deep link registered for this app, so a link in the email
// would open the website instead of coming back here.
export default function ForgotPasswordScreen({ navigation }) {
  const { locale, t } = useLocale();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!isValidEmail(email)) {
      setError(translateError("Informe um e-mail válido.", locale));
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(translateError(err.message || "Erro ao enviar o código.", locale));
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

            <Text style={styles.title}>{t("forgotPasswordTitle")}</Text>
            <Text style={styles.subtitle}>{t("forgotPasswordSubtitle")}</Text>

            {sent ? (
              <View style={styles.form}>
                <Alert type="success" message={t("forgotPasswordSent")} />
                <Button3D
                  fullWidth
                  onPress={() =>
                    navigation.navigate("ResetPassword", { email })
                  }
                >
                  {t("forgotPasswordHaveCode")}
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

                {error ? <Alert type="error" message={error} /> : null}

                <Button3D fullWidth loading={loading} onPress={handleSubmit}>
                  {t("forgotPasswordButton")}
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
