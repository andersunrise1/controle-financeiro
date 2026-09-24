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
import { dictionaries } from "../lib/i18n";
import { REGIONS, REGION_LOCALE } from "../lib/regions";
import { getExchangeRates, DEFAULT_RATES_STATE } from "../lib/exchangeRates";

// Mirrors frontend/lib/i18n-context.tsx, swapping localStorage for
// AsyncStorage — same region-persisted / rates-fetched-once-on-mount shape.
const REGION_KEY = "app_region";

const LocaleContext = createContext({
  region: "BR",
  setRegion: () => {},
  locale: "pt",
  t: (key) => dictionaries.pt[key],
  rates: DEFAULT_RATES_STATE,
});

export function LocaleProvider({ children }) {
  const [region, setRegionState] = useState("BR");
  const [rates, setRates] = useState(DEFAULT_RATES_STATE);

  // Same guard as ThemeContext, for the same reason: a disk read started at
  // mount can resolve after the person has already picked a region, and
  // would otherwise snap their choice back to whatever was stored before.
  const chosenByUser = useRef(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(REGION_KEY)
      .then((stored) => {
        if (cancelled || chosenByUser.current) return;
        if (stored && REGIONS.includes(stored)) setRegionState(stored);
      })
      .catch(() => {
        // Unreadable preference just means we keep the default.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    getExchangeRates().then(setRates).catch(() => {});
  }, []);

  const setRegion = useCallback((next) => {
    chosenByUser.current = true;
    setRegionState(next);
  }, []);

  useEffect(() => {
    if (!chosenByUser.current) return;
    AsyncStorage.setItem(REGION_KEY, region).catch(() => {});
  }, [region]);

  const value = useMemo(() => {
    const locale = REGION_LOCALE[region];
    return {
      region,
      setRegion,
      locale,
      t: (key) => dictionaries[locale][key],
      rates,
    };
  }, [region, setRegion, rates]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
