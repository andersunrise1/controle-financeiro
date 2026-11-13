import { View, Text, Pressable, StyleSheet } from "react-native";
import DivisaLogo from "./DivisaLogo";
import RegionPicker from "./RegionPicker";
import { logout } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { useTheme } from "../context/ThemeContext";

/**
 * Marca quem comprou o Vitalício. Mais ninguém.
 *
 * Mostrava a contagem de dias de teste e, depois, um aviso vermelho de
 * vencido. Os dois saíram com a trava dos 60 dias (2026-11-13): sem
 * vencimento, estar no plano gratuito virou o estado normal do app, e
 * carimbar isso no alto de toda tela seria só ruído.
 *
 * Continua sendo apenas um rótulo: não é tocável e não leva a lugar nenhum.
 */
function PlanBadge({ access, colors, t }) {
  if (access?.plan !== "lifetime") return null;

  const rgb = "57, 255, 20";
  const cor = colors.accentGreenText;
  const texto = t("trialBadgeLifetime");

  return (
    <View
      style={[
        badgeStyles.badge,
        {
          backgroundColor: `rgba(${rgb}, 0.1)`,
          borderColor: `rgba(${rgb}, 0.4)`,
        },
      ]}
    >
      <Text style={[badgeStyles.badgeText, { color: cor }]}>{texto}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
});

// Mirrors components/Navbar.tsx's logo+greeting+language-switcher+logout —
// the Feedback/Admin links live in the bottom tab bar instead of here, the
// standard mobile navigation pattern (same choice the sibling TechSpeak
// project made for its own Audiobooks/Flashcards/Dashboard tabs), not a
// dropped feature. ThemeToggle mirrors web's Navbar sun/moon button.
export default function TopNavBar() {
  const { user, access, setUser, setAccess } = useAuth();
  const { region, setRegion, t } = useLocale();
  const { theme, colors, toggleTheme } = useTheme();
  const styles = getStyles(colors);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccess(null);
  };

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <DivisaLogo size="compact" />
        <Text style={styles.greeting}>
          {t("greeting")} <Text style={styles.name}>{user?.name}</Text>
        </Text>
        <PlanBadge access={access} colors={colors} t={t} />
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
