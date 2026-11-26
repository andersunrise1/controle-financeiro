import { getDb, Plan } from "./db";

/**
 * Quem pode usar o app, e o que a compra entrega.
 *
 * **O modelo mudou em 2026-11-13.** Antes eram 60 dias com tudo liberado e
 * depois somente-leitura até comprar. Agora o app é gratuito para sempre, com
 * anúncio, e a compra única de R$ 19,90 tira o anúncio — o modelo do Duolingo,
 * decidido pelo usuário.
 *
 * O motivo da troca: anúncio só rende enquanto a pessoa usa o app, e um app
 * que trava no dia 61 é desinstalado. A trava garantia pressão de compra, mas
 * ao custo de perder as duas receitas de quem não comprava. Agora quem não
 * compra continua rendendo, todo mês.
 *
 * Por isso não existe mais nada aqui que bloqueie escrita: `canWrite` e
 * `TRIAL_ENDED_MESSAGE` foram removidos junto com as cinco verificações que
 * havia nas rotas de transações e recorrentes. Quem decide o que a conta
 * recebe de diferente é só o `plan`, e hoje a única diferença é o anúncio
 * (ver `mobile/src/services/ads.js`).
 */

export interface AccessStatus {
  plan: Plan;
  /**
   * Sempre `true` desde a mudança de modelo.
   *
   * O campo continua existindo de propósito: um app já instalado lê
   * `access.active` e, se ele vier ausente, o aviso dentro do app conclui que
   * o teste venceu e pinta a tela de vermelho. Mantê-lo em `true` faz esses
   * aparelhos simplesmente pararem de avisar — inclusive os que já estavam
   * travados, que voltam a funcionar sozinhos.
   */
  active: boolean;
  /** Não existe mais contagem de teste; fica `null` para todo mundo. */
  trialDaysLeft: number | null;
  /** Não há mais vencimento para avisar. */
  shouldWarn: boolean;
}

export function getAccessStatus(userId: number): AccessStatus {
  const row = getDb()
    .prepare("SELECT plan FROM users WHERE id = ?")
    .get(userId) as { plan: Plan } | undefined;

  return {
    plan: row?.plan ?? "trial",
    active: true,
    trialDaysLeft: null,
    shouldWarn: false,
  };
}

/**
 * Libera o acesso vitalício por COMPRA. Só o webhook de pagamento chama isto.
 *
 * É um UPDATE simples de propósito: o Mercado Pago reenvia a mesma notificação
 * mais de uma vez, e rodar isto duas vezes tem que ser inofensivo.
 *
 * `paid_at` é o que marca uma compra de verdade, e é por isso que ele NÃO é
 * preenchido por uma concessão manual — ver grantComplimentaryAccess.
 */
export function grantLifetimeAccess(userId: number, paymentId?: string | null): void {
  getDb()
    .prepare(
      `UPDATE users
          SET plan = 'lifetime',
              paid_at = COALESCE(paid_at, datetime('now')),
              mp_payment_id = COALESCE(?, mp_payment_id)
        WHERE id = ?`
    )
    .run(paymentId ?? null, userId);
}

/**
 * Libera o acesso vitalício por compra feita **dentro do app**, pelo Google
 * Play Billing. Só a rota de verificação chama isto, e só depois de o próprio
 * Google ter confirmado a compra.
 *
 * Resultado possível:
 * - `"liberado"` — acesso concedido (ou reconcedido, se já era desta conta)
 * - `"token_de_outra_conta"` — aquele comprovante já liberou outra conta
 *
 * Esse segundo caso é a defesa contra reuso: um `purchaseToken` é só um texto,
 * e nada impede alguém de mandar o mesmo de outra conta para ganhar acesso de
 * graça. O Google continuaria respondendo "comprado" — ele é verdadeiro, só
 * não é daquela pessoa. A trava é aqui, não lá.
 *
 * Fora isso é idempotente de propósito: o app reenvia a verificação quando o
 * aparelho fica sem rede no meio da compra, e repetir não pode quebrar nada.
 * `paid_at` usa COALESCE pelo mesmo motivo de grantLifetimeAccess — a data da
 * compra é a primeira, não a da última tentativa.
 */
export function grantLifetimeAccessFromGooglePlay(
  userId: number,
  purchaseToken: string
): "liberado" | "token_de_outra_conta" {
  const db = getDb();

  const dono = db
    .prepare("SELECT id FROM users WHERE google_play_purchase_token = ?")
    .get(purchaseToken) as { id: number } | undefined;

  if (dono && dono.id !== userId) return "token_de_outra_conta";

  db.prepare(
    `UPDATE users
        SET plan = 'lifetime',
            paid_at = COALESCE(paid_at, datetime('now')),
            google_play_purchase_token = ?
      WHERE id = ?`
  ).run(purchaseToken, userId);

  return "liberado";
}

/**
 * Libera o acesso vitalício de graça, pela tela de admin — parceiros de
 * divulgação, ou correção de um engano.
 *
 * Deixa `paid_at` em branco de propósito, e isso é a diferença inteira: a
 * trava que impede revogar um acesso olha justamente para `paid_at`. A primeira
 * versão usava grantLifetimeAccess aqui, e o efeito só apareceu ao testar —
 * a concessão marcava a conta como se tivesse pago, então o botão "Voltar para
 * teste" respondia 409 para todo mundo que tinha passado por esta tela. O botão
 * existia sem nunca poder funcionar.
 *
 * Com `paid_at` vazio, quem ganhou pode ter o acesso removido; quem pagou, não.
 */
export function grantComplimentaryAccess(userId: number): void {
  getDb()
    .prepare("UPDATE users SET plan = 'lifetime' WHERE id = ?")
    .run(userId);
}

/**
 * Desfaz a liberação — usado só pela tela de admin, para corrigir engano.
 *
 * Voltar para `trial` hoje significa voltar a ver anúncio, não perder o app.
 */
export function revokeLifetimeAccess(userId: number): void {
  getDb()
    .prepare("UPDATE users SET plan = 'trial' WHERE id = ?")
    .run(userId);
}
