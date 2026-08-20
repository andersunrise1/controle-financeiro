import { REGION_CURRENCY, REGION_INTL_LOCALE, REGION_EXCHANGE_FROM_BRL } from "./regions";

// Mirrors frontend/lib/currency.ts exactly — same functions, same signatures.
export function convertFromBRL(amountInBRL, region, rates = REGION_EXCHANGE_FROM_BRL) {
  return amountInBRL * rates[region];
}

export function formatCompactNumberForLocale(amountInBRL, region, rates = REGION_EXCHANGE_FROM_BRL) {
  return new Intl.NumberFormat(REGION_INTL_LOCALE[region], {
    notation: "compact",
    compactDisplay: "short",
  }).format(convertFromBRL(amountInBRL, region, rates));
}

export function formatCurrencyForLocale(amountInBRL, region, rates = REGION_EXCHANGE_FROM_BRL) {
  const converted = convertFromBRL(amountInBRL, region, rates);
  return new Intl.NumberFormat(REGION_INTL_LOCALE[region], {
    style: "currency",
    currency: REGION_CURRENCY[region],
  }).format(converted);
}

export function formatMonthLabel(date, region) {
  return date.toLocaleDateString(REGION_INTL_LOCALE[region], { month: "short", year: "2-digit" });
}

export function formatDateForRegion(date, region) {
  return date.toLocaleDateString(REGION_INTL_LOCALE[region]);
}
