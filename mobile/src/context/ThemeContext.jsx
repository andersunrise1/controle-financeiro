import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

  // Whether the person has picked a theme during this run.
  //
  // On a real device AsyncStorage reads from disk and can take a while —
  // long enough for someone to open the app and tap the toggle before the
  // read comes back. That read captured the *old* value when it started, so
  // without this guard it lands afterwards and silently undoes the choice
  // they just made: you switch to dark, and moments later the app is light
  // again while storage correctly says "dark". Reproduced by delaying the
  // read; on the web it never showed up, because localStorage is instant.
  const chosenByUser = useRef(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(THEME_KEY)
      .then((stored) => {
        if (cancelled || chosenByUser.current) return;
        if (stored === "light" || stored === "dark") setTheme(stored);
      })
      .catch(() => {
        // Unreadable preference just means we keep the default.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    chosenByUser.current = true;
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Saving belongs here rather than inside the state updater: an updater has
  // to stay pure, and React is free to run it more than once.
  useEffect(() => {
    // Nothing to write back for the value we just loaded from storage.
    if (!chosenByUser.current) return;

    AsyncStorage.setItem(THEME_KEY, theme).catch(() => {
      // A failed write costs the preference on next launch, not this
      // session — the theme on screen stays what the person picked.
    });
  }, [theme]);

  // Memoized so every screen isn't rebuilding its StyleSheet on unrelated
  // re-renders of this provider.
  const value = useMemo(
    () => ({ theme, colors: getColors(theme), toggleTheme }),
    [theme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
