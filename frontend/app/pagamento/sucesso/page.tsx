"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { getMe } from "@/lib/api";

/** Quantas vezes perguntar ao servidor, e de quanto em quanto tempo. */
const TENTATIVAS = 5;
const INTERVALO_MS = 2000;

/**
 * Onde o Mercado Pago devolve o comprador depois de aprovar.
 *
 * O redirecionamento costuma chegar aqui **antes** do webhook que libera o
 * acesso — são dois caminhos independentes saindo do Mercado Pago, e nada
 * garante a ordem. Por isso a página pergunta ao servidor algumas vezes em vez
 * de confiar no que já tinha em mãos, e, se o webhook ainda não chegou, diz
 * isso em vez de afirmar que deu errado.
 */
function SucessoContent() {
  const { access, refreshUser } = useAuth();
  const { t } = useI18n();
  const [desistiu, setDesistiu] = useState(false);

  const ativo = access?.plan === "lifetime";

  // Sem trava de "já rodou".
  //
  // A primeira versão tinha uma, e ela quebrava a página inteira: o React monta
  // o componente, executa a limpeza e monta de novo. A limpeza cancelava o laço
  // da primeira montagem, e a trava impedia a segunda de começar — sobrava
  // nenhum. A tela ficava em "Confirmando..." para sempre, mesmo com o servidor
  // já respondendo que o acesso estava ativo (foi exatamente assim que isto
  // apareceu na verificação).
  //
  // Sem a trava, uma remontagem apenas recomeça a sequência, que é o
  // comportamento certo: são leituras, repetir não custa nem estraga nada.
  useEffect(() => {
    let cancelado = false;

    (async () => {
      for (let tentativa = 0; tentativa < TENTATIVAS; tentativa++) {
        // Lê direto do servidor em vez de olhar o `access` do contexto: o
        // valor capturado por este efeito é o do primeiro render e nunca
        // mudaria, então o laço continuaria tentando depois de já ter dado
        // certo.
        try {
          const { access } = await getMe();
          if (cancelado) return;
          if (access?.plan === "lifetime") {
            await refreshUser();
            return;
          }
        } catch {
          // Uma falha de rede no meio da confirmação não é motivo para
          // declarar que o pagamento não chegou — tenta de novo.
        }

        await new Promise((resolve) => setTimeout(resolve, INTERVALO_MS));
        if (cancelado) return;
      }
      setDesistiu(true);
    })();

    return () => {
      cancelado = true;
    };
    // refreshUser é recriado a cada render do provider, então listá-lo aqui
    // reiniciaria o laço sem parar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-4xl">{ativo ? "✓" : "⏳"}</p>
      <h1 className="mt-4 text-xl font-semibold text-[color:var(--text-primary)]">
        {t("paymentSuccessTitle")}
      </h1>
      <p className="mt-2 text-[color:var(--text-secondary)]">
        {ativo
          ? t("paymentSuccessDone")
          : desistiu
            ? t("paymentSuccessSlow")
            : t("paymentSuccessChecking")}
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

export default function PagamentoSucessoPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg-dark">
        <Navbar />
        <SucessoContent />
      </div>
    </ProtectedRoute>
  );
}
