import { createContext, useContext, useEffect, useState } from "react";
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

  useEffect(() => {
    AsyncStorage.getItem(REGION_KEY).then((stored) => {
      if (stored && REGIONS.includes(stored)) setRegionState(stored);
    });
  }, []);

  useEffect(() => {
    getExchangeRates().then(setRates);
  }, []);

  const setRegion = (next) => {
    setRegionState(next);
    AsyncStorage.setItem(REGION_KEY, next);
  };

  const locale = REGION_LOCALE[region];
  const t = (key) => dictionaries[locale][key];

  return (
    <LocaleContext.Provider value={{ region, setRegion, locale, t, rates }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
