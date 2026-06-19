import { Prisma } from "@prisma/client";
import { AuctionGrid } from "@/components/auction/auction-grid";
import { SearchFilters } from "@/components/auction/search-filters";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

const pageSize = 12;

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Auctions",
  description: "Browse live premium watch auctions."
};

export default async function AuctionsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const where: Prisma.AuctionWhereInput = {
    status: { in: ["APPROVED", "LIVE"] },
    ...(params.category ? { category: params.category } : {}),
    ...(params.q
      ? {
          OR: [
            { title: { contains: params.q, mode: "insensitive" } },
            { brand: { contains: params.q, mode: "insensitive" } },
            { model: { contains: params.q, mode: "insensitive" } },
            { reference: { contains: params.q, mode: "insensitive" } }
          ]
        }
      : {})
  };
  const orderBy: Prisma.AuctionOrderByWithRelationInput =
    params.sort === "new" ? { createdAt: "desc" } : params.sort === "price-asc" ? { currentBid: "asc" } : params.sort === "price-desc" ? { currentBid: "desc" } : { endsAt: "asc" };
  const [auctions, count] = await Promise.all([
    prisma.auction.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { images: { orderBy: { position: "asc" }, take: 1 }, bids: true }
    }),
    prisma.auction.count({ where })
  ]);
  const pages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <div className="container space-y-8 py-10">
      <div>
        <p className="text-sm uppercase text-muted-foreground">Live catalog</p>
        <h1 className="font-serif text-4xl font-semibold">Watch auctions</h1>
      </div>
      <SearchFilters />
      <AuctionGrid auctions={auctions} />
      <div className="flex items-center justify-center gap-3">
        <Button asChild variant="outline" disabled={page <= 1}>
          <a href={`/auctions?${new URLSearchParams({ ...params, page: String(Math.max(1, page - 1)) } as Record<string, string>)}`}>Previous</a>
        </Button>
        <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
        <Button asChild variant="outline" disabled={page >= pages}>
          <a href={`/auctions?${new URLSearchParams({ ...params, page: String(Math.min(pages, page + 1)) } as Record<string, string>)}`}>Next</a>
        </Button>
      </div>
    </div>
  );
}
