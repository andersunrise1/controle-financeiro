"use client";

import { useTheme } from "@/lib/theme-context";
import { useI18n } from "@/lib/i18n-context";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const label = theme === "dark" ? t("themeToggleToLight") : t("themeToggleToDark");

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition"
      style={{
        background: "var(--bg-input)",
        border: "1px solid var(--border-color)",
      }}
      title={label}
      aria-label={label}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
