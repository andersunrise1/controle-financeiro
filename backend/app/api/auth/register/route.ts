import { NextRequest } from "next/server";
import {
  createToken,
  createUser,
  getUserByEmail,
  hashPassword,
  setAuthCookie,
  verifyPassword,
} from "@/lib/auth";
import { corsOptions, jsonResponse } from "@/lib/cors";
import { isValidEmail, isValidName, isValidPassword } from "@/lib/validators";

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return jsonResponse(
        request,
        { error: "Nome, e-mail e senha são obrigatórios." },
        400
      );
    }

    if (!isValidName(name)) {
      return jsonResponse(
        request,
        { error: "Nome deve ter pelo menos 2 caracteres." },
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

    const existing = getUserByEmail(email);
    if (existing) {
      return jsonResponse(
        request,
        { error: "Este e-mail já está cadastrado." },
        409
      );
    }

    const passwordHash = await hashPassword(password);
    const user = createUser(name, email, passwordHash);
    const token = createToken(user);

    await setAuthCookie(token);

    return jsonResponse(request, {
      message: "Cadastro realizado com sucesso!",
      user,
      token,
    });
  } catch {
    return jsonResponse(request, { error: "Erro interno do servidor." }, 500);
  }
}
