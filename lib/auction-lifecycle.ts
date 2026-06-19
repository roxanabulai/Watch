import { prisma } from "@/lib/prisma";

export async function closeExpiredAuctions() {
  const expired = await prisma.auction.findMany({
    where: {
      status: { in: ["APPROVED", "LIVE"] },
      endsAt: { lte: new Date() }
    },
    include: {
      bids: {
        orderBy: { amount: "desc" },
        take: 1,
        include: { user: { select: { id: true, name: true } } }
      }
    }
  });

  for (const auction of expired) {
    const winningBid = auction.bids[0];
    await prisma.auction.update({
      where: { id: auction.id },
      data: { status: "ENDED" }
    });

    if (winningBid) {
      await prisma.notification.create({
        data: {
          userId: winningBid.userId,
          type: "WON",
          title: "You won an auction",
          message: `You won ${auction.title} with a bid of ${winningBid.amount}. Payment instructions will follow.`
        }
      });
    }
  }
}
