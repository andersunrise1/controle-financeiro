import { NextRequest, NextResponse } from "next/server";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

function corsHeaders(origin: string | null) {
  const allowedOrigin = origin === FRONTEND_URL ? FRONTEND_URL : FRONTEND_URL;
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
