import { AuctionStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function nextBidMinimum(currentBid: number, startingBid: number, increment: number) {
  return currentBid > 0 ? currentBid + increment : startingBid;
}

export async function placeBid(auctionId: string, userId: string, amount: number, maxAmount?: number) {
  return prisma.$transaction(async (tx) => {
    const auction = await tx.auction.findUnique({
      where: { id: auctionId },
      include: { bids: { orderBy: { createdAt: "desc" }, take: 1 } }
    });

    if (!auction) throw new Error("Auction not found");
    if (auction.status !== AuctionStatus.LIVE && auction.status !== AuctionStatus.APPROVED) {
      throw new Error("Auction is not open for bidding");
    }
    if (auction.endsAt.getTime() <= Date.now()) throw new Error("Auction has ended");
    if (auction.sellerId === userId) throw new Error("You cannot bid on your own auction");

    const minimum = nextBidMinimum(auction.currentBid, auction.startingBid, auction.bidIncrement);
    if (amount < minimum) throw new Error(`Minimum bid is ${minimum}`);

    let endsAt = auction.endsAt;
    if (auction.endsAt.getTime() - Date.now() <= 120_000) {
      endsAt = new Date(Date.now() + 120_000);
    }

    const bid = await tx.bid.create({
      data: {
        amount,
        maxAmount,
        isProxy: Boolean(maxAmount && maxAmount > amount),
        auctionId,
        userId
      },
      include: { user: { select: { id: true, name: true } } }
    });

    const update: Prisma.AuctionUpdateInput = {
      currentBid: amount,
      endsAt,
      proxyMaxBid: maxAmount ?? auction.proxyMaxBid,
      proxyBidderId: maxAmount ? userId : auction.proxyBidderId
    };

    if (auction.proxyMaxBid && auction.proxyBidderId && auction.proxyBidderId !== userId && auction.proxyMaxBid >= amount + auction.bidIncrement) {
      const proxyAmount = Math.min(auction.proxyMaxBid, amount + auction.bidIncrement);
      await tx.bid.create({
        data: {
          amount: proxyAmount,
          maxAmount: auction.proxyMaxBid,
          isProxy: true,
          auctionId,
          userId: auction.proxyBidderId
        }
      });
      update.currentBid = proxyAmount;
    }

    const updated = await tx.auction.update({
      where: { id: auctionId },
      data: update,
      include: {
        bids: { orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { name: true } } } },
        images: { orderBy: { position: "asc" } }
      }
    });

    const lastBidder = auction.bids[0]?.userId;
    if (lastBidder && lastBidder !== userId) {
      await tx.notification.create({
        data: {
          userId: lastBidder,
          type: "OUTBID",
          title: "You have been outbid",
          message: `${updated.title} is now at ${updated.currentBid}.`
        }
      });
    }

    await tx.notification.create({
      data: {
        userId,
        type: "BID_PLACED",
        title: "Bid placed",
        message: `Your bid on ${updated.title} was accepted.`
      }
    });

    return { auction: updated, bid };
  });
}
