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

// Taxas fixas aproximadas a partir do BRL, só para exibicao (nao em
// tempo real) — pesquisadas em 2026-08-18. Moedas como ARS/VES sao
// historicamente muito volateis; revisar periodicamente.
export const REGION_EXCHANGE_FROM_BRL: Record<Region, number> = {
  BR: 1,
  US: 0.18,
  AR: 285.7,
  PY: 315.0,
  UY: 7.72,
  CL: 175.0,
  VE: 135.7,
  CO: 738.0,
  PE: 0.675,
  BO: 1.24,
  EC: 0.18,
  SV: 0.18,
  MX: 3.26,
  PR: 0.18,
  HN: 4.6,
  GT: 1.4,
};
