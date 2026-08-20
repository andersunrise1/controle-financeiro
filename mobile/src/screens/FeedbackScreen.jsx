import { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopNavBar from "../components/TopNavBar";
import TextField from "../components/TextField";
import SelectField from "../components/SelectField";
import Button3D from "../components/Button3D";
import Alert from "../components/Alert";
import { submitFeedback } from "../services/api";
import { colors } from "../theme";

const CATEGORY_OPTIONS = [
  { label: "Erro / Bug", value: "bug" },
  { label: "Sugestão", value: "sugestao" },
  { label: "Outro", value: "outro" },
];

// Mirrors app/feedback/page.tsx.
export default function FeedbackScreen() {
  const [category, setCategory] = useState("bug");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await submitFeedback({ category, message });
      setSuccess("Feedback enviado! Obrigado.");
      setMessage("");
    } catch (err) {
      setError(err.message || "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <TopNavBar />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Enviar Feedback</Text>
          <Text style={styles.subtitle}>Encontrou um erro ou tem uma sugestão? Conte pra gente.</Text>

          <View style={{ gap: 14, marginTop: 20 }}>
            <SelectField label="Categoria" value={category} onValueChange={setCategory} options={CATEGORY_OPTIONS} />
            <TextField
              label="Mensagem"
              value={message}
              onChangeText={setMessage}
              placeholder="Descreva o que aconteceu..."
              multiline
              numberOfLines={5}
            />

            {error ? <Alert type="error" message={error} /> : null}
            {success ? <Alert type="success" message={success} /> : null}

            <Button3D fullWidth loading={loading} onPress={handleSubmit}>
              Enviar Feedback
            </Button3D>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
});
