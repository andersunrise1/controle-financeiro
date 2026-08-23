import AsyncStorage from "@react-native-async-storage/async-storage";

// Mirrors frontend/lib/api.ts's contract exactly (same endpoints, same shapes)
// so the mobile app talks to the same backend the same way the web app does.
// On a real device "localhost" means the phone itself, not the dev machine —
// override with EXPO_PUBLIC_API_URL (e.g. http://192.168.x.x:3001) when
// testing on real hardware instead of the browser-based preview.
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

const TOKEN_KEY = "auth_token";

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(path, options = {}) {
  const token = await getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro na requisição.");
  }

  return data;
}

export async function register(name, email, password) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(email, password) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } finally {
    await clearToken();
  }
}

export async function getMe() {
  return apiFetch("/api/auth/me");
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(password) {
  return password.length >= 6;
}

export async function getTransactions() {
  return apiFetch("/api/transactions");
}

export async function createTransaction(data) {
  return apiFetch("/api/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteTransaction(id) {
  await apiFetch(`/api/transactions?id=${id}`, { method: "DELETE" });
}

export async function updateTransaction(id, data) {
  return apiFetch(`/api/transactions?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function createRecurringTransaction(data) {
  return apiFetch("/api/recurring", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getRecurringTransactions() {
  return apiFetch("/api/recurring");
}

export async function setRecurringActive(id, active) {
  await apiFetch("/api/recurring", {
    method: "PATCH",
    body: JSON.stringify({ id, active }),
  });
}

export async function submitFeedback(data) {
  return apiFetch("/api/feedback", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAdminFeedback() {
  return apiFetch("/api/admin/feedback");
}

export async function setFeedbackResolved(id, resolved) {
  await apiFetch("/api/admin/feedback", {
    method: "PATCH",
    body: JSON.stringify({ id, resolved }),
  });
}
