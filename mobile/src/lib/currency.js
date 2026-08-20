// i18n/16-country currency formatting is Etapa 4 — mobile only knows BRL for
// now, matching frontend/lib/currency.ts's formatCurrencyForLocale() called
// with region="BR". Revisit once RegionSelect is ported.
export function formatBRL(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDateBR(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("pt-BR");
}
