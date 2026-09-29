import { getDb, Plan } from "./db";

/**
 * Quem pode usar o app, e até quando.
 *
 * O modelo é: 60 dias com tudo liberado, depois uma compra única e vitalícia.
 * Não há recorte de funcionalidade — a aba Mercado, por exemplo, é
 * conveniência: dá para registrar a mesma coisa pelo formulário comum com a
 * categoria "Mercado". Travar peças assim irritaria sem criar motivo para
 * pagar. O que se paga é o conjunto, depois de dois meses usando de verdade.
 *
 * São 60 dias e não 30 porque o diferencial do app só aparece com repetição:
 * acompanhar o preço do mesmo produto exige três ou quatro compras, e os
 * gráficos mensais precisam de mais de um mês para comparar qualquer coisa.
 */
export const TRIAL_DAYS = 60;

/** Quantos dias antes do fim o app começa a avisar. */
export const WARN_WITHIN_DAYS = 7;

export interface AccessStatus {
  plan: Plan;
  /** Pode usar o app agora. */
  active: boolean;
  /** Dias inteiros restantes do teste; 0 depois de vencido, null se já pagou. */
  trialDaysLeft: number | null;
  /** Vale a pena avisar que está acabando. */
  shouldWarn: boolean;
}

/**
 * Calculado em SQLite, não em JavaScript.
 *
 * created_at é gravado por `datetime('now')`, que produz
 * "2026-09-29 14:03:11". Comparar isso com uma data do JavaScript significa
 * comparar texto contra "2026-09-29T14:03:11.000Z" — e aí o espaço ordena
 * antes do "T", então toda linha parece mais antiga do que é. Esse erro já
 * custou caro neste projeto uma vez, no limite de pedidos de senha; manter
 * todo cálculo de tempo do mesmo lado é o que evita a repetição.
 */
export function getAccessStatus(userId: number): AccessStatus {
  const db = getDb();

  // ceil, não CAST AS INTEGER: o CAST trunca para baixo, e como
  // datetime('now') corta os milissegundos a diferença sai como 58,999 em
  // vez de 59 — o que roubaria um dia de cada usuário e encerraria o teste
  // 24 horas antes da hora. Arredondar para cima conta "dias que ainda
  // começam", que é o que a pessoa espera ao ler "faltam 3 dias".
  const row = db
    .prepare(
      `SELECT
         plan,
         CAST(
           ceil(julianday(datetime(created_at, '+' || ? || ' days')) - julianday('now'))
           AS INTEGER
         ) AS dias_restantes
       FROM users
       WHERE id = ?`
    )
    .get(TRIAL_DAYS, userId) as
    | { plan: Plan; dias_restantes: number }
    | undefined;

  if (!row) {
    return { plan: "trial", active: false, trialDaysLeft: 0, shouldWarn: false };
  }

  if (row.plan === "lifetime") {
    return { plan: "lifetime", active: true, trialDaysLeft: null, shouldWarn: false };
  }

  const diasRestantes = Math.max(0, row.dias_restantes);

  return {
    plan: "trial",
    active: diasRestantes > 0,
    trialDaysLeft: diasRestantes,
    shouldWarn: diasRestantes > 0 && diasRestantes <= WARN_WITHIN_DAYS,
  };
}

/**
 * Libera o acesso vitalício.
 *
 * Usado tanto pelo webhook de pagamento quanto pela tela de admin, que
 * concede acesso a parceiros de divulgação. É um UPDATE simples de
 * propósito: o Mercado Pago reenvia a mesma notificação mais de uma vez, e
 * rodar isto duas vezes tem que ser inofensivo.
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
 * Mensagem única para quando o teste vence.
 *
 * Deliberadamente sem preço e sem link: o app Android não pode oferecer
 * compra nem apontar para fora, sob pena de violar a política de pagamentos
 * do Google. O site, que não tem essa restrição, mostra o botão de compra
 * por conta própria ao reconhecer este estado.
 */
export const TRIAL_ENDED_MESSAGE =
  "Seu período de teste terminou. Seus dados continuam aqui e podem ser consultados — ative sua conta para voltar a registrar.";

/**
 * O teste vencido tira a escrita, não a leitura.
 *
 * Quem não ativou continua vendo saldo, histórico e gráficos do que já
 * registrou; só não consegue adicionar, editar ou apagar. Esconder o que a
 * pessoa construiu em dois meses puniria justamente quem mais usou o app —
 * e apagar seria pior ainda. O que ela vê é exatamente o que perde ao não
 * ativar.
 */
export function canWrite(userId: number): boolean {
  return getAccessStatus(userId).active;
}

/** Desfaz a liberação — usado só pela tela de admin, para corrigir engano. */
export function revokeLifetimeAccess(userId: number): void {
  getDb()
    .prepare("UPDATE users SET plan = 'trial' WHERE id = ?")
    .run(userId);
}
