import { NextRequest } from "next/server";
import {
  createToken,
  getUserByEmail,
  setAuthCookie,
  verifyPassword,
} from "@/lib/auth";
import { corsOptions, jsonResponse } from "@/lib/cors";
import { isValidEmail, isValidPassword } from "@/lib/validators";

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function POST(request: NextRequest) {
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

    if (!isValidPassword(password)) {
      return jsonResponse(
        request,
        { error: "A senha deve ter no mínimo 6 caracteres." },
        400
      );
    }

    const user = getUserByEmail(email);
    if (!user) {
      return jsonResponse(
        request,
        { error: "E-mail ou senha incorretos." },
        401
      );
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return jsonResponse(
        request,
        { error: "E-mail ou senha incorretos." },
        401
      );
    }

    const authUser = { id: user.id, name: user.name, email: user.email };
    const token = createToken(authUser);

    await setAuthCookie(token);

    return jsonResponse(request, {
      message: "Login realizado com sucesso!",
      user: authUser,
      token,
    });
  } catch {
    return jsonResponse(request, { error: "Erro interno do servidor." }, 500);
  }
}
