import fs from "fs";
import { google } from "googleapis";

/**
 * Compra vitalícia feita **dentro do app Android**, pelo Google Play Billing.
 *
 * Segundo caminho de compra, ao lado do Mercado Pago (`payment.ts`). Os dois
 * coexistem de verdade e levam ao mesmo lugar: `plan = 'lifetime'`. Quem
 * comprar pelo app tem o site liberado, e vice-versa — é a mesma conta.
 *
 * Arquivo separado de `payment.ts` de propósito: SDKs, credenciais e fluxo de
 * reembolso não têm nada em comum entre os dois provedores. Misturá-los só
 * criaria condicionais dentro de cada função.
 *
 * **Por que isto precisa existir:** o Google exige o Play Billing para
 * conteúdo digital comprado dentro de um app da loja. Até ele entrar, quem
 * instalar o DIVISA pela Play Store não tem como comprar — o app não pode
 * mostrar preço nem apontar para o site, então a conversão pelo app é zero.
 *
 * O identificador abaixo tem de bater exatamente com o produto único
 * ("gerenciado") cadastrado no Play Console.
 */
export const LIFETIME_PRODUCT_ID = "divisa_vitalicio";

/**
 * Lido a cada chamada, não guardado numa constante de módulo.
 *
 * Mesma escolha de `isPaymentConfigured`: a variável de ambiente pode não
 * existir quando o módulo é carregado, e um valor congelado no import deixaria
 * o endpoint respondendo 503 mesmo depois de configurado.
 */
export function isGooglePlayConfigured(): boolean {
  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME;
  const keyPath = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH;
  return Boolean(packageName && keyPath && fs.existsSync(keyPath));
}

function getPublisherClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH,
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  });
  return google.androidpublisher({ version: "v3", auth });
}

/** `purchaseState`: 0 comprado, 1 cancelado, 2 pendente. */
export const PURCHASE_STATE_COMPRADO = 0;
/** `acknowledgementState`: 0 ainda não confirmado, 1 confirmado. */
export const ACK_STATE_CONFIRMADO = 1;

export interface ProductPurchase {
  purchaseState?: number | null;
  acknowledgementState?: number | null;
  orderId?: string | null;
}

/**
 * Pergunta ao Google o que é aquele comprovante.
 *
 * O app manda um `purchaseToken` e nada mais. Nunca confiar no que ele diz
 * sobre a compra: o servidor pergunta direto à fonte, porque um app em
 * aparelho de terceiro é código que o usuário controla.
 */
export async function getProductPurchase(
  purchaseToken: string,
  productId: string = LIFETIME_PRODUCT_ID
): Promise<ProductPurchase> {
  const publisher = getPublisherClient();
  const { data } = await publisher.purchases.products.get({
    packageName: process.env.GOOGLE_PLAY_PACKAGE_NAME as string,
    productId,
    token: purchaseToken,
  });
  return data as ProductPurchase;
}

/**
 * Confirma a compra junto ao Google.
 *
 * **O Google estorna sozinho toda compra não confirmada em 3 dias.** Por isso
 * roda logo depois de constatar `purchaseState === 0`, e não numa rotina
 * posterior: um cliente que pagou e teve o dinheiro devolvido por descuido
 * nosso é pior do que a venda não ter acontecido.
 */
export async function acknowledgeProductPurchase(
  purchaseToken: string,
  productId: string = LIFETIME_PRODUCT_ID
): Promise<void> {
  const publisher = getPublisherClient();
  await publisher.purchases.products.acknowledge({
    packageName: process.env.GOOGLE_PLAY_PACKAGE_NAME as string,
    productId,
    token: purchaseToken,
    requestBody: {},
  });
}
