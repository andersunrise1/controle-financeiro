import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DivisaLogo from "../components/DivisaLogo";
import Button3D from "../components/Button3D";
import { logout } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

// Placeholder for the authenticated area — proves login/navigation work
// end to end. The real dashboard (saldo, Nova Transação, os 4 gráficos,
// histórico) is Etapa 2 of the mobile roadmap, not this one.
export default function HomeScreen() {
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <DivisaLogo size="compact" />
        <Text style={styles.greeting}>
          Olá, <Text style={styles.name}>{user?.name}</Text>
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.placeholder}>
          Fundação mobile (login + navegação) concluída — o dashboard de
          verdade entra na Etapa 2.
        </Text>
        <Button3D variant="secondary" onPress={handleLogout}>
          Sair
        </Button3D>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.bgCard,
  },
  greeting: {
    fontSize: 13,
    color: colors.textMuted,
  },
  name: {
    fontWeight: "700",
    color: "#e5e7eb",
  },
  body: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 20,
  },
  placeholder: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
