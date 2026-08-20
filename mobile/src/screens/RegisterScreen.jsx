import { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TextField from "../components/TextField";
import Button3D from "../components/Button3D";
import Alert from "../components/Alert";
import RegionPicker from "../components/RegionPicker";
import { register, setToken, isValidEmail, isValidPassword } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { translateError } from "../lib/i18n";
import { colors } from "../theme";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const { region, setRegion, locale, t } = useLocale();

  const handleSubmit = async () => {
    setError("");

    if (name.trim().length < 2) {
      setError(translateError("Nome deve ter pelo menos 2 caracteres.", locale));
      return;
    }

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
      const data = await register(name, email, password);
      await setToken(data.token);
      setUser(data.user);
    } catch (err) {
      setError(translateError(err.message || "Erro ao cadastrar.", locale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.switcherRow}>
            <RegionPicker value={region} onChange={setRegion} compact />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>{t("registerTitle")}</Text>
            <Text style={styles.subtitle}>{t("registerSubtitle")}</Text>

            <View style={styles.form}>
              <TextField
                label={t("nameLabel")}
                value={name}
                onChangeText={setName}
                placeholder={t("namePlaceholder")}
              />
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
                {t("registerButton")}
              </Button3D>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t("haveAccount")} </Text>
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate("Login")}
              >
                {t("loginLink")}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    color: colors.neonGreen,
  },
});
