import { NextRequest } from "next/server";
import { jsonResponse, corsOptions } from "@/lib/cors";
import {
  getPaymentInfo,
  isWebhookConfigured,
  verifyWebhookSignature,
} from "@/lib/payment";
import { grantLifetimeAccess } from "@/lib/access";
import { logError, logInfo } from "@/lib/logger";

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

/**
 * Notificação do Mercado Pago.
 *
 * Responde 200 em quase todo caso, de propósito: qualquer outro código faz o
 * Mercado Pago reenviar a mesma notificação por horas. Só vale reenviar
 * quando o erro é nosso e temporário — e aí devolvemos 500.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isWebhookConfigured()) {
      logError("payment/webhook", new Error("MERCADOPAGO_WEBHOOK_SECRET ausente"));
      return jsonResponse(request, { received: true }, 200);
    }

    const { searchParams } = new URL(request.url);
    const dataId = searchParams.get("data.id");

    if (!verifyWebhookSignature(request.headers, dataId)) {
      // Assinatura inválida é requisição não autenticada, não erro nosso.
      logInfo("payment/webhook", "assinatura inválida, ignorado");
      return jsonResponse(request, { error: "Assinatura inválida." }, 401);
    }

    const corpo = await request.json().catch(() => ({}));
    const tipo = corpo?.type ?? corpo?.topic;

    if (tipo !== "payment") {
      logInfo("payment/webhook", `tipo "${tipo}" ignorado`);
      return jsonResponse(request, { received: true }, 200);
    }

    const paymentId = String(corpo?.data?.id ?? dataId);
    const info = await getPaymentInfo(paymentId);

    // O Mercado Pago avisa em toda transição (pending, rejected, approved).
    // Receber a notificação não significa que alguém pagou.
    if (info.status !== "approved") {
      logInfo("payment/webhook", `pagamento ${paymentId} está "${info.status}", nada a fazer`);
      return jsonResponse(request, { received: true }, 200);
    }

    if (info.userId == null) {
      // Sem o metadata não há como saber de quem é a compra. Registrar em vez
      // de falhar em silêncio: alguém pagou e precisa ser liberado à mão.
      logError(
        "payment/webhook",
        new Error(`pagamento aprovado ${paymentId} sem user_id no metadata`)
      );
      return jsonResponse(request, { received: true }, 200);
    }

    // UPDATE simples: o Mercado Pago reenvia a mesma notificação, então
    // rodar isto duas vezes precisa ser inofensivo.
    grantLifetimeAccess(info.userId, paymentId);
    logInfo("payment/webhook", `acesso vitalício liberado para o usuário ${info.userId}`);

    return jsonResponse(request, { received: true }, 200);
  } catch (error) {
    // Aqui sim vale o reenvio: se a API do Mercado Pago ou o banco falharam,
    // a notificação ainda não foi processada.
    logError("payment/webhook", error);
    return jsonResponse(request, { error: "Erro ao processar." }, 500);
  }
}
