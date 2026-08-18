import { Locale } from "./i18n";

export type Region =
  | "BR"
  | "US"
  | "AR"
  | "PY"
  | "UY"
  | "CL"
  | "VE"
  | "CO"
  | "PE"
  | "BO"
  | "EC"
  | "SV"
  | "MX"
  | "PR"
  | "HN"
  | "GT";

export const REGIONS: Region[] = [
  "BR",
  "US",
  "AR",
  "PY",
  "UY",
  "CL",
  "VE",
  "CO",
  "PE",
  "BO",
  "EC",
  "SV",
  "MX",
  "PR",
  "HN",
  "GT",
];

export const REGION_LOCALE: Record<Region, Locale> = {
  BR: "pt",
  US: "en",
  AR: "es",
  PY: "es",
  UY: "es",
  CL: "es",
  VE: "es",
  CO: "es",
  PE: "es",
  BO: "es",
  EC: "es",
  SV: "es",
  MX: "es",
  PR: "es",
  HN: "es",
  GT: "es",
};

export const REGION_LABELS: Record<Region, string> = {
  BR: "Brasil",
  US: "Estados Unidos",
  AR: "Argentina",
  PY: "Paraguay",
  UY: "Uruguay",
  CL: "Chile",
  VE: "Venezuela",
  CO: "Colombia",
  PE: "Perú",
  BO: "Bolivia",
  EC: "Ecuador",
  SV: "El Salvador",
  MX: "México",
  PR: "Puerto Rico",
  HN: "Honduras",
  GT: "Guatemala",
};

export const REGION_CURRENCY: Record<Region, string> = {
  BR: "BRL",
  US: "USD",
  AR: "ARS",
  PY: "PYG",
  UY: "UYU",
  CL: "CLP",
  VE: "VES",
  CO: "COP",
  PE: "PEN",
  BO: "BOB",
  EC: "USD", // dolarizado
  SV: "USD", // dolarizado
  MX: "MXN",
  PR: "USD", // territorio dos EUA
  HN: "HNL",
  GT: "GTQ",
};

export const REGION_INTL_LOCALE: Record<Region, string> = {
  BR: "pt-BR",
  US: "en-US",
  AR: "es-AR",
  PY: "es-PY",
  UY: "es-UY",
  CL: "es-CL",
  VE: "es-VE",
  CO: "es-CO",
  PE: "es-PE",
  BO: "es-BO",
  EC: "es-EC",
  SV: "es-SV",
  MX: "es-MX",
  PR: "es-PR",
  HN: "es-HN",
  GT: "es-GT",
};

// Taxas fixas de fallback a partir do BRL (usadas so ate a API de
// cambio ao vivo responder, ou se ela estiver fora do ar) — conferidas
// contra open.er-api.com em 2026-08-18. Nao sao tempo real por
// definicao; o app busca a cotacao ao vivo em lib/exchangeRates.ts.
export const REGION_EXCHANGE_FROM_BRL: Record<Region, number> = {
  BR: 1,
  US: 0.18,
  AR: 285.94,
  PY: 1150.68,
  UY: 7.68,
  CL: 175.4,
  VE: 148.42,
  CO: 602.08,
  PE: 0.6465,
  BO: 2.23,
  EC: 0.18,
  SV: 0.18,
  MX: 3.264,
  PR: 0.18,
  HN: 5.14,
  GT: 1.463,
};

// Moedas com historico de alta volatilidade/instabilidade cambial —
// a UI mostra um aviso extra quando uma delas esta selecionada.
export const VOLATILE_REGIONS: Region[] = ["AR", "VE"];
