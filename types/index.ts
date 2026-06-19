export type AuctionCard = {
  id: string;
  title: string;
  brand: string;
  model: string;
  category: string;
  currentBid: number;
  startingBid: number;
  estimateLow: number;
  estimateHigh: number;
  endsAt: Date | string;
  images: { url: string; alt: string }[];
};
