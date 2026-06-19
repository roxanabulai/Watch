import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/security";

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 100);
  if (limited) return limited;
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const where: Prisma.AuctionWhereInput = {
    status: { in: ["APPROVED", "LIVE"] },
    ...(category ? { category } : {}),
    ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { brand: { contains: q, mode: "insensitive" } }, { model: { contains: q, mode: "insensitive" } }] } : {})
  };
  const auctions = await prisma.auction.findMany({
    where,
    orderBy: { endsAt: "asc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    take: 50
  });
  return NextResponse.json({ auctions });
}
