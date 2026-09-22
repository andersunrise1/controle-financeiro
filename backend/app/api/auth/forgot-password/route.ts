import { NextRequest } from "next/server";
import { getUserByEmail } from "@/lib/auth";
import { corsOptions, jsonResponse } from "@/lib/cors";
import { isValidEmail } from "@/lib/validators";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { createResetCode, isRateLimited, RESET_CONFIG } from "@/lib/passwordReset";
import { logError } from "@/lib/logger";

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")[0]
  .trim();

function buildEmail(name: string, code: string) {
  const link = `${FRONTEND_URL}/redefinir-senha?code=${code}`;
  const minutes = RESET_CONFIG.CODE_TTL_MINUTES;

  const text = [
    `Olá, ${name}.`,
    "",
    `Seu código para redefinir a senha do DIVISA é: ${code}`,
    "",
    `O código vale por ${minutes} minutos e só pode ser usado uma vez.`,
    "",
    `No site, você também pode abrir direto: ${link}`,
    "",
    "Se não foi você que pediu, ignore este e-mail — sua senha continua a mesma.",
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#211f1c">
      <p style="font-size:15px">Olá, <strong>${name}</strong>.</p>
      <p style="font-size:15px">Use o código abaixo para redefinir a senha do DIVISA:</p>
      <p style="font-size:34px;font-weight:700;letter-spacing:8px;text-align:center;margin:28px 0;padding:16px;background:#faf7f2;border-radius:12px">${code}</p>
      <p style="font-size:14px;color:#4b473f">O código vale por ${minutes} minutos e só pode ser usado uma vez.</p>
      <p style="font-size:14px"><a href="${link}" style="color:#2ecc0f;font-weight:600">Abrir a página de redefinição</a></p>
      <hr style="border:none;border-top:1px solid #d9d2c5;margin:24px 0">
      <p style="font-size:13px;color:#756f63">Se não foi você que pediu, ignore este e-mail — sua senha continua a mesma.</p>
    </div>
  `;

  return { text, html };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return jsonResponse(request, { error: "Informe um e-mail válido." }, 400);
    }

    if (!isEmailConfigured()) {
      return jsonResponse(
        request,
        {
          error:
            "O envio de e-mail não está configurado neste servidor. Entre em contato com o suporte.",
        },
        503
      );
    }

    const user = getUserByEmail(email);

    // Deliberately the same answer whether or not the address has an
    // account: anything else turns this endpoint into a way to find out who
    // is registered. The rate-limit case answers identically for the same
    // reason — it is invisible to someone probing addresses.
    if (user && !isRateLimited(user.id)) {
      const code = createResetCode(user.id);
      const { text, html } = buildEmail(user.name, code);
      await sendEmail({
        to: user.email,
        subject: "DIVISA — código para redefinir sua senha",
        text,
        html,
      });
    }

    return jsonResponse(request, {
      message:
        "Se existir uma conta com esse e-mail, enviamos um código para redefinir a senha.",
    });
  } catch (error) {
    logError("auth/forgot-password", error);
    return jsonResponse(request, { error: "Erro interno do servidor." }, 500);
  }
}
