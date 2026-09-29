import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getUserByEmail, verifyPassword } from "@/lib/auth";
import { corsOptions, jsonResponse, withCors } from "@/lib/cors";
import { createConsistentBackup, discardBackupFile } from "@/lib/backup";
import {
  checkLoginThrottle,
  clearLoginAttempts,
  getClientIp,
  recordFailedLogin,
} from "@/lib/loginThrottle";
import { logError, logInfo } from "@/lib/logger";

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

/**
 * Baixa uma cópia íntegra do banco inteiro.
 *
 * Existe por causa de uma limitação declarada do backup do Railway: os
 * snapshots vivem dentro do mesmo projeto, e a própria documentação avisa que
 * apagar o volume apaga os backups junto. Ou seja, eles cobrem "estraguei os
 * dados" mas não cobrem "perdi o projeto". Esta rota é o segundo lugar.
 *
 * **É a rota mais perigosa do sistema** e foi escrita com isso em mente: o
 * arquivo devolvido contém as finanças de todo mundo e os hashes de senha de
 * todas as contas. Por isso ela exige, cumulativamente:
 *
 * - sessão válida;
 * - ser o admin;
 * - **a senha digitada de novo**, como na exclusão de conta — assim um token
 *   roubado, sozinho, não tira o banco inteiro de dentro do servidor;
 * - POST, não GET, para não virar um link que basta abrir (e para não deixar
 *   rastro em histórico de navegador ou log de proxy);
 * - o mesmo limite de tentativas do login, para que a senha não possa ser
 *   adivinhada aqui contornando a porta da frente.
 *
 * Cada download é registrado no log com quem o fez.
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request.headers.get("authorization"));

  if (!user) return jsonResponse(request, { error: "Não autenticado." }, 401);
  if (!user.isAdmin) return jsonResponse(request, { error: "Acesso negado." }, 403);

  let arquivo: string | null = null;

  try {
    const { password } = await request.json().catch(() => ({}));

    if (!password || typeof password !== "string") {
      return jsonResponse(
        request,
        { error: "Informe sua senha para baixar o backup." },
        400
      );
    }

    const ip = getClientIp(request);
    const throttle = checkLoginThrottle(user.email, ip);
    if (throttle.blocked) {
      return jsonResponse(
        request,
        {
          error: `Muitas tentativas. Tente novamente em ${throttle.retryAfterMinutes} minutos.`,
        },
        429
      );
    }

    const conta = getUserByEmail(user.email);
    if (!conta) return jsonResponse(request, { error: "Conta não encontrada." }, 404);

    if (!(await verifyPassword(password, conta.password_hash))) {
      recordFailedLogin(user.email, ip);
      return jsonResponse(request, { error: "Senha incorreta." }, 401);
    }

    clearLoginAttempts(user.email);

    const { filePath, sizeBytes, counts } = await createConsistentBackup();
    arquivo = filePath;

    logInfo(
      "admin/backup",
      `backup baixado por ${user.email}: ${sizeBytes} bytes, ` +
        Object.entries(counts).map(([t, n]) => `${t}=${n}`).join(" ")
    );

    const conteudo = fs.readFileSync(filePath);
    const nome = filePath.split(/[/\\]/).pop() as string;

    return withCors(
      request,
      new NextResponse(new Uint8Array(conteudo), {
        status: 200,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${nome}"`,
          "Content-Length": String(sizeBytes),
          // Nunca guardar em cache: é o banco inteiro.
          "Cache-Control": "no-store",
          // Contagens no cabeçalho para o script conferir sem abrir o arquivo.
          "X-Backup-Counts": JSON.stringify(counts),
        },
      })
    );
  } catch (error) {
    logError("admin/backup", error);
    return jsonResponse(request, { error: "Erro interno do servidor." }, 500);
  } finally {
    // O arquivo temporário sai do disco mesmo se o envio falhar no meio.
    if (arquivo) discardBackupFile(arquivo);
  }
}
