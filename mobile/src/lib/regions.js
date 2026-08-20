// Mirrors frontend/lib/regions.ts exactly — same 16 regions, same currency
// codes, same fallback rates (checked against open.er-api.com 2026-08-18).
export const REGIONS = [
  "BR", "US", "AR", "PY", "UY", "CL", "VE", "CO",
  "PE", "BO", "EC", "SV", "MX", "PR", "HN", "GT",
];

export const REGION_LOCALE = {
  BR: "pt", US: "en", AR: "es", PY: "es", UY: "es", CL: "es",
  VE: "es", CO: "es", PE: "es", BO: "es", EC: "es", SV: "es",
  MX: "es", PR: "es", HN: "es", GT: "es",
};

export const REGION_LABELS = {
  BR: "Brasil", US: "Estados Unidos", AR: "Argentina", PY: "Paraguay",
  UY: "Uruguay", CL: "Chile", VE: "Venezuela", CO: "Colombia",
  PE: "Perú", BO: "Bolivia", EC: "Ecuador", SV: "El Salvador",
  MX: "México", PR: "Puerto Rico", HN: "Honduras", GT: "Guatemala",
};

export const REGION_CURRENCY = {
  BR: "BRL", US: "USD", AR: "ARS", PY: "PYG", UY: "UYU", CL: "CLP",
  VE: "VES", CO: "COP", PE: "PEN", BO: "BOB",
  EC: "USD", // dolarizado
  SV: "USD", // dolarizado
  MX: "MXN",
  PR: "USD", // território dos EUA
  HN: "HNL", GT: "GTQ",
};

export const REGION_INTL_LOCALE = {
  BR: "pt-BR", US: "en-US", AR: "es-AR", PY: "es-PY", UY: "es-UY",
  CL: "es-CL", VE: "es-VE", CO: "es-CO", PE: "es-PE", BO: "es-BO",
  EC: "es-EC", SV: "es-SV", MX: "es-MX", PR: "es-PR", HN: "es-HN", GT: "es-GT",
};

// Taxas fixas de fallback a partir do BRL — usadas só até a API de câmbio
// ao vivo responder, ou se ela estiver fora do ar.
export const REGION_EXCHANGE_FROM_BRL = {
  BR: 1, US: 0.18, AR: 285.94, PY: 1150.68, UY: 7.68, CL: 175.4,
  VE: 148.42, CO: 602.08, PE: 0.6465, BO: 2.23, EC: 0.18, SV: 0.18,
  MX: 3.264, PR: 0.18, HN: 5.14, GT: 1.463,
};

// Moedas historicamente voláteis — a UI mostra um aviso extra.
export const VOLATILE_REGIONS = ["AR", "VE"];
