"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import {
  Region,
  REGION_CURRENCY,
  REGION_INTL_LOCALE,
  VOLATILE_REGIONS,
} from "@/lib/regions";
import RegionSelect from "./RegionSelect";
import { parseAmount } from "@/lib/currency";

export default function CurrencyConverter() {
  const { region, rates, t } = useI18n();
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState<Region>(region);
  const [to, setTo] = useState<Region>(region === "BR" ? "US" : "BR");

  const parsedAmount = parseAmount(amount) || 0;
  // pivota pelo BRL, reaproveitando a mesma tabela de taxas do resto do app
  const inBRL = parsedAmount / rates.rates[from];
  const converted = inBRL * rates.rates[to];

  const resultFormatted = new Intl.NumberFormat(REGION_INTL_LOCALE[to], {
    style: "currency",
    currency: REGION_CURRENCY[to],
  }).format(converted);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const isVolatile = VOLATILE_REGIONS.includes(from) || VOLATILE_REGIONS.includes(to);

  const updatedAtFormatted = rates.updatedAt
    ? new Date(rates.updatedAt).toLocaleString(REGION_INTL_LOCALE[region])
    : null;

  return (
    <div className="card-dark rounded-2xl p-6 shadow-md">
      <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">{t("converterTitle")}</h2>
      <p className="mb-4 text-sm text-[color:var(--text-muted)]">{t("converterSubtitle")}</p>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-[color:var(--text-secondary)]">
          {t("converterAmountLabel")}
        </label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-dark w-full rounded-xl px-4 py-3"
        />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-[color:var(--text-secondary)]">
            {t("converterFrom")}
          </label>
          <RegionSelect value={from} onChange={setFrom} label={t("converterFrom")} />
        </div>

        <button
          type="button"
          onClick={handleSwap}
          aria-label="Inverter"
          className="mb-0.5 rounded-full border border-[color:var(--border-color)] bg-[color:var(--bg-input)] p-2.5 text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-card)]"
        >
          ⇄
        </button>

        <div>
          <label className="mb-1 block text-sm font-medium text-[color:var(--text-secondary)]">
            {t("converterTo")}
          </label>
          <RegionSelect value={to} onChange={setTo} label={t("converterTo")} />
        </div>
      </div>

      <p className="mt-5 text-center text-3xl font-bold neon-green">
        {resultFormatted}
      </p>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[color:var(--text-faint)]">
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            rates.isLive ? "bg-[#39ff14]" : "bg-gray-500"
          }`}
        />
        <span>{rates.isLive ? t("ratesLive") : t("ratesFallback")}</span>
        {updatedAtFormatted && (
          <span>
            · {t("ratesUpdatedAt")} {updatedAtFormatted}
          </span>
        )}
      </div>

      {isVolatile && (
        <p className="mt-2 text-center text-xs text-amber-400">
          ⚠ {t("volatileCurrencyWarning")}
        </p>
      )}
    </div>
  );
}
