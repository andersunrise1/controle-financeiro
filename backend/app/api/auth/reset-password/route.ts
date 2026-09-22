import { NextRequest } from "next/server";
import { getUserByEmail, hashPassword } from "@/lib/auth";
import { corsOptions, jsonResponse } from "@/lib/cors";
import { getDb } from "@/lib/db";
import { isValidEmail, isValidPassword } from "@/lib/validators";
import { consumeResetCode, verifyResetCode } from "@/lib/passwordReset";
import { logError } from "@/lib/logger";

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

// One message for every way the code can be rejected. Saying "expired"
// versus "wrong" versus "no such account" would tell someone probing the
// endpoint which addresses are registered and which codes are live.
const REJECTED = "Código inválido ou expirado. Peça um novo código.";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, code, password } = body;

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return jsonResponse(request, { error: "Informe um e-mail válido." }, 400);
    }

    if (!code || typeof code !== "string") {
      return jsonResponse(request, { error: "Informe o código recebido." }, 400);
    }

    if (typeof password !== "string" || !isValidPassword(password)) {
      return jsonResponse(
        request,
        { error: "A senha deve ter no mínimo 6 caracteres." },
        400
      );
    }

    const user = getUserByEmail(email);
    if (!user) {
      return jsonResponse(request, { error: REJECTED }, 400);
    }

    const result = verifyResetCode(user.id, code.trim());
    if (!result.ok) {
      return jsonResponse(
        request,
        {
          error:
            result.reason === "too_many_attempts"
              ? "Muitas tentativas. Peça um novo código."
              : REJECTED,
        },
        400
      );
    }

    const passwordHash = await hashPassword(password);

    const db = getDb();
    // One transaction so a crash between the two writes can't leave the
    // password changed with the code still usable, or vice versa.
    db.transaction(() => {
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
        passwordHash,
        user.id
      );
      consumeResetCode(result.resetId);
    })();

    return jsonResponse(request, {
      message: "Senha redefinida. Faça login com a nova senha.",
    });
  } catch (error) {
    logError("auth/reset-password", error);
    return jsonResponse(request, { error: "Erro interno do servidor." }, 500);
  }
}
