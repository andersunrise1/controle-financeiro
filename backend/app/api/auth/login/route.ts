import { NextRequest } from "next/server";
import {
  burnPasswordComparison,
  createToken,
  getUserByEmail,
  isAdminEmail,
  padToFloor,
  setAuthCookie,
  verifyPassword,
} from "@/lib/auth";
import { corsOptions, jsonResponse } from "@/lib/cors";
import { getAccessStatus } from "@/lib/access";
import { isValidEmail } from "@/lib/validators";
import {
  checkLoginThrottle,
  clearLoginAttempts,
  getClientIp,
  pruneOldLoginAttempts,
  recordFailedLogin,
} from "@/lib/loginThrottle";
import { logError, logInfo } from "@/lib/logger";

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function POST(request: NextRequest) {
  // Toda resposta desta rota leva o mesmo tempo, medido daqui — ver padToFloor.
  // Sem isso, a demora denuncia se o e-mail tem conta, mesmo com as duas
  // respostas dizendo exatamente a mesma frase.
  const inicio = Date.now();

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return jsonResponse(
        request,
        { error: "E-mail e senha são obrigatórios." },
        400
      );
    }

    if (!isValidEmail(email)) {
      return jsonResponse(
        request,
        { error: "Informe um e-mail válido." },
        400
      );
    }

    // Aqui só se confere que a senha foi preenchida, de propósito.
    //
    // O cadastro exige 8 caracteres, mas o login não pode aplicar a regra de
    // hoje a uma conta criada quando o mínimo era 6: isso trancaria fora do
    // app, sem aviso e sem culpa, exatamente quem já é cliente.
    if (typeof password !== "string" || password.length === 0) {
      return jsonResponse(request, { error: "Informe sua senha." }, 400);
    }

    const ip = getClientIp(request);
    const throttle = checkLoginThrottle(email, ip);
    if (throttle.blocked) {
      logInfo("auth/login", `bloqueado por excesso de tentativas: ${ip ?? "ip desconhecido"}`);
      await padToFloor(inicio);
      return jsonResponse(
        request,
        {
          error: `Muitas tentativas de login. Tente novamente em ${throttle.retryAfterMinutes} minutos ou redefina sua senha.`,
        },
        429
      );
    }

    const user = getUserByEmail(email);

    if (!user) {
      // Gasta o tempo de uma conferência de senha mesmo sem ter o que
      // conferir — ver burnPasswordComparison. Sem isso, a rapidez da resposta
      // revelaria que este e-mail não tem conta.
      await burnPasswordComparison(password);
      recordFailedLogin(email, ip);
      pruneOldLoginAttempts();
      await padToFloor(inicio);
      return jsonResponse(
        request,
        { error: "E-mail ou senha incorretos." },
        401
      );
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      recordFailedLogin(email, ip);
      pruneOldLoginAttempts();
      await padToFloor(inicio);
      return jsonResponse(
        request,
        { error: "E-mail ou senha incorretos." },
        401
      );
    }

    clearLoginAttempts(email);

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: isAdminEmail(user.email),
    };
    const token = createToken(authUser);

    await setAuthCookie(token);

    await padToFloor(inicio);

    return jsonResponse(request, {
      message: "Login realizado com sucesso!",
      user: authUser,
      token,
      access: getAccessStatus(authUser.id),
    });
  } catch (error) {
    logError("auth/login", error);
    return jsonResponse(request, { error: "Erro interno do servidor." }, 500);
  }
}
