import { NextRequest } from "next/server";
import { getDb } from "./db";
import { logError } from "./logger";

/**
 * Limite de tentativas de login.
 *
 * A recuperação de senha já tinha um limite desde o início; o login não tinha
 * nenhum, o que deixava a porta principal aberta para alguém testar uma lista
 * de senhas comuns contra um e-mail conhecido sem nunca ser interrompido.
 */

/** Janela deslizante. Não é bloqueio permanente: espera-se e volta a valer. */
const WINDOW_MINUTES = 15;

/**
 * Tentativas erradas por e-mail antes de recusar.
 *
 * Dez é generoso para quem esqueceu qual senha usou e sovina para quem está
 * varrendo uma lista: 10 por 15 minutos são ~960 por dia, contra os milhões
 * que uma lista de senhas vazadas exige.
 */
const MAX_PER_EMAIL = 10;

/**
 * Teto por endereço de origem, mais alto e proposital.
 *
 * Existe para o outro ataque, o inverso: uma senha só ("123456") testada
 * contra centenas de e-mails diferentes. O limite por e-mail não pega isso,
 * porque cada endereço recebe uma tentativa só.
 *
 * É mais alto porque uma família, um escritório ou uma rede de celular saem
 * todos pelo mesmo IP — apertar aqui puniria gente inocente.
 */
const MAX_PER_IP = 40;

export interface ThrottleResult {
  blocked: boolean;
  /** Quantos minutos até liberar, para dizer isso a quem está esperando. */
  retryAfterMinutes: number;
}

/**
 * De onde a requisição veio, atrás do proxy do Railway.
 *
 * `x-forwarded-for` é uma lista, e o primeiro item é o cliente original — os
 * seguintes são proxies pelo caminho. O cabeçalho é forjável por quem fala
 * direto com o servidor, mas em produção só o proxy do Railway consegue
 * alcançá-lo, e ele reescreve o valor. É por isso que o limite por e-mail
 * (que não depende de IP) é a defesa principal, e o de IP só complementa.
 */
export function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip");
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Conta as falhas recentes e diz se é para recusar.
 *
 * Toda a conta de tempo acontece dentro do SQLite, nunca no JavaScript:
 * `created_at` é escrito por `datetime('now')` ("2026-09-29 14:30:00"),
 * enquanto `Date#toISOString` produz "2026-09-29T14:30:00.000Z". Comparados
 * como texto — que é tudo o que o SQLite faz com eles — o espaço ordena antes
 * do "T", então toda linha parece mais antiga do que é e a janela não casa com
 * nada. Esse erro exato já quebrou o limite do reset de senha neste projeto
 * uma vez, silenciosamente.
 */
export function checkLoginThrottle(
  email: string,
  ip: string | null
): ThrottleResult {
  const db = getDb();
  const janela = `-${WINDOW_MINUTES} minutes`;

  const porEmail = db
    .prepare(
      `SELECT COUNT(*) AS n FROM login_attempts
        WHERE email = ? AND created_at > datetime('now', ?)`
    )
    .get(normalizeEmail(email), janela) as { n: number };

  if (porEmail.n >= MAX_PER_EMAIL) {
    return { blocked: true, retryAfterMinutes: WINDOW_MINUTES };
  }

  if (ip) {
    const porIp = db
      .prepare(
        `SELECT COUNT(*) AS n FROM login_attempts
          WHERE ip = ? AND created_at > datetime('now', ?)`
      )
      .get(ip, janela) as { n: number };

    if (porIp.n >= MAX_PER_IP) {
      return { blocked: true, retryAfterMinutes: WINDOW_MINUTES };
    }
  }

  return { blocked: false, retryAfterMinutes: 0 };
}

/**
 * As três funções de escrita abaixo nunca deixam um erro escapar.
 *
 * Isto não é zelo genérico, é uma falha observada: a primeira versão deixava o
 * erro subir, e um "database is locked" momentâneo dentro de
 * `clearLoginAttempts` transformou um login com a senha CORRETA num erro 500 —
 * o contador é manutenção, e manutenção não pode barrar a entrada de um cliente
 * legítimo. A leitura (`checkLoginThrottle`) é outra história e continua
 * propagando: se ela falha, o banco está realmente quebrado e a requisição vai
 * falhar de qualquer forma.
 *
 * O custo de engolir o erro é conhecido e aceito: numa janela em que o banco
 * esteja travado, uma tentativa errada pode não ser contada. É melhor do que
 * trancar fora quem acertou a senha.
 */
export function recordFailedLogin(email: string, ip: string | null): void {
  try {
    getDb()
      .prepare("INSERT INTO login_attempts (email, ip) VALUES (?, ?)")
      .run(normalizeEmail(email), ip);
  } catch (error) {
    logError("loginThrottle/record", error);
  }
}

/**
 * Zera o contador do e-mail depois de um login que deu certo.
 *
 * Sem isto, alguém que errou a senha nove vezes e acertou na décima ficaria
 * a uma tentativa do bloqueio pelos próximos 15 minutos — punido justamente
 * por ter conseguido entrar.
 */
export function clearLoginAttempts(email: string): void {
  try {
    getDb()
      .prepare("DELETE FROM login_attempts WHERE email = ?")
      .run(normalizeEmail(email));
  } catch (error) {
    logError("loginThrottle/clear", error);
  }
}

/**
 * Descarta tentativas antigas.
 *
 * Nada além da janela tem utilidade, e a tabela cresceria para sempre. Roda
 * junto com o registro de uma falha (o único momento em que a tabela cresce),
 * em vez de depender de uma tarefa agendada que este projeto não tem.
 */
export function pruneOldLoginAttempts(): void {
  try {
    getDb()
      .prepare("DELETE FROM login_attempts WHERE created_at < datetime('now', '-1 day')")
      .run();
  } catch (error) {
    logError("loginThrottle/prune", error);
  }
}

export const THROTTLE_CONFIG = {
  WINDOW_MINUTES,
  MAX_PER_EMAIL,
  MAX_PER_IP,
};
