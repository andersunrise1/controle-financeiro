import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { corsOptions, jsonResponse } from "@/lib/cors";
import {
  ACK_STATE_CONFIRMADO,
  PURCHASE_STATE_COMPRADO,
  acknowledgeProductPurchase,
  getProductPurchase,
  isGooglePlayConfigured,
} from "@/lib/googlePlay";
import { getAccessStatus, grantLifetimeAccessFromGooglePlay } from "@/lib/access";
import { logError, logInfo } from "@/lib/logger";

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

/**
 * O app terminou uma compra pelo Play Billing e manda o comprovante.
 *
 * Não existe webhook aqui, ao contrário do Mercado Pago: o Google não avisa o
 * servidor sozinho numa compra única. Quem inicia é o app, e por isso a
 * verificação precisa ser feita contra a API do Google — o corpo da requisição
 * vem de um aparelho que o usuário controla e não prova nada por si.
 *
 * Responde com o `plan` atualizado para o app se atualizar na hora, sem ter de
 * consultar outra rota logo em seguida.
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request.headers.get("authorization"));

  if (!user) {
    return jsonResponse(request, { error: "Não autenticado." }, 401);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const purchaseToken = body?.purchaseToken;

    if (typeof purchaseToken !== "string" || purchaseToken.trim() === "") {
      return jsonResponse(request, { error: "Comprovante de compra ausente." }, 400);
    }

    // Antes do 503 de propósito: isto só lê o nosso banco, não depende do
    // Google. Quem já é vitalício — por ter comprado pelo site, ou porque esta
    // é a segunda chamada da mesma compra — merece a resposta verdadeira, não
    // um "não configurado" que o faria procurar o suporte à toa.
    if (getAccessStatus(user.id).plan === "lifetime") {
      return jsonResponse(request, { plan: "lifetime", alreadyOwned: true });
    }

    if (!isGooglePlayConfigured()) {
      // Mesma escolha do Mercado Pago: dizer que o servidor não está
      // configurado, em vez de deixar a chamada estourar num erro genérico
      // que pareceria culpa da compra do cliente.
      return jsonResponse(
        request,
        {
          error:
            "A compra pelo app não está configurada neste servidor. Entre em contato com o suporte.",
        },
        503
      );
    }

    const compra = await getProductPurchase(purchaseToken.trim());

    if (compra.purchaseState !== PURCHASE_STATE_COMPRADO) {
      // Estado 2 é pagamento pendente (boleto, por exemplo). Não é erro nem
      // fraude: o app deve tentar de novo quando o Google aprovar.
      logInfo(
        "payment/google-play",
        `compra em estado ${compra.purchaseState} para o usuário ${user.id}, acesso não liberado`
      );
      return jsonResponse(
        request,
        { error: "Esta compra ainda não foi confirmada pelo Google.", plan: "trial" },
        409
      );
    }

    const resultado = grantLifetimeAccessFromGooglePlay(user.id, purchaseToken.trim());

    if (resultado === "token_de_outra_conta") {
      logInfo(
        "payment/google-play",
        `usuário ${user.id} enviou comprovante já vinculado a outra conta`
      );
      return jsonResponse(
        request,
        { error: "Esta compra já está vinculada a outra conta." },
        409
      );
    }

    // Só depois de o acesso estar gravado. Se a confirmação falhar, o cliente
    // já tem o que pagou, e o pior caso é o Google estornar em 3 dias — o
    // inverso (confirmar e não gravar) deixaria alguém pagando por nada.
    if (compra.acknowledgementState !== ACK_STATE_CONFIRMADO) {
      await acknowledgeProductPurchase(purchaseToken.trim());
    }

    logInfo("payment/google-play", `acesso vitalício liberado para o usuário ${user.id}`);
    return jsonResponse(request, { plan: "lifetime" });
  } catch (error) {
    logError("payment/google-play", error);
    return jsonResponse(request, { error: "Erro ao verificar a compra." }, 500);
  }
}
