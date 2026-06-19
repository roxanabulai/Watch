import { NextRequest, NextResponse } from "next/server";
import { authCookie, hashPassword, signSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJson, rateLimit, validateCsrf } from "@/lib/security";
import { registerSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 10);
  if (limited) return limited;
  const csrf = validateCsrf(request);
  if (csrf) return csrf;
  try {
    const input = await parseJson(request, registerSchema);
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    const user = await prisma.user.create({
      data: { email: input.email, name: input.name, passwordHash: await hashPassword(input.password) },
      select: { id: true, email: true, name: true, role: true }
    });
    const token = await signSession(user);
    const response = NextResponse.json({ user });
    response.cookies.set(authCookie(token));
    return response;
  } catch {
    return NextResponse.json({ error: "Use a valid email, a name of at least 2 characters, and a password of at least 8 characters." }, { status: 400 });
  }
}
