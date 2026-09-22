import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { corsOptions, jsonResponse } from "@/lib/cors";
import { getDb, FeedbackWithUser } from "@/lib/db";
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

  if (!user.isAdmin) {
    return jsonResponse(request, { error: "Acesso restrito ao admin." }, 403);
  }

  const db = getDb();
  const feedback = db
    .prepare(
      `SELECT feedback.*, users.name AS user_name, users.email AS user_email
       FROM feedback
       JOIN users ON users.id = feedback.user_id
       ORDER BY feedback.resolved ASC, feedback.created_at DESC`
    )
    .all() as FeedbackWithUser[];

  return jsonResponse(request, { feedback });
}

export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const user = await getAuthUser(authHeader);

  if (!user) {
    return jsonResponse(request, { error: "Não autenticado." }, 401);
  }

  if (!user.isAdmin) {
    return jsonResponse(request, { error: "Acesso restrito ao admin." }, 403);
  }

  try {
    const body = await request.json();
    const { id, resolved } = body;

    if (id === undefined || resolved === undefined) {
      return jsonResponse(
        request,
        { error: "ID e status são obrigatórios." },
        400
      );
    }

    const db = getDb();
    const result = db
      .prepare("UPDATE feedback SET resolved = ? WHERE id = ?")
      .run(resolved ? 1 : 0, Number(id));

    if (result.changes === 0) {
      return jsonResponse(request, { error: "Feedback não encontrado." }, 404);
    }

    return jsonResponse(request, { message: "Feedback atualizado." });
  } catch (error) {
    logError("admin/feedback", error);
    return jsonResponse(request, { error: "Erro interno do servidor." }, 500);
  }
}
