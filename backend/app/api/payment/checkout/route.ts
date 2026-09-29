import { NextRequest } from "next/server";
import { getAuthUser, getUserByEmail } from "@/lib/auth";
import { corsOptions, jsonResponse } from "@/lib/cors";
import {
  createCheckout,
  isPaymentConfigured,
  LIFETIME_PRICE_BRL_CENTS,
  LIFETIME_PRODUCT_NAME,
} from "@/lib/payment";
import { getAccessStatus } from "@/lib/access";
import { logError, logInfo } from "@/lib/logger";

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

/**
 * O que a página de ativação precisa saber antes de qualquer clique: o preço
 * de verdade e se o pagamento está disponível.
 *
 * O preço vem daqui, e não de uma constante repetida no site, porque o valor
 * cobrado é este. Se um dia mudar, muda em um lugar só, e não existe o caso de
 * a página anunciar R$ 19,90 e o checkout abrir com outro número.
 */
export async function GET(request: NextRequest) {
  return jsonResponse(request, {
    available: isPaymentConfigured(),
    priceCents: LIFETIME_PRICE_BRL_CENTS,
    currency: "BRL",
    productName: LIFETIME_PRODUCT_NAME,
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request.headers.get("authorization"));

  if (!user) {
    return jsonResponse(request, { error: "Não autenticado." }, 401);
  }

  try {
    if (!isPaymentConfigured()) {
      return jsonResponse(
        request,
        {
          error:
            "O pagamento não está configurado neste servidor. Entre em contato com o suporte.",
        },
        503
      );
    }

    // Evita cobrar duas vezes de quem já é vitalício — o botão não deveria
    // nem aparecer, mas uma aba antiga aberta consegue chegar aqui.
    if (getAccessStatus(user.id).plan === "lifetime") {
      return jsonResponse(
        request,
        { error: "Sua conta já tem acesso vitalício." },
        409
      );
    }

    const conta = getUserByEmail(user.email);
    if (!conta) {
      return jsonResponse(request, { error: "Conta não encontrada." }, 404);
    }

    const { url } = await createCheckout(conta);
    logInfo("payment/checkout", `preferência criada para o usuário ${user.id}`);
    return jsonResponse(request, { url });
  } catch (error) {
    logError("payment/checkout", error);
    return jsonResponse(request, { error: "Erro interno do servidor." }, 500);
  }
}
