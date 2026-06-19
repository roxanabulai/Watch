import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { money } from "@/lib/utils";
import type { AuctionCard as AuctionCardType } from "@/types";

export function AuctionCard({ auction }: { auction: AuctionCardType }) {
  const image = auction.images[0]?.url ?? "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=1200&auto=format&fit=crop";
  return (
    <Link href={`/auctions/${auction.id}`} className="group block overflow-hidden rounded-lg border bg-card transition hover:shadow-luxury">
      <div className="relative aspect-[4/3] bg-secondary">
        <Image src={image} alt={auction.images[0]?.alt ?? auction.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <Badge className="bg-background">{auction.category}</Badge>
          <span className="text-xs text-muted-foreground">{new Date(auction.endsAt).toLocaleDateString()}</span>
        </div>
        <div>
          <h3 className="line-clamp-1 font-serif text-xl font-semibold">{auction.title}</h3>
          <p className="text-sm text-muted-foreground">{auction.brand} {auction.model}</p>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Current bid</p>
            <p className="text-lg font-semibold">{money(auction.currentBid || auction.startingBid)}</p>
          </div>
          <p className="text-xs text-muted-foreground">{money(auction.estimateLow)}-{money(auction.estimateHigh)}</p>
        </div>
      </div>
    </Link>
  );
}
