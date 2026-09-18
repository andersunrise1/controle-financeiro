import { NextRequest, NextResponse } from "next/server";

// Accepts a comma-separated list so the same backend can serve local dev and
// the deployed frontend at once (e.g. "http://localhost:3000,https://divisa-sigma.vercel.app")
// — without it, pointing production at Vercel would break local development.
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

function corsHeaders(origin: string | null) {
  // Credentials mode forbids "*", so the exact matching origin is echoed back;
  // an unrecognized origin falls back to the first configured one, which the
  // browser then rejects for not matching — the intended block.
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function withCors(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const headers = corsHeaders(request.headers.get("origin"));
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function corsOptions(request: NextRequest): NextResponse {
  return withCors(request, new NextResponse(null, { status: 204 }));
}

export function jsonResponse(
  request: NextRequest,
  data: unknown,
  status = 200
): NextResponse {
  return withCors(
    request,
    NextResponse.json(data, { status })
  );
}
