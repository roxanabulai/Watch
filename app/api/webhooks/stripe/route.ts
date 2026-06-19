import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  try {
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_replace_me");
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const auctionId = intent.metadata.auctionId;
      if (auctionId) {
        await prisma.auction.update({ where: { id: auctionId }, data: { status: "PAID", stripePaymentId: intent.id } });
        if (intent.metadata.userId) {
          await prisma.notification.create({
            data: { userId: intent.metadata.userId, type: "PAYMENT", title: "Payment received", message: "Your winning lot payment was confirmed." }
          });
        }
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook failed" }, { status: 400 });
  }
}
