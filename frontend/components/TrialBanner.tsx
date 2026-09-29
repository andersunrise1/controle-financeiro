"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { fill } from "@/lib/i18n";

/**
 * Avisa que o teste está acabando, ou que acabou.
 *
 * Só existe no site. O aplicativo Android tem um aviso equivalente, mas sem
 * preço e sem link para cá — a política de pagamentos do Google não permite
 * que um app da loja mande o usuário comprar conteúdo digital fora dela.
 */
export default function TrialBanner() {
  const { access } = useAuth();
  const { t } = useI18n();

  if (!access || access.plan === "lifetime") return null;

  const dias = access.trialDaysLeft ?? 0;

  if (access.active && !access.shouldWarn) return null;

  const vencido = !access.active;

  const mensagem = vencido
    ? t("trialBannerEnded")
    : dias <= 1
      ? t("trialBannerWarnLast")
      : fill(t("trialBannerWarn"), { n: dias });

  // Vencido é vermelho porque algo deixou de funcionar; faltando dias é
  // âmbar, um lembrete — a diferença importa para quem só bate o olho.
  const cor = vencido
    ? { border: "#ff073a", text: "var(--alert-error-text)" }
    : { border: "#ffd93d", text: "var(--alert-warning-text)" };

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3"
      style={{
        borderColor: `${cor.border}66`,
        background: `${cor.border}1a`,
      }}
    >
      <p className="text-sm font-medium" style={{ color: cor.text }}>
        {mensagem}
      </p>
      <Link
        href="/ativar"
        className="shrink-0 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_3px_0_#1d4ed8] transition hover:bg-blue-400"
      >
        {t("trialBannerCta")}
      </Link>
    </div>
  );
}
