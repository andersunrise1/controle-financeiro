"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Button3D from "./Button3D";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { fill } from "@/lib/i18n";
import { logout } from "@/lib/api";

const sunsetTextStyle = {
  background: "linear-gradient(90deg, #ffd93d, #ff8c42, #d6249f)",
  WebkitBackgroundClip: "text" as const,
  WebkitTextFillColor: "transparent" as const,
};

/**
 * Quanto tempo de teste resta, sempre visível.
 *
 * Descobrir que o teste acabou só na hora de salvar um lançamento é a pior
 * maneira de saber; aqui o número está à vista desde o primeiro dia.
 */
function PlanBadge() {
  const { access } = useAuth();
  const { t } = useI18n();

  if (!access) return null;

  if (access.plan === "lifetime") {
    return (
      <span className="rounded-full border border-[#39ff14]/40 bg-[#39ff14]/10 px-2.5 py-0.5 text-xs font-semibold text-[color:var(--alert-success-text)]">
        {t("trialBadgeLifetime")}
      </span>
    );
  }

  if (!access.active) {
    return (
      <Link
        href="/ativar"
        className="rounded-full border border-[#ff073a]/40 bg-[#ff073a]/10 px-2.5 py-0.5 text-xs font-semibold text-[color:var(--alert-error-text)]"
      >
        {t("navActivate")}
      </Link>
    );
  }

  return (
    <Link
      href="/ativar"
      className="rounded-full border border-[#ffd93d]/40 bg-[#ffd93d]/10 px-2.5 py-0.5 text-xs font-semibold text-[color:var(--alert-warning-text)]"
    >
      {fill(t("trialBadgeDays"), { n: access.trialDaysLeft ?? 0 })}
    </Link>
  );
}

export default function Navbar() {
  const { user, setUser, setAccess } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccess(null);
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <header className="border-b shadow-sm" style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/icon-divisa-final.png" alt="Divisa" className="h-12 w-12" />
          </Link>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {t("greeting")}{" "}
            <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>{user.name}</span>
          </p>
          <PlanBadge />
        </div>
        <div className="flex items-center gap-4">
          <Link href="/mercado" className="text-sm font-semibold transition" style={sunsetTextStyle}>
            {t("navMercado")}
          </Link>
          <Link href="/feedback" className="text-sm font-semibold transition" style={sunsetTextStyle}>
            {t("navFeedback")}
          </Link>
          <Link href="/conta" className="text-sm font-semibold transition" style={sunsetTextStyle}>
            {t("navAccount")}
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
