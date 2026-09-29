import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getDb, User } from "./db";

const DEV_FALLBACK_SECRET = "dev-secret-key";

/**
 * The key every session token is signed with.
 *
 * Read lazily, per call, rather than at module load: `next build` runs with
 * NODE_ENV=production, and throwing at import time would break the build on
 * a machine that legitimately has no secret set.
 *
 * In production a missing JWT_SECRET is fatal on purpose. Falling back to a
 * value that is published in this repository would let anyone who read it
 * mint a valid token for any account — that is worse than the app refusing
 * to authenticate at all.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET não está definido. O servidor se recusa a assinar ou " +
        "validar sessões com a chave de desenvolvimento em produção — " +
        "qualquer pessoa que conheça essa chave conseguiria forjar o acesso " +
        "a qualquer conta. Defina JWT_SECRET nas variáveis de ambiente."
    );
  }

  return DEV_FALLBACK_SECRET;
}

const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// The one account that sees the admin area — no separate role stored in the
// DB, just this email. Set ADMIN_EMAIL in production; this default only
// matters for local dev.
const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "andersunrise1@gmail.com"
).toLowerCase();

export function isAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface TokenPayload {
  userId: number;
  email: string;
}

/**
 * Custo do bcrypt.
 *
 * 12 é o padrão recomendado hoje; cada passo dobra o tempo de conferir uma
 * senha — o que atrasa quem tenta quebrar o hash em massa, não quem faz login.
 *
 * Aumentar isto não invalida senha nenhuma: o hash do bcrypt carrega o próprio
 * custo dentro dele, então `compare` continua conferindo corretamente as
 * senhas antigas gravadas com custo 10. Elas sobem para 12 sozinhas na próxima
 * vez que a pessoa trocar a senha.
 */
const BCRYPT_COST = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Hash descartável, de um valor aleatório que ninguém conhece.
 *
 * Serve só para gastar tempo: ver `burnPasswordComparison` abaixo.
 */
const DUMMY_HASH = "$2b$12$aJ3R7oZVmExdDzSUmHzqnuZPVp9Dv.WvOoVttvtFK3tuQbj2a9qfu";

/**
 * Gasta o mesmo tempo de uma conferência de senha, sem conferir nada.
 *
 * Primeira metade da defesa contra vazamento por tempo de resposta: quando o
 * e-mail não tem conta, o bcrypt nunca era chamado, então a resposta voltava em
 * poucos milissegundos em vez de algumas centenas. As duas respostas dizem a
 * mesma frase ("E-mail ou senha incorretos"), mas o relógio dizia qual era qual
 * — dava para descobrir quais endereços têm conta só medindo a demora.
 */
export async function burnPasswordComparison(password: string): Promise<void> {
  await bcrypt.compare(password, DUMMY_HASH);
}

/**
 * Piso de tempo de resposta do login.
 *
 * Segunda metade da defesa, e a que realmente resolve. Só igualar a chamada do
 * bcrypt não bastou, e a verificação mostrou isso na prática: o hash
 * descartável é de custo 12 (~230 ms), mas as contas criadas antes da mudança
 * têm hash de custo 10 (~60 ms), então o e-mail inexistente passou a ser o
 * *mais lento* dos dois — o vazamento apenas trocou de direção. E não existe um
 * custo único que sirva, porque o banco vai conviver com os dois por tempo
 * indeterminado: um hash só sobe de custo quando a pessoa troca a senha.
 *
 * Com um piso fixo acima da conferência mais lenta, todas as respostas levam o
 * mesmo tempo e o custo do hash deixa de importar.
 *
 * 500 ms é imperceptível num login (a latência de rede já costuma passar disso)
 * e ainda atrasa um pouco quem tenta adivinhar em série. Configurável porque o
 * limite real é a CPU de onde o app estiver hospedado, não desta máquina.
 */
const LOGIN_FLOOR_MS = Number(process.env.LOGIN_MIN_RESPONSE_MS || 500);

/**
 * Espera até o piso ser atingido. Se a requisição já demorou mais que isso,
 * volta na hora.
 *
 * Resíduo honesto: num servidor lento o suficiente para o bcrypt de custo 12
 * passar de 500 ms, as contas de custo 10 continuariam mais rápidas e a
 * diferença voltaria. Nesse caso é só subir LOGIN_MIN_RESPONSE_MS.
 */
export async function padToFloor(startedAt: number): Promise<void> {
  const restante = LOGIN_FLOOR_MS - (Date.now() - startedAt);
  if (restante > 0) {
    await new Promise((resolve) => setTimeout(resolve, restante));
  }
}

export function createToken(user: AuthUser): string {
  return jwt.sign({ userId: user.id, email: user.email }, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): TokenPayload | null {
  // The secret is resolved outside the try/catch on purpose: a misconfigured
  // server must surface as a loud 500, not get swallowed into the "invalid
  // token" path and look like every user's session simply expired.
  const secret = getJwtSecret();

  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAuthUser(
  authHeader?: string | null
): Promise<AuthUser | null> {
  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const db = getDb();
  const user = db
    .prepare("SELECT id, name, email FROM users WHERE id = ?")
    .get(payload.userId) as Omit<AuthUser, "isAdmin"> | undefined;

  if (!user) return null;

  return { ...user, isAdmin: isAdminEmail(user.email) };
}

export function getUserByEmail(email: string): User | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.toLowerCase().trim()) as User | undefined;
}

export function createUser(
  name: string,
  email: string,
  passwordHash: string
): AuthUser {
  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)"
    )
    .run(name.trim(), email.toLowerCase().trim(), passwordHash);

  const normalizedEmail = email.toLowerCase().trim();

  return {
    id: Number(result.lastInsertRowid),
    name: name.trim(),
    email: normalizedEmail,
    isAdmin: isAdminEmail(normalizedEmail),
  };
}
