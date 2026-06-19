import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, validateCsrf } from "@/lib/security";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, 60);
  if (limited) return limited;
  const csrf = validateCsrf(request);
  if (csrf) return csrf;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.watchlist.findUnique({ where: { userId_auctionId: { userId: user.id, auctionId: id } } });
  if (existing) {
    await prisma.watchlist.delete({ where: { id: existing.id } });
    return NextResponse.json({ message: "Removed from watchlist" });
  }
  await prisma.watchlist.create({ data: { userId: user.id, auctionId: id } });
  return NextResponse.json({ message: "Added to watchlist" });
}
