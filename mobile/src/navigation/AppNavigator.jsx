import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

const Stack = createNativeStackNavigator();

// Swaps the whole stack based on auth state (not per-screen guards) — the
// standard React Navigation pattern, and it means a logged-out user can
// never back-navigate into a screen that needed auth.
export default function AppNavigator() {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgDark, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.neonGreen} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
