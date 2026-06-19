import { NextRequest, NextResponse } from "next/server";
import { validateCsrf } from "@/lib/security";

export async function POST(request: NextRequest) {
  const csrf = validateCsrf(request);
  if (csrf) return csrf;
  const response = NextResponse.json({ ok: true });
  response.cookies.set("auction_token", "", { path: "/", maxAge: 0 });
  return response;
}
