import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuctionGrid } from "@/components/auction/auction-grid";
import { getAuctionCards, getEndingSoon } from "@/lib/data";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, endingSoon] = await Promise.all([getAuctionCards(8), getEndingSoon(4)]);

  return (
    <div>
      <section className="border-b">
        <div className="container grid min-h-[620px] items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Curated watch auctions</p>
              <h1 className="font-serif text-5xl font-semibold leading-tight md:text-7xl">Exceptional watches, transparently bid.</h1>
              <p className="max-w-xl text-lg text-muted-foreground">Discover important vintage, independent, and modern pieces with live bidding, proxy limits, anti-sniping protection, and secure checkout.</p>
            </div>
            <form action="/auctions" className="flex max-w-xl gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input name="q" placeholder="Search Rolex, Patek, Speedmaster..." className="pl-9" />
              </div>
              <Button type="submit" size="lg">Search</Button>
            </form>
            <div className="grid max-w-xl grid-cols-3 gap-3 text-sm">
              {["Chronograph", "Diver", "Vintage"].map((category) => (
                <Link key={category} href={`/auctions?category=${category}`} className="rounded-md border px-4 py-3 text-center hover:bg-secondary">
                  {category}
                </Link>
              ))}
            </div>
          </div>
          <div className="relative h-[520px] overflow-hidden rounded-lg bg-[url('/images/certina/certina-in-box-front.jpeg')] bg-cover bg-center shadow-luxury">
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-white">
              <p className="text-sm uppercase tracking-[0.18em] text-white/70">Featured lot</p>
              <h2 className="font-serif text-3xl font-semibold">Vintage Certina with original box</h2>
              <p className="mt-2 text-white/80">Estimate {money(180)}-{money(320)}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="container space-y-6 py-14">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm uppercase text-muted-foreground">Featured auctions</p>
            <h2 className="font-serif text-3xl font-semibold">Fresh consignments</h2>
          </div>
          <Button asChild variant="outline"><Link href="/auctions">View all <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
        <AuctionGrid auctions={featured} />
      </section>
      <section className="border-t bg-secondary/40">
        <div className="container space-y-6 py-14">
          <div>
            <p className="text-sm uppercase text-muted-foreground">Ending soon</p>
            <h2 className="font-serif text-3xl font-semibold">Final calls</h2>
          </div>
          <AuctionGrid auctions={endingSoon} />
        </div>
      </section>
    </div>
  );
}
