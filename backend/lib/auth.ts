import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getDb, User } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
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

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(user: AuthUser): string {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
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
