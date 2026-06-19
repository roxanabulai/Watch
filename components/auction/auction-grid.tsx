import { AuctionCard } from "@/components/auction/auction-card";
import type { AuctionCard as AuctionCardType } from "@/types";

export function AuctionGrid({ auctions }: { auctions: AuctionCardType[] }) {
  if (!auctions.length) {
    return <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">No auctions match the current search.</div>;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {auctions.map((auction) => (
        <AuctionCard key={auction.id} auction={auction} />
      ))}
    </div>
  );
}
