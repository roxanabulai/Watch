import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const auctions = await prisma.auction.findMany({ where: { status: { in: ["APPROVED", "LIVE"] } }, select: { id: true, updatedAt: true } });
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/auctions`, lastModified: new Date() },
    ...auctions.map((auction) => ({ url: `${base}/auctions/${auction.id}`, lastModified: auction.updatedAt }))
  ];
}
