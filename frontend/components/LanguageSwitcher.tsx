"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { REGIONS, REGION_LABELS } from "@/lib/regions";
import FlagIcon from "./FlagIcon";

export default function LanguageSwitcher() {
  const { region, setRegion } = useI18n();
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
        aria-label="Trocar país / moeda"
        className="flex items-center gap-2 rounded-xl border border-[#555] bg-[#2a2a2a] px-3 py-2 text-sm text-gray-200 hover:bg-[#3a3a3a]"
      >
        <FlagIcon country={region} />
        <span className="hidden sm:inline">{REGION_LABELS[region]}</span>
      </button>

      {open && (
        <div className="scrollbar-neon absolute right-0 z-10 mt-2 max-h-72 w-48 overflow-y-auto rounded-xl border border-[#555] bg-[#2a2a2a] shadow-lg">
          {REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRegion(r);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#3a3a3a] ${
                r === region ? "text-[#00e5ff]" : "text-gray-200"
              }`}
            >
              <FlagIcon country={r} />
              <span>{REGION_LABELS[r]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
