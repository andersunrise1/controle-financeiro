import crypto from "crypto";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { User } from "./db";

/**
 * Compra única e vitalícia, R$ 19,90.
 *
 * A compra acontece **no site**, nunca dentro do app Android. Isso não é
 * preferência: o Google exige o Play Billing para conteúdo digital comprado
 * dentro de um app distribuído pela loja, e usar Mercado Pago ali daria
 * suspensão. O app apenas reflete o plano de quem já comprou — o mesmo
 * modelo de Netflix e Spotify.
 *
 * Consequência prática para quem mexer nisto depois: o aplicativo não pode
 * ganhar botão de compra, link para esta página, nem citar preço.
 */
export const LIFETIME_PRICE_BRL_CENTS = 1990;
export const LIFETIME_PRODUCT_NAME = "DIVISA Vitalício";

export function isPaymentConfigured(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

export function isWebhookConfigured(): boolean {
  return Boolean(process.env.MERCADOPAGO_WEBHOOK_SECRET);
}

function getClient(): MercadoPagoConfig {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN as string,
  });
}

function getFrontendUrl(): string {
  // FRONTEND_URL é uma lista separada por vírgula (CORS multi-origem); um
  // destino de redirecionamento precisa de uma URL só.
  return (process.env.FRONTEND_URL || "http://localhost:3000").split(",")[0].trim();
}

/**
 * Cria a preferência de checkout e devolve a URL para onde mandar o comprador.
 *
 * As chaves de metadata vão em snake_case de propósito: o Mercado Pago
 * normaliza os nomes para snake_case no servidor, então mandar camelCase faz
 * a chave voltar diferente no webhook — armadilha conhecida desta API.
 */
export async function createCheckout(user: User): Promise<{ url: string }> {
  const frontendUrl = getFrontendUrl();
  const backendUrl = process.env.BACKEND_PUBLIC_URL || "http://localhost:3001";

  // auto_return só é aceito com uma back_url https:// de verdade — com
  // http://localhost o Mercado Pago recusa a criação da preferência inteira
  // ("back_url.success must be defined"). Comportamento confirmado contra a
  // API real no projeto irmão, não deduzido da documentação.
  const canAutoReturn = frontendUrl.startsWith("https://");

  const preference = new Preference(getClient());
  const result = await preference.create({
    body: {
      items: [
        {
          id: "divisa-lifetime",
          title: LIFETIME_PRODUCT_NAME,
          quantity: 1,
          currency_id: "BRL",
          unit_price: LIFETIME_PRICE_BRL_CENTS / 100,
        },
      ],
      payer: { email: user.email },
      metadata: { user_id: user.id },
      back_urls: {
        success: `${frontendUrl}/pagamento/sucesso`,
        failure: `${frontendUrl}/pagamento/cancelado`,
        pending: `${frontendUrl}/pagamento/pendente`,
      },
      ...(canAutoReturn ? { auto_return: "approved" } : {}),
      notification_url: `${backendUrl}/api/payment/webhook`,
    },
  });

  const url = result.init_point ?? result.sandbox_init_point;
  if (!url) throw new Error("Mercado Pago não devolveu uma URL de checkout.");
  return { url };
}

/**
 * Confere a assinatura do webhook.
 *
 * O Mercado Pago assina cabeçalhos + a query string, não o corpo bruto (ao
 * contrário da Stripe). O manifesto é
 * "id:<data.id minúsculo>;request-id:<x-request-id>;ts:<ts>;", com
 * HMAC-SHA256 usando o segredo do painel.
 */
export function verifyWebhookSignature(
  headers: Headers,
  dataId: string | null
): boolean {
  const signatureHeader = headers.get("x-signature");
  const requestId = headers.get("x-request-id");
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!signatureHeader || !requestId || !dataId || !secret) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [chave, ...resto] = part.trim().split("=");
      return [chave.trim(), resto.join("=").trim()];
    })
  );
  const ts = parts.ts;
  const expectedHash = parts.v1;
  if (!ts || !expectedHash) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const computedHash = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  const esperado = Buffer.from(expectedHash);
  const calculado = Buffer.from(computedHash);
  if (esperado.length !== calculado.length) return false;

  return crypto.timingSafeEqual(esperado, calculado);
}

export interface PaymentInfo {
  status: string;
  userId: number | null;
}

/**
 * Busca o pagamento de verdade na API.
 *
 * Indispensável: o Mercado Pago notifica em toda mudança de estado
 * (pendente, recusado, aprovado), então receber a notificação não significa
 * que alguém pagou. Só `approved` libera o acesso.
 */
export async function getPaymentInfo(paymentId: string): Promise<PaymentInfo> {
  const payment = new Payment(getClient());
  const resultado = await payment.get({ id: paymentId });

  const bruto = (resultado.metadata as Record<string, unknown> | undefined)?.user_id;
  const userId = bruto == null ? null : Number(bruto);

  return {
    status: String(resultado.status ?? ""),
    userId: Number.isFinite(userId) ? (userId as number) : null,
  };
}
