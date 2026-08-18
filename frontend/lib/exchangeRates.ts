import { Region, REGIONS, REGION_CURRENCY, REGION_EXCHANGE_FROM_BRL } from "./regions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const CACHE_KEY = "app_exchange_rates";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

export interface RatesState {
  rates: Record<Region, number>;
  updatedAt: string | null;
  isLive: boolean;
}

export const DEFAULT_RATES_STATE: RatesState = {
  rates: REGION_EXCHANGE_FROM_BRL,
  updatedAt: null,
  isLive: false,
};

function mapCurrencyRatesToRegions(
  currencyRates: Record<string, number>
): Record<Region, number> {
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

function readCache(): (RatesState & { fetchedAt: number }) | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(state: RatesState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...state, fetchedAt: Date.now() })
    );
  } catch {
    // localStorage indisponível (modo privado, etc.) — sem problema,
    // só significa que buscaremos de novo na próxima vez.
  }
}

export async function getExchangeRates(): Promise<RatesState> {
  const cached = readCache();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { rates: cached.rates, updatedAt: cached.updatedAt, isLive: cached.isLive };
  }

  try {
    const res = await fetch(`${API_URL}/api/exchange-rates`);
    if (!res.ok) throw new Error("Falha ao buscar taxas de câmbio");

    const data = await res.json();
    const state: RatesState = {
      rates: mapCurrencyRatesToRegions(data.rates),
      updatedAt: data.updatedAt,
      isLive: true,
    };
    writeCache(state);
    return state;
  } catch {
    // API fora do ar e sem cache local: usa a tabela fixa de fallback
    // (a mesma que já existia antes desse recurso).
    return cached
      ? { rates: cached.rates, updatedAt: cached.updatedAt, isLive: cached.isLive }
      : DEFAULT_RATES_STATE;
  }
}
