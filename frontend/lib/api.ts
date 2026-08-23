const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
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

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro na requisição.");
  }

  return data;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ user: User; token: string; message: string }> {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<{ user: User; token: string; message: string }> {
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

export async function getMe(): Promise<{ user: User }> {
  return apiFetch("/api/auth/me");
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

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
