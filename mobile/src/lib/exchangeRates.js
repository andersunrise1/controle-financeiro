import AsyncStorage from "@react-native-async-storage/async-storage";
import { REGIONS, REGION_CURRENCY, REGION_EXCHANGE_FROM_BRL } from "./regions";

// Mirrors frontend/lib/exchangeRates.ts exactly, swapping localStorage for
// AsyncStorage (the same trade Etapa 1 made for auth — reads/writes are
// async here, everything else about the cache/fallback logic is identical).
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";
const CACHE_KEY = "app_exchange_rates";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

export const DEFAULT_RATES_STATE = {
  rates: REGION_EXCHANGE_FROM_BRL,
  updatedAt: null,
  isLive: false,
};

function mapCurrencyRatesToRegions(currencyRates) {
  const mapped = { ...REGION_EXCHANGE_FROM_BRL };

  REGIONS.forEach((region) => {
    const code = REGION_CURRENCY[region];
    const rate = currencyRates[code];
    if (typeof rate === "number" && rate > 0) {
      mapped[region] = rate;
    }
  });

  mapped.BR = 1;
  return mapped;
}

async function readCache() {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeCache(state) {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ...state, fetchedAt: Date.now() }));
  } catch {
    // AsyncStorage indisponível — sem problema, só buscaremos de novo na próxima vez.
  }
}

export async function getExchangeRates() {
  const cached = await readCache();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { rates: cached.rates, updatedAt: cached.updatedAt, isLive: cached.isLive };
  }

  try {
    const res = await fetch(`${API_URL}/api/exchange-rates`);
    if (!res.ok) throw new Error("Falha ao buscar taxas de câmbio");

    const data = await res.json();
    const state = {
      rates: mapCurrencyRatesToRegions(data.rates),
      updatedAt: data.updatedAt,
      isLive: true,
    };
    await writeCache(state);
    return state;
  } catch {
    return cached
      ? { rates: cached.rates, updatedAt: cached.updatedAt, isLive: cached.isLive }
      : DEFAULT_RATES_STATE;
  }
}
