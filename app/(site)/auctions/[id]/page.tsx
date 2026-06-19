import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { BidPanel } from "@/components/auction/bid-panel";
import { ImageGallery } from "@/components/auction/image-gallery";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const auction = await prisma.auction.findUnique({ where: { id }, include: { images: { take: 1 } } });
  if (!auction) return {};
  return {
    title: auction.title,
    description: auction.description.slice(0, 150),
    openGraph: {
      title: auction.title,
      description: auction.description.slice(0, 150),
      images: auction.images[0]?.url ? [auction.images[0].url] : []
    }
  };
}

export default async function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      bids: { orderBy: { createdAt: "desc" }, take: 20, include: { user: { select: { name: true } } } },
      seller: { select: { name: true } }
    }
  });
  if (!auction) notFound();

  return (
    <div className="container grid gap-10 py-10 lg:grid-cols-[1.45fr_0.75fr]">
      <div className="space-y-8">
        <ImageGallery images={auction.images} />
        <section className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge>{auction.category}</Badge>
            <Badge>{auction.condition}</Badge>
            {auction.year ? <Badge>{auction.year}</Badge> : null}
          </div>
          <div>
            <p className="text-sm uppercase text-muted-foreground">{auction.brand} {auction.model}</p>
            <h1 className="font-serif text-4xl font-semibold">{auction.title}</h1>
          </div>
          <p className="max-w-3xl text-muted-foreground">{auction.description}</p>
          <dl className="grid gap-4 border-t pt-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Reference", auction.reference],
              ["Movement", auction.movement],
              ["Case", auction.caseMaterial],
              ["Bracelet", auction.bracelet],
              ["Diameter", auction.diameterMm ? `${auction.diameterMm} mm` : null],
              ["Estimate", `${money(auction.estimateLow)}-${money(auction.estimateHigh)}`],
              ["Seller", auction.seller.name],
              ["Provenance", auction.provenance]
            ].filter((item) => item[1]).map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs uppercase text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <BidPanel auctionId={auction.id} initialBid={auction.currentBid} startingBid={auction.startingBid} increment={auction.bidIncrement} endsAt={auction.endsAt} bids={auction.bids} />
    </div>
  );
}
