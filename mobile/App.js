import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { LocaleProvider } from "./src/context/LocaleContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import AppNavigator from "./src/navigation/AppNavigator";

function ThemedStatusBar() {
  const { theme } = useTheme();
  // Dark app background needs light (white) status bar content, and vice
  // versa — same "light"/"dark" vocabulary expo-status-bar's style prop uses.
  return <StatusBar style={theme === "dark" ? "light" : "dark"} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LocaleProvider>
        <ThemeProvider>
          <AuthProvider>
            <ThemedStatusBar />
            <AppNavigator />
          </AuthProvider>
        </ThemeProvider>
      </LocaleProvider>
    </SafeAreaProvider>
  );
}
