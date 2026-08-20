import { View, Text, Pressable, StyleSheet } from "react-native";
import DivisaLogo from "./DivisaLogo";
import { logout } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

// Mirrors components/Navbar.tsx's logo+greeting+logout — the Feedback/Admin
// links live in the bottom tab bar instead of here, the standard mobile
// navigation pattern (same choice the sibling TechSpeak project made for
// its own Audiobooks/Flashcards/Dashboard tabs), not a dropped feature.
export default function TopNavBar() {
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <DivisaLogo size="compact" />
        <Text style={styles.greeting}>
          Olá, <Text style={styles.name}>{user?.name}</Text>
        </Text>
      </View>
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
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
