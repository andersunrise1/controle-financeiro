import { NextRequest } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { corsOptions, jsonResponse } from "@/lib/cors";

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function POST(request: NextRequest) {
  await clearAuthCookie();
  return jsonResponse(request, { message: "Logout realizado com sucesso!" });
}
