import { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DivisaLogo from "../components/DivisaLogo";
import TextField from "../components/TextField";
import Button3D from "../components/Button3D";
import Alert from "../components/Alert";
import { login, setToken, isValidEmail, isValidPassword } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  const handleSubmit = async () => {
    setError("");

    if (!isValidEmail(email)) {
      setError("Informe um e-mail válido.");
      return;
    }

    if (!isValidPassword(password)) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      await setToken(data.token);
      setUser(data.user);
    } catch (err) {
      setError(err.message || "Erro ao fazer login.");
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
          <View style={styles.card}>
            <View style={styles.logoWrapper}>
              <DivisaLogo size="large" />
            </View>

            <Text style={styles.title}>Entrar</Text>
            <Text style={styles.subtitle}>Acesse seu painel financeiro</Text>

            <View style={styles.form}>
              <TextField
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextField
                label="Senha"
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
              />

              {error ? <Alert type="error" message={error} /> : null}

              <Button3D fullWidth loading={loading} onPress={handleSubmit}>
                Entrar
              </Button3D>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Não tem conta? </Text>
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate("Register")}
              >
                Cadastre-se
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
