import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { corsOptions, jsonResponse } from "@/lib/cors";

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
