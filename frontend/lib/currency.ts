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

// Just the month name, no year — used where the year is already fixed by a
// separate filter (e.g. the Mercado monthly chart, always scoped to one
// selected year) so repeating it on every axis label would be redundant.
export function formatMonthOnlyLabel(monthIndex: number, region: Region): string {
  return new Date(2000, monthIndex, 1).toLocaleDateString(REGION_INTL_LOCALE[region], {
    month: "short",
  });
}

export function formatMonthFullLabel(monthIndex: number, region: Region): string {
  return new Date(2000, monthIndex, 1).toLocaleDateString(REGION_INTL_LOCALE[region], {
    month: "long",
  });
}

export function formatDateForRegion(date: Date, region: Region): string {
  return date.toLocaleDateString(REGION_INTL_LOCALE[region]);
}

// Parses what a person actually types into an amount field, in either of the
// app's two number conventions (pt-BR "1.234,56" and en-US "1,234.56").
//
// A plain `parseFloat(value.replace(",", "."))` — what every form here used
// to do — only swaps the FIRST comma, so "2.500,00" becomes "2.500.00" and
// parseFloat stops at the second dot: R$ 2,50 instead of R$ 2.500,00. Silent,
// and off by a factor of a thousand, which is not a thing a finance app
// should do.
//
// The rule: whichever separator comes last decides. If it's followed by 1-2
// digits it's the decimal point; otherwise every separator is a thousands
// separator, so "1.500" reads as fifteen hundred rather than one and a half.
export function parseAmount(input: string | number): number {
  if (typeof input === "number") return input;
  if (typeof input !== "string") return NaN;

  const cleaned = input.trim().replace(/[^\d.,-]/g, "");
  if (!cleaned) return NaN;

  const lastSeparator = Math.max(cleaned.lastIndexOf(","), cleaned.lastIndexOf("."));
  if (lastSeparator === -1) return parseFloat(cleaned);

  const decimalDigits = cleaned.length - lastSeparator - 1;

  if (decimalDigits >= 1 && decimalDigits <= 2) {
    const whole = cleaned.slice(0, lastSeparator).replace(/[.,]/g, "");
    return parseFloat(`${whole}.${cleaned.slice(lastSeparator + 1)}`);
  }

  return parseFloat(cleaned.replace(/[.,]/g, ""));
}
