import { Locale } from "./i18n";

// Fixed approximate rates from BRL, for display conversion only — not
// real-time. The amount stored in the database is always the real BRL
// value the user spent; switching language only changes how it's shown.
const EXCHANGE_RATE_FROM_BRL: Record<Locale, number> = {
  pt: 1,
  en: 0.18, // BRL -> USD
  es: 0.17, // BRL -> EUR
};

const CURRENCY_CODE: Record<Locale, string> = {
  pt: "BRL",
  en: "USD",
  es: "EUR",
};

const INTL_LOCALE: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
};

export function convertFromBRL(amountInBRL: number, locale: Locale): number {
  return amountInBRL * EXCHANGE_RATE_FROM_BRL[locale];
}

export function formatCompactNumberForLocale(
  amountInBRL: number,
  locale: Locale
): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    notation: "compact",
    compactDisplay: "short",
  }).format(convertFromBRL(amountInBRL, locale));
}

export function formatCurrencyForLocale(
  amountInBRL: number,
  locale: Locale
): string {
  const converted = amountInBRL * EXCHANGE_RATE_FROM_BRL[locale];
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "currency",
    currency: CURRENCY_CODE[locale],
  }).format(converted);
}

export function formatMonthLabel(date: Date, locale: Locale): string {
  return date.toLocaleDateString(INTL_LOCALE[locale], {
    month: "short",
    year: "2-digit",
  });
}
