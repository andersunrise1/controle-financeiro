"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { LOCALES, LOCALE_COUNTRY, LOCALE_LABELS } from "@/lib/i18n";
import FlagIcon from "./FlagIcon";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Trocar idioma"
        className="flex items-center gap-2 rounded-xl border border-[#555] bg-[#2a2a2a] px-3 py-2 text-sm text-gray-200 hover:bg-[#3a3a3a]"
      >
        <FlagIcon country={LOCALE_COUNTRY[locale]} />
        <span className="hidden sm:inline">{LOCALE_LABELS[locale]}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-xl border border-[#555] bg-[#2a2a2a] shadow-lg">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#3a3a3a] ${
                l === locale ? "text-[#00e5ff]" : "text-gray-200"
              }`}
            >
              <FlagIcon country={LOCALE_COUNTRY[l]} />
              <span>{LOCALE_LABELS[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
