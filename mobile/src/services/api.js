import AsyncStorage from "@react-native-async-storage/async-storage";

// Mirrors frontend/lib/api.ts's contract exactly (same endpoints, same shapes)
// so the mobile app talks to the same backend the same way the web app does.
// On a real device "localhost" means the phone itself, not the dev machine —
// override with EXPO_PUBLIC_API_URL (e.g. http://192.168.x.x:3001) when
// testing on real hardware instead of the browser-based preview.
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

// The last known user, kept so opening the app without a connection shows
// the account instead of bouncing to the login screen. It's only an identity
// cache — every actual request still goes to the server and still needs a
// valid token.
export async function getCachedUser() {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCachedUser(user) {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // A failed cache write is not worth failing a login over.
  }
}

// Errors carry a `status` so callers can tell "your session expired" (401,
// log out) apart from "the server is unreachable" (status 0, keep the
// session and let the user retry). Without it every failure looked the same
// and a subway tunnel logged people out.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  get isNetworkError() {
    return this.status === 0;
  }
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

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    // fetch only rejects when the request never reached the server.
    throw new ApiError("Sem conexão com o servidor. Verifique sua internet.", 0);
  }

  // Not every response is JSON: a platform-level 502/503 (Railway restarting,
  // a cold start) returns an HTML error page, and response.json() on that
  // used to throw a raw "Unexpected token '<'" straight into the user's face.
  const raw = await response.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      data?.error ||
        (response.status >= 500
          ? "O servidor está indisponível no momento. Tente novamente em instantes."
          : "Erro na requisição."),
      response.status
    );
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

// Irreversible: removes the account and every transaction, recurrence and
// feedback attached to it. The password is re-checked server-side. Clears
// the local session only on success — a wrong password must leave the user
// exactly where they were.
export async function deleteAccount(password) {
  const result = await apiFetch("/api/auth/me", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
  await clearToken();
  return result;
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
