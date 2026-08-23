import { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopNavBar from "../components/TopNavBar";
import TopTabBar from "../components/TopTabBar";
import TextField from "../components/TextField";
import SelectField from "../components/SelectField";
import Button3D from "../components/Button3D";
import Alert from "../components/Alert";
import { submitFeedback } from "../services/api";
import { useLocale } from "../context/LocaleContext";
import { translateError } from "../lib/i18n";
import { colors } from "../theme";

// Mirrors app/feedback/page.tsx.
export default function FeedbackScreen() {
  const { locale, t } = useLocale();
  const CATEGORY_OPTIONS = [
    { label: t("feedbackCategoryBug"), value: "bug" },
    { label: t("feedbackCategorySugestao"), value: "sugestao" },
    { label: t("feedbackCategoryOutro"), value: "outro" },
  ];

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
      setSuccess(t("feedbackSuccess"));
      setMessage("");
    } catch (err) {
      setError(translateError(err.message || "Erro ao salvar.", locale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <TopNavBar />
      <TopTabBar active="Feedback" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>{t("feedbackPageTitle")}</Text>
            <Text style={styles.subtitle}>{t("feedbackPageSubtitle")}</Text>

            <View style={{ gap: 14, marginTop: 20 }}>
              <SelectField label={t("feedbackCategoryLabel")} value={category} onValueChange={setCategory} options={CATEGORY_OPTIONS} />
              <TextField
                label={t("feedbackMessageLabel")}
                value={message}
                onChangeText={setMessage}
                placeholder={t("feedbackMessagePlaceholder")}
                multiline
                numberOfLines={5}
              />

              {error ? <Alert type="error" message={error} /> : null}
              {success ? <Alert type="success" message={success} /> : null}

              <Button3D fullWidth loading={loading} onPress={handleSubmit}>
                {t("feedbackSubmitButton")}
              </Button3D>
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
