import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import DashboardScreen from "../screens/DashboardScreen";
import FeedbackScreen from "../screens/FeedbackScreen";
import AdminScreen from "../screens/AdminScreen";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

function TabIcon({ symbol, focused }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{symbol}</Text>;
}

// Dashboard/Feedback/Admin as bottom tabs — the mobile-native equivalent of
// the web Navbar's nav links. Admin tab only renders for the account whose
// email matches ADMIN_EMAIL (the backend enforces this regardless).
export default function MainTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.neonGreen,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.bgCard, borderTopColor: colors.cardBorder },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon symbol="🏠" focused={focused} /> }}
      />
      <Tab.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon symbol="💬" focused={focused} /> }}
      />
      {user?.isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{ tabBarIcon: ({ focused }) => <TabIcon symbol="🛠️" focused={focused} /> }}
        />
      )}
    </Tab.Navigator>
  );
}
