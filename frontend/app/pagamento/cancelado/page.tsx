"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useI18n } from "@/lib/i18n-context";

function CanceladoContent() {
  const { t } = useI18n();

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-4xl">—</p>
      <h1 className="mt-4 text-xl font-semibold text-[color:var(--text-primary)]">
        {t("paymentCancelTitle")}
      </h1>
      <p className="mt-2 text-[color:var(--text-secondary)]">
        {t("paymentCancelBody")}
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <Link
          href="/ativar"
          className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_3px_0_#1d4ed8] transition hover:bg-blue-400"
        >
          {t("paymentCancelRetry")}
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-blue-400 hover:underline"
        >
          {t("activateBackToApp")}
        </Link>
      </div>
    </main>
  );
}

export default function PagamentoCanceladoPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg-dark">
        <Navbar />
        <CanceladoContent />
      </div>
    </ProtectedRoute>
  );
}
