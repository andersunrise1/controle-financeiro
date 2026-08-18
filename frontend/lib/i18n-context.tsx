"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Locale, TranslationKey, dictionaries } from "./i18n";
import { Region, REGIONS, REGION_LOCALE } from "./regions";
import { getExchangeRates, DEFAULT_RATES_STATE, RatesState } from "./exchangeRates";

const REGION_KEY = "app_region";

interface I18nContextType {
  region: Region;
  setRegion: (region: Region) => void;
  locale: Locale;
  t: (key: TranslationKey) => string;
  rates: RatesState;
}

const I18nContext = createContext<I18nContextType>({
  region: "BR",
  setRegion: () => {},
  locale: "pt",
  t: (key) => dictionaries.pt[key],
  rates: DEFAULT_RATES_STATE,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<Region>("BR");
  const [rates, setRates] = useState<RatesState>(DEFAULT_RATES_STATE);

  useEffect(() => {
    const stored = localStorage.getItem(REGION_KEY);
    if (stored && (REGIONS as string[]).includes(stored)) {
      setRegionState(stored as Region);
    }
  }, []);

  useEffect(() => {
    getExchangeRates().then(setRates);
  }, []);

  const setRegion = (next: Region) => {
    setRegionState(next);
    localStorage.setItem(REGION_KEY, next);
  };

  const locale = REGION_LOCALE[region];
  const t = (key: TranslationKey) => dictionaries[locale][key];

  return (
    <I18nContext.Provider value={{ region, setRegion, locale, t, rates }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
