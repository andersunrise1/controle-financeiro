"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Button3D from "./Button3D";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { logout } from "@/lib/api";

const sunsetTextStyle = {
  background: "linear-gradient(90deg, #ffd93d, #ff8c42, #d6249f)",
  WebkitBackgroundClip: "text" as const,
  WebkitTextFillColor: "transparent" as const,
};

export default function Navbar() {
  const { user, setUser } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <header className="border-b shadow-sm" style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/icon-divisa-final.png" alt="Divisa" className="h-12 w-12" />
            <span
              className="hidden text-lg font-extrabold tracking-[0.15em] sm:inline"
              style={sunsetTextStyle}
            >
              DIVISA
            </span>
          </Link>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {t("greeting")}{" "}
            <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>{user.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/mercado" className="text-sm font-semibold transition" style={sunsetTextStyle}>
            {t("navMercado")}
          </Link>
          <Link href="/feedback" className="text-sm font-semibold transition" style={sunsetTextStyle}>
            {t("navFeedback")}
          </Link>
          {user.isAdmin && (
            <Link href="/admin" className="text-sm font-semibold transition" style={sunsetTextStyle}>
              {t("navAdmin")}
            </Link>
          )}
          <ThemeToggle />
          <LanguageSwitcher />
          <Button3D variant="secondary" onClick={handleLogout}>
            {t("logout")}
          </Button3D>
        </div>
      </div>
    </header>
  );
}
