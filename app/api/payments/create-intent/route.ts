import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJson, rateLimit, validateCsrf } from "@/lib/security";
import { stripe } from "@/lib/stripe";

const schema = z.object({ auctionId: z.string().min(1) });

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 20);
  if (limited) return limited;
  const csrf = validateCsrf(request);
  if (csrf) return csrf;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { auctionId } = await parseJson(request, schema);
  const auction = await prisma.auction.findUnique({ where: { id: auctionId }, include: { bids: { orderBy: { createdAt: "desc" }, take: 1 } } });
  if (!auction || auction.bids[0]?.userId !== user.id) return NextResponse.json({ error: "Only the winning bidder can pay" }, { status: 403 });
  const intent = await stripe.paymentIntents.create({
    amount: auction.currentBid * 100,
    currency: "usd",
    metadata: { auctionId, userId: user.id },
    automatic_payment_methods: { enabled: true }
  });
  await prisma.auction.update({ where: { id: auctionId }, data: { stripePaymentId: intent.id } });
  return NextResponse.json({ clientSecret: intent.client_secret });
}
