import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { corsOptions, jsonResponse } from "@/lib/cors";
import { getDb, Transaction } from "@/lib/db";

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
  const transactions = db
    .prepare(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC"
    )
    .all(user.id) as Transaction[];

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return jsonResponse(request, {
    transactions,
    summary: {
      totalIncome,
      totalExpense,
      balance,
    },
  });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const user = await getAuthUser(authHeader);

  if (!user) {
    return jsonResponse(request, { error: "Não autenticado." }, 401);
  }

  try {
    const body = await request.json();
    const { type, amount, description, date } = body;

    if (!type || !amount || !date) {
      return jsonResponse(
        request,
        { error: "Tipo, valor e data são obrigatórios." },
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

    const db = getDb();
    const result = db
      .prepare(
        "INSERT INTO transactions (user_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?)"
      )
      .run(
        user.id,
        type,
        parsedAmount,
        description?.trim() || "",
        date
      );

    const transaction = db
      .prepare("SELECT * FROM transactions WHERE id = ?")
      .get(result.lastInsertRowid) as Transaction;

    return jsonResponse(request, { transaction }, 201);
  } catch {
    return jsonResponse(request, { error: "Erro interno do servidor." }, 500);
  }
}

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const user = await getAuthUser(authHeader);

  if (!user) {
    return jsonResponse(request, { error: "Não autenticado." }, 401);
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return jsonResponse(request, { error: "ID é obrigatório." }, 400);
  }

  const db = getDb();
  const result = db
    .prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?")
    .run(Number(id), user.id);

  if (result.changes === 0) {
    return jsonResponse(request, { error: "Transação não encontrada." }, 404);
  }

  return jsonResponse(request, { message: "Transação removida." });
}
