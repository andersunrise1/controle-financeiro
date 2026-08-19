import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { corsOptions, jsonResponse } from "@/lib/cors";
import { getDb, RecurringTransaction } from "@/lib/db";
import { DEFAULT_CATEGORY, isValidCategory } from "@/lib/categories";
import { generateDueTransactions, isValidFrequency } from "@/lib/recurrence";

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const user = await getAuthUser(authHeader);

  if (!user) {
    return jsonResponse(request, { error: "Não autenticado." }, 401);
  }

  const db = getDb();
  const recurring = db
    .prepare(
      "SELECT * FROM recurring_transactions WHERE user_id = ? ORDER BY active DESC, created_at DESC"
    )
    .all(user.id) as RecurringTransaction[];

  return jsonResponse(request, { recurring });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const user = await getAuthUser(authHeader);

  if (!user) {
    return jsonResponse(request, { error: "Não autenticado." }, 401);
  }

  try {
    const body = await request.json();
    const { type, amount, description, date, category, frequency } = body;

    if (!type || !amount || !date || !frequency) {
      return jsonResponse(
        request,
        { error: "Tipo, valor, data e frequência são obrigatórios." },
        400
      );
    }

    if (type !== "income" && type !== "expense") {
      return jsonResponse(
        request,
        { error: "Tipo deve ser 'income' ou 'expense'." },
        400
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return jsonResponse(
        request,
        { error: "Informe um valor válido maior que zero." },
        400
      );
    }

    if (category !== undefined && !isValidCategory(category)) {
      return jsonResponse(request, { error: "Categoria inválida." }, 400);
    }

    if (!isValidFrequency(frequency)) {
      return jsonResponse(request, { error: "Frequência inválida." }, 400);
    }

    const db = getDb();
    const result = db
      .prepare(
        "INSERT INTO recurring_transactions (user_id, type, amount, description, category, frequency, next_run_date) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        user.id,
        type,
        parsedAmount,
        description?.trim() || "",
        category || DEFAULT_CATEGORY,
        frequency,
        date
      );

    // Materializes the first occurrence right away if its date is today or
    // already past, instead of waiting for the next dashboard load.
    generateDueTransactions(user.id);

    const recurring = db
      .prepare("SELECT * FROM recurring_transactions WHERE id = ?")
      .get(result.lastInsertRowid) as RecurringTransaction;

    return jsonResponse(request, { recurring }, 201);
  } catch {
    return jsonResponse(request, { error: "Erro interno do servidor." }, 500);
  }
}

export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const user = await getAuthUser(authHeader);

  if (!user) {
    return jsonResponse(request, { error: "Não autenticado." }, 401);
  }

  try {
    const body = await request.json();
    const { id, active } = body;

    if (id === undefined || active === undefined) {
      return jsonResponse(
        request,
        { error: "ID e status são obrigatórios." },
        400
      );
    }

    const db = getDb();
    const result = db
      .prepare(
        "UPDATE recurring_transactions SET active = ? WHERE id = ? AND user_id = ?"
      )
      .run(active ? 1 : 0, Number(id), user.id);

    if (result.changes === 0) {
      return jsonResponse(request, { error: "Recorrência não encontrada." }, 404);
    }

    return jsonResponse(request, { message: "Recorrência atualizada." });
  } catch {
    return jsonResponse(request, { error: "Erro interno do servidor." }, 500);
  }
}
