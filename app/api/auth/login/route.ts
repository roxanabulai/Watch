import { NextRequest, NextResponse } from "next/server";
import { authCookie, signSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJson, rateLimit, validateCsrf } from "@/lib/security";
import { loginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 20);
  if (limited) return limited;
  const csrf = validateCsrf(request);
  if (csrf) return csrf;
  const input = await parseJson(request, loginSchema);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const session = { id: user.id, email: user.email, name: user.name, role: user.role };
  const token = await signSession(session);
  const response = NextResponse.json({ user: session });
  response.cookies.set(authCookie(token));
  return response;
}

export async function GET() {
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
