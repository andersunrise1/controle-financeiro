"use client";

import { useI18n } from "@/lib/i18n-context";
import { formatMonthFullLabel } from "@/lib/currency";

// toLocaleDateString's "long" month comes back lowercase in pt-BR/es
// ("julho"), which reads fine mid-sentence but looks wrong as a standalone
// dropdown option — capitalized for display only, the underlying value
// stays the plain month index.
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

interface MercadoFilterProps {
  years: number[];
  year: number;
  onYearChange: (year: number) => void;
  month: number | null;
  onMonthChange: (month: number | null) => void;
}

export default function MercadoFilter({ years, year, onYearChange, month, onMonthChange }: MercadoFilterProps) {
  const { region, t } = useI18n();
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-[color:var(--text-secondary)]">
          {t("mercadoFilterYearLabel")}
        </label>
        <select
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="input-dark w-full rounded-xl px-4 py-2.5 text-sm"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-[color:var(--text-secondary)]">
          {t("mercadoFilterMonthLabel")}
        </label>
        <select
          value={month === null ? "all" : month}
          onChange={(e) => onMonthChange(e.target.value === "all" ? null : Number(e.target.value))}
          className="input-dark w-full rounded-xl px-4 py-2.5 text-sm"
        >
          <option value="all">{t("mercadoFilterAllMonths")}</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {capitalize(formatMonthFullLabel(m, region))}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
