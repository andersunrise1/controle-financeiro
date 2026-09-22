import { NextRequest } from "next/server";
import {
  clearAuthCookie,
  getAuthUser,
  getUserByEmail,
  verifyPassword,
} from "@/lib/auth";
import { corsOptions, jsonResponse } from "@/lib/cors";
import { deleteUserAccount } from "@/lib/account";
import { logError } from "@/lib/logger";

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const user = await getAuthUser(authHeader);

  if (!user) {
    return jsonResponse(request, { error: "Não autenticado." }, 401);
  }

  return jsonResponse(request, { user });
}

/**
 * Permanently deletes the caller's account and everything attached to it.
 *
 * The password is required again even though the caller already holds a valid
 * token: this is irreversible, and a token alone is whoever happens to be
 * holding an unlocked phone.
 */
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const user = await getAuthUser(authHeader);

  if (!user) {
    return jsonResponse(request, { error: "Não autenticado." }, 401);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (!password || typeof password !== "string") {
      return jsonResponse(
        request,
        { error: "Informe sua senha para confirmar a exclusão." },
        400
      );
    }

    const stored = getUserByEmail(user.email);
    if (!stored) {
      return jsonResponse(request, { error: "Conta não encontrada." }, 404);
    }

    const passwordOk = await verifyPassword(password, stored.password_hash);
    if (!passwordOk) {
      return jsonResponse(request, { error: "Senha incorreta." }, 401);
    }

    const removed = deleteUserAccount(user.id);

    await clearAuthCookie();

    return jsonResponse(request, {
      message: "Conta excluída.",
      removed,
    });
  } catch (error) {
    logError("auth/me DELETE", error);
    return jsonResponse(request, { error: "Erro interno do servidor." }, 500);
  }
}
