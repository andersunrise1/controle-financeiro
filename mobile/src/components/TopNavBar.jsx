import { View, Text, Pressable, StyleSheet } from "react-native";
import DivisaLogo from "./DivisaLogo";
import RegionPicker from "./RegionPicker";
import { logout } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { useTheme } from "../context/ThemeContext";

// Mirrors components/Navbar.tsx's logo+greeting+language-switcher+logout —
// the Feedback/Admin links live in the bottom tab bar instead of here, the
// standard mobile navigation pattern (same choice the sibling TechSpeak
// project made for its own Audiobooks/Flashcards/Dashboard tabs), not a
// dropped feature. ThemeToggle mirrors web's Navbar sun/moon button.
export default function TopNavBar() {
  const { user, setUser } = useAuth();
  const { region, setRegion, t } = useLocale();
  const { theme, colors, toggleTheme } = useTheme();
  const styles = getStyles(colors);

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
        <Pressable style={styles.themeToggle} onPress={toggleTheme} hitSlop={8}>
          <Text style={styles.themeToggleIcon}>{theme === "dark" ? "☀️" : "🌙"}</Text>
        </Pressable>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t("logout")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
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
      color: colors.textPrimary,
    },
    right: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    themeToggle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    themeToggleIcon: {
      fontSize: 15,
    },
    logoutButton: {
      backgroundColor: colors.bgCardHover,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    logoutText: {
      color: colors.textPrimary,
      fontWeight: "700",
      fontSize: 13,
    },
  });
}
