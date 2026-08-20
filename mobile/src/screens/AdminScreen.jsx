import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopNavBar from "../components/TopNavBar";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { getAdminFeedback, setFeedbackResolved } from "../services/api";
import { colors } from "../theme";

const CATEGORY_COLOR = {
  bug: { border: "rgba(255,7,58,0.4)", bg: "rgba(255,7,58,0.1)", text: "#ff6b85" },
  sugestao: { border: "rgba(255,217,61,0.4)", bg: "rgba(255,217,61,0.1)", text: "#ffd93d" },
  outro: { border: "rgba(107,114,128,0.4)", bg: "rgba(107,114,128,0.1)", text: "#d1d5db" },
};

// Mirrors app/admin/page.tsx — visible only to the account whose email
// matches ADMIN_EMAIL server-side; the backend enforces this on every
// request regardless of what this screen shows.
function AdminContent() {
  const { t } = useLocale();
  const CATEGORY_LABEL = { bug: t("feedbackCategoryBug"), sugestao: t("feedbackCategorySugestao"), outro: t("feedbackCategoryOutro") };
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeedback = useCallback(async () => {
    try {
      const data = await getAdminFeedback();
      setFeedback(data.feedback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const toggleResolved = async (item) => {
    await setFeedbackResolved(item.id, item.resolved === 0);
    loadFeedback();
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.neonGreen} size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t("adminFeedbackTitle")}</Text>
      {feedback.length === 0 ? (
        <Text style={styles.empty}>{t("adminFeedbackEmpty")}</Text>
      ) : (
        <View style={{ gap: 12, marginTop: 12 }}>
          {feedback.map((item) => {
            const c = CATEGORY_COLOR[item.category];
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { borderColor: c.border, backgroundColor: c.bg }]}>
                    <Text style={[styles.badgeText, { color: c.text }]}>{CATEGORY_LABEL[item.category]}</Text>
                  </View>
                  {item.resolved === 1 && (
                    <View style={[styles.badge, { borderColor: "rgba(57,255,20,0.4)", backgroundColor: "rgba(57,255,20,0.1)" }]}>
                      <Text style={[styles.badgeText, { color: "#7cff5c" }]}>{t("adminFeedbackResolvedBadge")}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.message}>{item.message}</Text>
                <View style={styles.footerRow}>
                  <Text style={styles.meta}>{item.user_name} · {item.user_email}</Text>
                  <Pressable style={styles.resolveButton} onPress={() => toggleResolved(item)}>
                    <Text style={styles.resolveText}>{item.resolved === 1 ? t("adminFeedbackReopen") : t("adminFeedbackResolve")}</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function AdminGate() {
  const { user } = useAuth();
  const { t } = useLocale();

  if (!user?.isAdmin) {
    return (
      <View style={styles.loading}>
        <Text style={styles.empty}>{t("adminAccessDenied")}</Text>
      </View>
    );
  }

  return <AdminContent />;
}

export default function AdminScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <TopNavBar />
      <AdminGate />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    padding: 16,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  message: {
    color: colors.textPrimary,
    fontSize: 14,
    marginTop: 10,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 8,
  },
  meta: {
    color: colors.textFaint,
    fontSize: 11,
    flexShrink: 1,
  },
  resolveButton: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  resolveText: {
    color: "#d1d5db",
    fontSize: 11,
    fontWeight: "700",
  },
});
