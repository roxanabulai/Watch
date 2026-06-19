import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [bids, auctions, watchlist, notifications] = await Promise.all([
    prisma.bid.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { auction: true }, take: 20 }),
    prisma.auction.findMany({ where: { sellerId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.watchlist.findMany({ where: { userId: user.id }, include: { auction: true } }),
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 })
  ]);

  return (
    <div className="container space-y-8 py-10">
      <div>
        <p className="text-sm uppercase text-muted-foreground">Signed in as {user.email}</p>
        <h1 className="font-serif text-4xl font-semibold">Dashboard</h1>
      </div>
      <Tabs defaultValue="bids">
        <TabsList>
          <TabsTrigger value="bids">My bids</TabsTrigger>
          <TabsTrigger value="auctions">My auctions</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="bids"><List title="Recent bids" items={bids.map((bid) => `${bid.auction.title}: ${money(bid.amount)}`)} /></TabsContent>
        <TabsContent value="auctions"><List title="Consigned auctions" items={auctions.map((auction) => `${auction.title}: ${auction.status}`)} /></TabsContent>
        <TabsContent value="watchlist"><List title="Saved lots" items={watchlist.map((item) => item.auction.title)} /></TabsContent>
        <TabsContent value="notifications"><List title="Notifications" items={notifications.map((item) => `${item.title}: ${item.message}`)} /></TabsContent>
      </Tabs>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.length ? items.map((item) => <div key={item} className="rounded-md bg-secondary px-4 py-3 text-sm">{item}</div>) : <p className="text-sm text-muted-foreground">Nothing here yet.</p>}
      </CardContent>
    </Card>
  );
}
