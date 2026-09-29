"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useI18n } from "@/lib/i18n-context";

/**
 * Boleto e Pix fora do horário caem aqui: o pagamento existe, mas ainda não
 * foi aprovado. Nada a fazer além de explicar — quando o Mercado Pago aprovar,
 * o webhook libera o acesso sozinho, sem o usuário precisar voltar.
 */
function PendenteContent() {
  const { t } = useI18n();

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-4xl">⏳</p>
      <h1 className="mt-4 text-xl font-semibold text-[color:var(--text-primary)]">
        {t("paymentPendingTitle")}
      </h1>
      <p className="mt-2 text-[color:var(--text-secondary)]">
        {t("paymentPendingBody")}
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

export default function PagamentoPendentePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg-dark">
        <Navbar />
        <PendenteContent />
      </div>
    </ProtectedRoute>
  );
}
