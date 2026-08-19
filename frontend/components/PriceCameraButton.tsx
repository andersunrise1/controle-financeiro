"use client";

import { useRef, useState, ChangeEvent } from "react";
import { recognizePriceFromImage } from "@/lib/priceOcr";
import { useI18n } from "@/lib/i18n-context";

interface PriceCameraButtonProps {
  onPriceDetected: (value: string, raw: string) => void;
  onNotFound: () => void;
}

export default function PriceCameraButton({
  onPriceDetected,
  onNotFound,
}: PriceCameraButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);
  const { t } = useI18n();

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReading(true);
    try {
      const detected = await recognizePriceFromImage(file);
      if (detected) {
        onPriceDetected(detected.value, detected.raw);
      } else {
        onNotFound();
      }
    } catch {
      onNotFound();
    } finally {
      setReading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
        aria-label={t("scanPriceLabel")}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={reading}
        aria-label={t("scanPriceLabel")}
        title={t("scanPriceLabel")}
        className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border border-[#555] bg-[#2a2a2a] text-gray-300 transition hover:border-[#6b7280] hover:text-white disabled:opacity-60"
      >
        {reading ? (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        )}
      </button>
    </>
  );
}
