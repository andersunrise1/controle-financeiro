import { NextRequest } from "next/server";
import { corsOptions, jsonResponse } from "@/lib/cors";

const SOURCE_URL = "https://open.er-api.com/v6/latest/BRL";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

interface CachedRates {
  rates: Record<string, number>;
  updatedAt: string;
  fetchedAt: number;
}

let cache: CachedRates | null = null;

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  const now = Date.now();

  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return jsonResponse(request, {
      rates: cache.rates,
      updatedAt: cache.updatedAt,
      cached: true,
    });
  }

  try {
    const res = await fetch(SOURCE_URL, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      throw new Error(`Fonte de cambio respondeu ${res.status}`);
    }

    const data = await res.json();

    if (!data.rates || typeof data.rates !== "object") {
      throw new Error("Resposta da fonte de cambio sem campo rates");
    }

    cache = {
      rates: data.rates,
      updatedAt: data.time_last_update_utc || new Date().toISOString(),
      fetchedAt: now,
    };

    return jsonResponse(request, {
      rates: cache.rates,
      updatedAt: cache.updatedAt,
      cached: false,
    });
  } catch {
    // Fonte externa fora do ar: se ainda tivermos um cache antigo, serve
    // ele em vez de falhar (melhor uma taxa desatualizada do que nenhuma).
    if (cache) {
      return jsonResponse(request, {
        rates: cache.rates,
        updatedAt: cache.updatedAt,
        cached: true,
        stale: true,
      });
    }

    return jsonResponse(
      request,
      { error: "Não foi possível buscar as taxas de câmbio no momento." },
      503
    );
  }
}
