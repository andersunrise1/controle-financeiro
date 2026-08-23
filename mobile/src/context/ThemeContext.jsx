import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getColors } from "../theme";

// Mirrors frontend/lib/theme-context.tsx, swapping localStorage for
// AsyncStorage. Defaults to "dark" (the app's original look) until a saved
// preference loads, same flash-of-wrong-theme tradeoff accepted on web.
const THEME_KEY = "app_theme";

const ThemeContext = createContext({
  theme: "dark",
  colors: getColors("dark"),
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === "light" || stored === "dark") setTheme(stored);
    });
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, colors: getColors(theme), toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
