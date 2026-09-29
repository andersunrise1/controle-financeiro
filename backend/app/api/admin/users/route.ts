import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { corsOptions, jsonResponse } from "@/lib/cors";
import { getDb } from "@/lib/db";
import {
  grantComplimentaryAccess,
  revokeLifetimeAccess,
  TRIAL_DAYS,
} from "@/lib/access";
import { logError, logInfo } from "@/lib/logger";

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  plan: string;
  created_at: string;
  paid_at: string | null;
  dias_restantes: number;
}

/** Lista para a tela de admin: quem é quem e quanto tempo de teste resta. */
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request.headers.get("authorization"));

  if (!user) return jsonResponse(request, { error: "Não autenticado." }, 401);
  if (!user.isAdmin) return jsonResponse(request, { error: "Acesso negado." }, 403);

  try {
    const users = getDb()
      .prepare(
        `SELECT id, name, email, plan, created_at, paid_at,
                MAX(0, CAST(
                  ceil(julianday(datetime(created_at, '+' || ? || ' days')) - julianday('now'))
                  AS INTEGER
                )) AS dias_restantes
           FROM users
          ORDER BY created_at DESC`
      )
      .all(TRIAL_DAYS) as AdminUserRow[];

    return jsonResponse(request, { users });
  } catch (error) {
    logError("admin/users", error);
    return jsonResponse(request, { error: "Erro interno do servidor." }, 500);
  }
}

/**
 * Concede ou revoga acesso vitalício à mão.
 *
 * Existe para os parceiros de divulgação: criadores que vão falar do app
 * ganham acesso permanente em troca, e isso precisa ser dado por alguém, já
 * que não passa por pagamento.
 */
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request.headers.get("authorization"));

  if (!user) return jsonResponse(request, { error: "Não autenticado." }, 401);
  if (!user.isAdmin) return jsonResponse(request, { error: "Acesso negado." }, 403);

  try {
    const { id, lifetime } = await request.json().catch(() => ({}));

    if (id === undefined || typeof lifetime !== "boolean") {
      return jsonResponse(request, { error: "ID e status são obrigatórios." }, 400);
    }

    const alvo = Number(id);
    const existe = getDb().prepare("SELECT 1 FROM users WHERE id = ?").get(alvo);
    if (!existe) {
      return jsonResponse(request, { error: "Usuário não encontrado." }, 404);
    }

    // Revogar um acesso que foi pago apagaria algo que a pessoa comprou.
    // A tela de admin existe para conceder a parceiros e corrigir engano, não
    // para desfazer compras — quem pagou tem paid_at preenchido.
    const linha = getDb()
      .prepare("SELECT paid_at FROM users WHERE id = ?")
      .get(alvo) as { paid_at: string | null };

    if (!lifetime && linha.paid_at) {
      return jsonResponse(
        request,
        { error: "Esta conta tem uma compra registrada e não pode ser revogada por aqui." },
        409
      );
    }

    // Concessão de cortesia, não compra: não preenche paid_at, e é por isso
    // que ela pode ser desfeita depois — ver grantComplimentaryAccess.
    if (lifetime) grantComplimentaryAccess(alvo);
    else revokeLifetimeAccess(alvo);

    logInfo("admin/users", `usuário ${alvo} -> ${lifetime ? "vitalício" : "teste"} (por ${user.email})`);
    return jsonResponse(request, { message: "Acesso atualizado." });
  } catch (error) {
    logError("admin/users", error);
    return jsonResponse(request, { error: "Erro interno do servidor." }, 500);
  }
}
