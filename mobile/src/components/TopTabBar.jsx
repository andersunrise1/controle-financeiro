import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import GradientText from "./GradientText";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { colors } from "../theme";

const TABS = [
  { name: "Dashboard", symbol: "🏠", labelKey: "navDashboard" },
  { name: "Mercado", symbol: "🛒", labelKey: "navMercado" },
  { name: "Feedback", symbol: "💬", labelKey: "navFeedback" },
  { name: "Admin", symbol: "🛠️", labelKey: "navAdmin", adminOnly: true },
];

// Same 4 destinations previously in MainTabs' bottom tab bar, moved to the
// top of the screen per the user's request — sits between TopNavBar's
// greeting and each screen's own content (e.g. "Saldo Atual"). The
// underlying Tab.Navigator in MainTabs.jsx still owns routing/active-screen
// state (its own tabBar UI is just hidden via tabBarStyle); this component
// only triggers navigation and shows which screen is current, passed in
// explicitly by each screen rather than read from navigation state, since
// every screen already knows its own name.
export default function TopTabBar({ active }) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { t } = useLocale();

  return (
    <View style={styles.bar}>
      {TABS.filter((tab) => !tab.adminOnly || user?.isAdmin).map((tab) => {
        const isActive = tab.name === active;
        const label = t(tab.labelKey);
        return (
          <Pressable
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.name)}
          >
            <Text style={[styles.symbol, { opacity: isActive ? 1 : 0.5 }]}>{tab.symbol}</Text>
            <View style={{ opacity: isActive ? 1 : 0.5 }}>
              <GradientText fontSize={11} fontWeight="700" letterSpacing={0} width={Math.max(60, label.length * 7)} height={16}>
                {label}
              </GradientText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    gap: 2,
  },
  symbol: {
    fontSize: 18,
  },
});
