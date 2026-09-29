"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Alert from "@/components/Alert";
import Button3D from "@/components/Button3D";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { fill, translateError } from "@/lib/i18n";
import {
  createCheckout,
  getPaymentOffer,
  PaymentOffer,
  formatCurrency,
} from "@/lib/api";

/**
 * Onde a compra acontece — e o único lugar onde ela pode acontecer.
 *
 * O aplicativo Android não tem botão de compra nem link para cá: o Google
 * exige o faturamento da própria loja para conteúdo digital vendido dentro de
 * um app da Play Store. O site não tem essa restrição.
 */
function AtivarContent() {
  const { access } = useAuth();
  const { t, locale } = useI18n();
  const [offer, setOffer] = useState<PaymentOffer | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPaymentOffer()
      .then(setOffer)
      .catch(() => setOffer(null));
  }, []);

  const handleBuy = async () => {
    setError("");
    setLoading(true);
    try {
      const { url } = await createCheckout();
      // Substitui a página em vez de abrir outra aba: o checkout do Mercado
      // Pago devolve o comprador para /pagamento/sucesso, e uma aba separada
      // deixaria a página antiga aberta mostrando o estado desatualizado.
      window.location.href = url;
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      setError(translateError(raw, locale));
      setLoading(false);
    }
  };

  if (access?.plan === "lifetime") {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-4xl">✓</p>
        <h1 className="mt-4 text-xl font-semibold text-[color:var(--text-primary)]">
          {t("activateAlreadyTitle")}
        </h1>
        <p className="mt-2 text-[color:var(--text-secondary)]">
          {t("activateAlreadyBody")}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block text-sm font-semibold text-blue-400 hover:underline"
        >
          {t("activateBackToApp")}
        </Link>
      </main>
    );
  }

  const beneficios = [
    t("activateBenefit1"),
    t("activateBenefit2"),
    t("activateBenefit3"),
    t("activateBenefit4"),
    t("activateBenefit5"),
    t("activateBenefit6"),
  ];

  const diasRestantes = access?.active ? (access.trialDaysLeft ?? 0) : 0;

  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">
          {t("activateTitle")}
        </h1>
        <p className="mt-1 text-[color:var(--text-secondary)]">
          {t("activateSubtitle")}
        </p>
      </div>

      <div className="card-dark rounded-2xl p-6 shadow-md">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-[color:var(--text-primary)]">
            {offer ? formatCurrency(offer.priceCents / 100) : "—"}
          </span>
          <span className="pb-1 text-sm text-[color:var(--text-muted)]">
            {t("activatePriceNote")}
          </span>
        </div>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
          {t("activateBenefitsTitle")}
        </h2>
        <ul className="mt-3 space-y-2">
          {beneficios.map((beneficio) => (
            <li
              key={beneficio}
              className="flex gap-2 text-sm text-[color:var(--text-secondary)]"
            >
              <span className="text-[color:var(--alert-success-text)]">✓</span>
              <span>{beneficio}</span>
            </li>
          ))}
        </ul>

        {diasRestantes > 0 && (
          <p className="mt-5 text-xs text-[color:var(--text-faint)]">
            {fill(t("activateTrialLeft"), { n: diasRestantes })}
          </p>
        )}

        {(error || offer?.available === false) && (
          <div className="mt-5">
            <Alert type="error" message={error || t("activateUnavailable")} />
          </div>
        )}

        <div className="mt-5">
          <Button3D
            fullWidth
            onClick={handleBuy}
            disabled={loading || offer?.available === false}
          >
            {loading ? t("activateButtonLoading") : t("activateButton")}
          </Button3D>
        </div>

        <p className="mt-3 text-center text-xs text-[color:var(--text-faint)]">
          {t("activateDataSafe")}
        </p>
      </div>

      <Link
        href="/dashboard"
        className="inline-block text-sm font-semibold text-blue-400 hover:underline"
      >
        {t("activateBackToApp")}
      </Link>
    </main>
  );
}

export default function AtivarPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg-dark">
        <Navbar />
        <AtivarContent />
      </div>
    </ProtectedRoute>
  );
}
