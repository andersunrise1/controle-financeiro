import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { corsOptions, jsonResponse } from "@/lib/cors";
import { getDb, Feedback } from "@/lib/db";
import { isValidFeedbackCategory } from "@/lib/feedback";
import { logError } from "@/lib/logger";

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const user = await getAuthUser(authHeader);

  if (!user) {
    return jsonResponse(request, { error: "Não autenticado." }, 401);
  }

  try {
    const body = await request.json();
    const { category, message } = body;

    if (!category || !message) {
      return jsonResponse(
        request,
        { error: "Categoria e mensagem são obrigatórias." },
        400
      );
    }

    if (!isValidFeedbackCategory(category)) {
      return jsonResponse(request, { error: "Categoria inválida." }, 400);
    }

    const trimmedMessage = String(message).trim();
    if (trimmedMessage.length < 5) {
      return jsonResponse(
        request,
        { error: "Descreva o feedback com pelo menos 5 caracteres." },
        400
      );
    }

    const db = getDb();
    const result = db
      .prepare(
        "INSERT INTO feedback (user_id, category, message) VALUES (?, ?, ?)"
      )
      .run(user.id, category, trimmedMessage);

    const feedback = db
      .prepare("SELECT * FROM feedback WHERE id = ?")
      .get(result.lastInsertRowid) as Feedback;

    return jsonResponse(request, { feedback }, 201);
  } catch (error) {
    logError("feedback", error);
    return jsonResponse(request, { error: "Erro interno do servidor." }, 500);
  }
}
