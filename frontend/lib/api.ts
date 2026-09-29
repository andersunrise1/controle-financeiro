const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export type Plan = "trial" | "lifetime";

export interface AccessStatus {
  plan: Plan;
  /** Pode gravar agora. Vencido, o app fica só para consulta. */
  active: boolean;
  /** Dias inteiros restantes do teste; null se já ativou. */
  trialDaysLeft: number | null;
  shouldWarn: boolean;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  plan: Plan;
  created_at: string;
  paid_at: string | null;
  dias_restantes: number;
}

export type FeedbackCategory = "bug" | "sugestao" | "outro";

export interface Feedback {
  id: number;
  user_id: number;
  category: FeedbackCategory;
  message: string;
  resolved: number;
  created_at: string;
}

export interface FeedbackWithUser extends Feedback {
  user_name: string;
  user_email: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
  recurring_id: number | null;
  quantity: number | null;
  unit: string | null;
}

export type RecurrenceFrequency = "weekly" | "monthly" | "yearly";

export interface RecurringTransaction {
  id: number;
  user_id: number;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  frequency: RecurrenceFrequency;
  next_run_date: string;
  active: number;
  created_at: string;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  summary: Summary;
}

const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Mirrors mobile/src/services/api.js's ApiError: callers need the status to
// tell an expired session (401 — log out) apart from an unreachable server
// (status 0 — keep the session, let the user retry).
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Quem for avisado quando o servidor recusar uma escrita por teste vencido
// (402). O AuthProvider registra o próprio refreshUser aqui; ficar como
// callback (e não um import) evita que a camada de rede dependa do React.
let onPaymentRequired: (() => void) | null = null;

export function setPaymentRequiredHandler(handler: (() => void) | null): void {
  onPaymentRequired = handler;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError("Sem conexão com o servidor. Verifique sua internet.", 0);
  }

  // A platform-level 502/503 (Railway restarting or cold-starting) answers
  // with an HTML error page, and response.json() on that used to throw a raw
  // "Unexpected token '<'" straight through to the UI.
  const raw = await response.text();
  let data: { error?: string } | null = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    // 402 é o servidor dizendo que o teste venceu. Tratar num lugar só faz o
    // aviso aparecer em qualquer página: uma aba deixada aberta até passar da
    // meia-noite mostraria apenas um erro ao salvar, sem explicação, porque o
    // estado carregado no início ainda diz que o teste está válido.
    if (response.status === 402 && onPaymentRequired) {
      onPaymentRequired();
    }

    throw new ApiError(
      data?.error ||
        (response.status >= 500
          ? "O servidor está indisponível no momento. Tente novamente em instantes."
          : "Erro na requisição."),
      response.status
    );
  }

  return data as T;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ user: User; access: AccessStatus; token: string; message: string }> {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<{ user: User; access: AccessStatus; token: string; message: string }> {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } finally {
    clearToken();
  }
}

export async function getMe(): Promise<{ user: User; access: AccessStatus }> {
  return apiFetch("/api/auth/me");
}

// Answers the same way whether or not the address has an account, so the
// UI must not phrase the result as "we sent you an email" either.
export async function forgotPassword(
  email: string
): Promise<{ message: string }> {
  return apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  email: string,
  code: string,
  password: string
): Promise<{ message: string }> {
  return apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, code, password }),
  });
}

// Irreversible: removes the account and every transaction, recurrence and
// feedback attached to it. The password is re-checked server-side. The local
// session is only cleared on success — a wrong password must leave the user
// exactly where they were.
export async function deleteAccount(
  password: string
): Promise<{ message: string }> {
  const result = await apiFetch<{ message: string }>("/api/auth/me", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
  clearToken();
  return result;
}

export async function getTransactions(): Promise<TransactionsResponse> {
  return apiFetch("/api/transactions");
}

export async function createTransaction(data: {
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
  category: string;
  quantity?: number | null;
  unit?: string | null;
}): Promise<{ transaction: Transaction }> {
  return apiFetch("/api/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTransaction(
  id: number,
  data: {
    type: "income" | "expense";
    amount: number;
    description: string;
    date: string;
    category: string;
    quantity?: number | null;
    unit?: string | null;
  }
): Promise<{ transaction: Transaction }> {
  return apiFetch(`/api/transactions?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTransaction(id: number): Promise<void> {
  await apiFetch(`/api/transactions?id=${id}`, { method: "DELETE" });
}

export async function createRecurringTransaction(data: {
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
  category: string;
  frequency: RecurrenceFrequency;
}): Promise<{ recurring: RecurringTransaction }> {
  return apiFetch("/api/recurring", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getRecurringTransactions(): Promise<{
  recurring: RecurringTransaction[];
}> {
  return apiFetch("/api/recurring");
}

export async function setRecurringActive(
  id: number,
  active: boolean
): Promise<void> {
  await apiFetch("/api/recurring", {
    method: "PATCH",
    body: JSON.stringify({ id, active }),
  });
}

export async function submitFeedback(data: {
  category: FeedbackCategory;
  message: string;
}): Promise<{ feedback: Feedback }> {
  return apiFetch("/api/feedback", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAdminFeedback(): Promise<{
  feedback: FeedbackWithUser[];
}> {
  return apiFetch("/api/admin/feedback");
}

export async function setFeedbackResolved(
  id: number,
  resolved: boolean
): Promise<void> {
  await apiFetch("/api/admin/feedback", {
    method: "PATCH",
    body: JSON.stringify({ id, resolved }),
  });
}

export async function getAdminUsers(): Promise<{ users: AdminUser[] }> {
  return apiFetch("/api/admin/users");
}

export async function setUserLifetime(
  id: number,
  lifetime: boolean
): Promise<void> {
  await apiFetch("/api/admin/users", {
    method: "PATCH",
    body: JSON.stringify({ id, lifetime }),
  });
}

export interface PaymentOffer {
  available: boolean;
  priceCents: number;
  currency: string;
  productName: string;
}

/** Preço e disponibilidade reais, lidos do servidor que vai cobrar. */
export async function getPaymentOffer(): Promise<PaymentOffer> {
  return apiFetch("/api/payment/checkout");
}

/**
 * Abre o checkout do Mercado Pago e devolve a URL para onde redirecionar.
 *
 * Existe só aqui, no site. O aplicativo Android não pode oferecer a compra
 * nem apontar para esta página — a política de pagamentos do Google exige o
 * faturamento da própria loja para conteúdo digital comprado dentro do app.
 */
export async function createCheckout(): Promise<{ url: string }> {
  return apiFetch("/api/payment/checkout", { method: "POST" });
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Só para criar ou trocar senha — ver o comentário em
// backend/lib/validators.ts. A tela de login não usa isto.
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
