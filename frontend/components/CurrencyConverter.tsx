"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import {
  Region,
  REGION_CURRENCY,
  REGION_INTL_LOCALE,
  REGION_EXCHANGE_FROM_BRL,
} from "@/lib/regions";
import RegionSelect from "./RegionSelect";

export default function CurrencyConverter() {
  const { region, t } = useI18n();
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState<Region>(region);
  const [to, setTo] = useState<Region>(region === "BR" ? "US" : "BR");

  const parsedAmount = parseFloat(amount.replace(",", ".")) || 0;
  // pivota pelo BRL, reaproveitando a mesma tabela de taxas do resto do app
  const inBRL = parsedAmount / REGION_EXCHANGE_FROM_BRL[from];
  const converted = inBRL * REGION_EXCHANGE_FROM_BRL[to];

  const resultFormatted = new Intl.NumberFormat(REGION_INTL_LOCALE[to], {
    style: "currency",
    currency: REGION_CURRENCY[to],
  }).format(converted);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="card-dark rounded-2xl p-6 shadow-md">
      <h2 className="text-lg font-semibold text-gray-100">{t("converterTitle")}</h2>
      <p className="mb-4 text-sm text-gray-400">{t("converterSubtitle")}</p>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-300">
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
          <label className="mb-1 block text-sm font-medium text-gray-300">
            {t("converterFrom")}
          </label>
          <RegionSelect value={from} onChange={setFrom} label={t("converterFrom")} />
        </div>

        <button
          type="button"
          onClick={handleSwap}
          aria-label="Inverter"
          className="mb-0.5 rounded-full border border-[#555] bg-[#2a2a2a] p-2.5 text-gray-300 hover:bg-[#3a3a3a]"
        >
          ⇄
        </button>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            {t("converterTo")}
          </label>
          <RegionSelect value={to} onChange={setTo} label={t("converterTo")} />
        </div>
      </div>

      <p className="mt-5 text-center text-3xl font-bold neon-green">
        {resultFormatted}
      </p>
    </div>
  );
}
