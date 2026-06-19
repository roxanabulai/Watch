import { z } from "zod";
import { placeBid } from "@/lib/bidding";
import { readAuthTokenFromCookieHeader, verifySessionToken } from "@/lib/auth";

const payloadSchema = z.object({
  auctionId: z.string().min(1),
  amount: z.number().int().positive(),
  maxAmount: z.number().int().positive().optional()
});

export async function handleSocketBid(payload: unknown, cookieHeader: string) {
  try {
    const parsed = payloadSchema.parse(payload);
    const user = await verifySessionToken(readAuthTokenFromCookieHeader(cookieHeader));
    if (!user) return { ok: false, error: "Authentication required" };
    const result = await placeBid(parsed.auctionId, user.id, parsed.amount, parsed.maxAmount);
    return {
      ok: true,
      data: {
        auctionId: parsed.auctionId,
        currentBid: result.auction.currentBid,
        endsAt: result.auction.endsAt,
        bids: result.auction.bids
      }
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Bid failed" };
  }
}
