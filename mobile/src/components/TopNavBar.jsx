import { View, Text, Pressable, StyleSheet } from "react-native";
import DivisaLogo from "./DivisaLogo";
import RegionPicker from "./RegionPicker";
import { logout } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { colors } from "../theme";

// Mirrors components/Navbar.tsx's logo+greeting+language-switcher+logout —
// the Feedback/Admin links live in the bottom tab bar instead of here, the
// standard mobile navigation pattern (same choice the sibling TechSpeak
// project made for its own Audiobooks/Flashcards/Dashboard tabs), not a
// dropped feature.
export default function TopNavBar() {
  const { user, setUser } = useAuth();
  const { region, setRegion, t } = useLocale();

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <DivisaLogo size="compact" />
        <Text style={styles.greeting}>
          {t("greeting")} <Text style={styles.name}>{user?.name}</Text>
        </Text>
      </View>
      <View style={styles.right}>
        <RegionPicker value={region} onChange={setRegion} compact />
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t("logout")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.bgCard,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  greeting: {
    fontSize: 12,
    color: colors.textMuted,
    flexShrink: 1,
  },
  name: {
    fontWeight: "700",
    color: "#e5e7eb",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoutButton: {
    backgroundColor: colors.bgCardHover,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  logoutText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
});
