import { prisma } from "@/lib/prisma";
import { closeExpiredAuctions } from "@/lib/auction-lifecycle";

export async function getAuctionCards(take = 8) {
  await closeExpiredAuctions();
  return prisma.auction.findMany({
    where: { status: { in: ["APPROVED", "LIVE"] } },
    orderBy: { createdAt: "desc" },
    take,
    include: { images: { orderBy: { position: "asc" }, take: 1 }, bids: true }
  });
}

export async function getEndingSoon(take = 4) {
  await closeExpiredAuctions();
  return prisma.auction.findMany({
    where: { status: { in: ["APPROVED", "LIVE"] }, endsAt: { gt: new Date() } },
    orderBy: { endsAt: "asc" },
    take,
    include: { images: { orderBy: { position: "asc" }, take: 1 }, bids: true }
  });
}
