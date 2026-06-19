import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJson, rateLimit, validateCsrf } from "@/lib/security";
import { auctionSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 20);
  if (limited) return limited;
  const csrf = validateCsrf(request);
  if (csrf) return csrf;
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  try {
    const input = await parseJson(request, auctionSchema);
    const auction = await prisma.auction.create({
      data: {
        ...input,
        slug: `${slugify(input.title)}-${Date.now()}`,
        status: "LIVE",
        currentBid: 0,
        sellerId: user.id,
        endsAt: new Date(input.endsAt),
        images: { create: input.images }
      },
      include: { images: true }
    });
    return NextResponse.json({ auction }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid auction" }, { status: 400 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const auctions = await prisma.auction.findMany({ orderBy: { createdAt: "desc" }, include: { seller: true, images: { take: 1 } } });
  return NextResponse.json({ auctions });
}
