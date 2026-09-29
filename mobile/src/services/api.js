import AsyncStorage from "@react-native-async-storage/async-storage";

// Mirrors frontend/lib/api.ts's contract exactly (same endpoints, same shapes)
// so the mobile app talks to the same backend the same way the web app does.
// On a real device "localhost" means the phone itself, not the dev machine —
// override with EXPO_PUBLIC_API_URL (e.g. http://192.168.x.x:3001) when
// testing on real hardware instead of the browser-based preview.
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const ACCESS_KEY = "auth_access";

/**
 * O token de sessão fica no cofre do aparelho, não no armazenamento comum.
 *
 * `SecureStore` usa o Keychain no iOS e o Keystore no Android: a chave é
 * guardada cifrada pelo sistema e amarrada ao app. O `AsyncStorage`, onde o
 * token ficava antes, é um arquivo em texto puro dentro da pasta do aplicativo
 * — inacessível num aparelho comum, mas lido sem esforço num aparelho com root
 * ou por um backup do sistema de arquivos. O token vale 7 dias e não pode ser
 * revogado, então quem o copia entra na conta e vê todas as finanças da pessoa.
 *
 * Os outros dois valores (nome/e-mail em cache e o estado do teste) continuam
 * no AsyncStorage de propósito: não abrem acesso a nada, e o SecureStore tem
 * limite de tamanho por entrada além de ser bem mais lento.
 */
async function getSecureStore() {
  // Importado sob demanda porque no alvo web do Expo (usado para verificar o
  // app no navegador) o módulo nativo não existe.
  const SecureStore = await import("expo-secure-store");
  return SecureStore.isAvailableAsync ? SecureStore : null;
}

export async function getToken() {
  try {
    const store = await getSecureStore();
    if (store && (await store.isAvailableAsync())) {
      const token = await store.getItemAsync(TOKEN_KEY);
      if (token) return token;
      // Sessão criada antes desta mudança: ainda está no armazenamento antigo.
      // Migra na primeira leitura em vez de exigir que a pessoa entre de novo.
      const legado = await AsyncStorage.getItem(TOKEN_KEY);
      if (legado) {
        await store.setItemAsync(TOKEN_KEY, legado);
        await AsyncStorage.removeItem(TOKEN_KEY);
        return legado;
      }
      return null;
    }
  } catch {
    // Sem cofre disponível (web, ou aparelho que recusa o Keystore) o app não
    // pode simplesmente deixar de funcionar — cai no armazenamento comum.
  }
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token) {
  try {
    const store = await getSecureStore();
    if (store && (await store.isAvailableAsync())) {
      await store.setItemAsync(TOKEN_KEY, token);
      // Garante que uma cópia antiga não fique para trás no lugar inseguro.
      await AsyncStorage.removeItem(TOKEN_KEY);
      return;
    }
  } catch {
    // mesmo raciocínio do getToken
  }
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  try {
    const store = await getSecureStore();
    if (store && (await store.isAvailableAsync())) {
      await store.deleteItemAsync(TOKEN_KEY);
    }
  } catch {
    // Se o cofre falhar, o AsyncStorage abaixo ainda é limpo.
  }
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, ACCESS_KEY]);
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

// O estado do teste, guardado pelo mesmo motivo que o usuário: abrir o app sem
// sinal não deve esconder o aviso de que o teste está acabando. Quem manda de
// verdade é o servidor — ele recusa a escrita (402) independente do que esteja
// guardado aqui, então isto só afeta o que a tela mostra.
export async function getCachedAccess() {
  try {
    const raw = await AsyncStorage.getItem(ACCESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCachedAccess(access) {
  try {
    if (!access) return;
    await AsyncStorage.setItem(ACCESS_KEY, JSON.stringify(access));
  } catch {
    // Igual ao cache do usuário: falhar aqui não pode derrubar o login.
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

// Quem for avisado quando o servidor recusar uma escrita por teste vencido.
// O AuthContext registra o próprio refreshUser aqui; ficar como callback (e não
// um import) evita que a camada de rede dependa do React.
let onPaymentRequired = null;

export function setPaymentRequiredHandler(handler) {
  onPaymentRequired = handler;
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
    // 402 é o servidor dizendo que o teste venceu. Avisar aqui, num lugar só,
    // faz o aviso aparecer em qualquer tela: alguém que deixou o app aberto
    // até passar da meia-noite veria só um erro de salvar, sem explicação,
    // porque o estado carregado na abertura ainda diz que o teste está válido.
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

// Answers the same way whether or not the address has an account, so the
// UI must not phrase the result as "we sent you an email" either.
export async function forgotPassword(email) {
  return apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(email, code, password) {
  return apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, code, password }),
  });
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

// Só para criar ou trocar senha — ver o comentário em
// backend/lib/validators.ts. A tela de login não usa isto.
export function isValidPassword(password) {
  return password.length >= 8;
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
