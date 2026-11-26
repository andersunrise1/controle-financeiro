import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/DashboardScreen";
import MercadoScreen from "../screens/MercadoScreen";
import FeedbackScreen from "../screens/FeedbackScreen";
import AccountScreen from "../screens/AccountScreen";
import AdminScreen from "../screens/AdminScreen";
// Sem a extensão de propósito: é o que faz o Metro escolher
// VitalicioScreen.web.jsx na web, onde o expo-iap não existe. Com ".jsx"
// explícito a resolução por plataforma não acontece e o build web quebra.
import VitalicioScreen from "../screens/VitalicioScreen";
import { useAuth } from "../context/AuthContext";

const Tab = createBottomTabNavigator();

// Still a bottom Tab.Navigator under the hood — it's what actually owns
// routing/active-screen state — but its own tab bar UI is hidden
// (tabBarStyle display:none) in favor of TopTabBar, rendered by each screen
// itself between TopNavBar and the screen's own content, per the user's
// request to move the tab bar to the top of the screen. Admin tab only
// registered for the account whose email matches ADMIN_EMAIL (the backend
// enforces this regardless).
export default function MainTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Mercado" component={MercadoScreen} />
      <Tab.Screen name="Feedback" component={FeedbackScreen} />
      <Tab.Screen name="Conta" component={AccountScreen} />
      {/* Rota sem aba: o TopTabBar tem lista própria e não mostra esta. Fica
          aqui para ser alcançável por navigation.navigate a partir da Conta,
          sem apertar ainda mais uma barra que já tem cinco itens. */}
      <Tab.Screen name="Vitalicio" component={VitalicioScreen} />
      {user?.isAdmin && <Tab.Screen name="Admin" component={AdminScreen} />}
    </Tab.Navigator>
  );
}
