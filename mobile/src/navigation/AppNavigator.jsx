import { useEffect } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import { initializeAds } from "../services/ads";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import MainTabs from "./MainTabs";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Stack = createNativeStackNavigator();

// Swaps the whole stack based on auth state (not per-screen guards) — the
// standard React Navigation pattern, and it means a logged-out user can
// never back-navigate into a screen that needed auth.
export default function AppNavigator() {
  const { user, isReady } = useAuth();
  const { theme, colors } = useTheme();

  // Consentimento e início do SDK de anúncio, uma vez por sessão. Não depende
  // de estar logado — nem de haver anúncio para mostrar depois: quem tem o
  // Vitalício simplesmente não vê nenhum (shouldShowAds). Sem `await` e sem
  // estado: a abertura do app não espera por isto, e a função já engole os
  // próprios erros.
  useEffect(() => {
    initializeAds();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgDark, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.neonGreen} size="large" />
      </View>
    );
  }

  // Feeds our own palette into React Navigation's own theme so screen
  // transitions/edges use the right background instead of its library
  // defaults (which would otherwise flash white/black during navigation).
  const navTheme = {
    ...(theme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.bgDark,
      card: colors.bgCard,
      text: colors.textPrimary,
      border: colors.cardBorder,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
