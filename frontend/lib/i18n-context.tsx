"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Locale, TranslationKey, dictionaries } from "./i18n";
import { Region, REGIONS, REGION_LOCALE } from "./regions";

const REGION_KEY = "app_region";

interface I18nContextType {
  region: Region;
  setRegion: (region: Region) => void;
  locale: Locale;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType>({
  region: "BR",
  setRegion: () => {},
  locale: "pt",
  t: (key) => dictionaries.pt[key],
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<Region>("BR");

  useEffect(() => {
    const stored = localStorage.getItem(REGION_KEY);
    if (stored && (REGIONS as string[]).includes(stored)) {
      setRegionState(stored as Region);
    }
  }, []);

  const setRegion = (next: Region) => {
    setRegionState(next);
    localStorage.setItem(REGION_KEY, next);
  };

  const locale = REGION_LOCALE[region];
  const t = (key: TranslationKey) => dictionaries[locale][key];

  return (
    <I18nContext.Provider value={{ region, setRegion, locale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
