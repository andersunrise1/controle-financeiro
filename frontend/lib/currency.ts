import {
  Region,
  REGION_CURRENCY,
  REGION_INTL_LOCALE,
  REGION_EXCHANGE_FROM_BRL,
} from "./regions";

export function convertFromBRL(
  amountInBRL: number,
  region: Region,
  rates: Record<Region, number> = REGION_EXCHANGE_FROM_BRL
): number {
  return amountInBRL * rates[region];
}

export function formatCompactNumberForLocale(
  amountInBRL: number,
  region: Region,
  rates: Record<Region, number> = REGION_EXCHANGE_FROM_BRL
): string {
  return new Intl.NumberFormat(REGION_INTL_LOCALE[region], {
    notation: "compact",
    compactDisplay: "short",
  }).format(convertFromBRL(amountInBRL, region, rates));
}

export function formatCurrencyForLocale(
  amountInBRL: number,
  region: Region,
  rates: Record<Region, number> = REGION_EXCHANGE_FROM_BRL
): string {
  const converted = convertFromBRL(amountInBRL, region, rates);
  return new Intl.NumberFormat(REGION_INTL_LOCALE[region], {
    style: "currency",
    currency: REGION_CURRENCY[region],
  }).format(converted);
}

export function formatMonthLabel(date: Date, region: Region): string {
  return date.toLocaleDateString(REGION_INTL_LOCALE[region], {
    month: "short",
    year: "2-digit",
  });
}

export function formatDateForRegion(date: Date, region: Region): string {
  return date.toLocaleDateString(REGION_INTL_LOCALE[region]);
}
