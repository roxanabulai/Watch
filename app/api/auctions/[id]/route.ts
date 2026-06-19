import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/security";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, 100);
  if (limited) return limited;
  const { id } = await params;
  const auction = await prisma.auction.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } }, bids: { orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } } }
  });
  if (!auction) return NextResponse.json({ error: "Auction not found" }, { status: 404 });
  return NextResponse.json({ auction });
}
