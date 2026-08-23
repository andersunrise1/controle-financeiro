"use client";

import { useEffect, useRef, useState } from "react";
import { Region, REGIONS, REGION_LABELS } from "@/lib/regions";
import FlagIcon from "./FlagIcon";

interface RegionSelectProps {
  value: Region;
  onChange: (region: Region) => void;
  label: string;
}

export default function RegionSelect({ value, onChange, label }: RegionSelectProps) {
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
        aria-label={label}
        className="input-dark flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-[color:var(--text-primary)]"
      >
        <FlagIcon country={value} />
        <span className="flex-1 truncate text-left">{REGION_LABELS[value]}</span>
        <span className="text-[color:var(--text-muted)]">▾</span>
      </button>

      {open && (
        <div className="scrollbar-neon absolute left-0 right-0 z-10 mt-2 max-h-60 overflow-y-auto rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-input)] shadow-lg">
          {REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                onChange(r);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[color:var(--bg-card)] ${
                r === value ? "text-[color:var(--text-accent-cyan)]" : "text-[color:var(--text-secondary)]"
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
