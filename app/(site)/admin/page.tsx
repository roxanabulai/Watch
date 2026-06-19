import { redirect } from "next/navigation";
import { AdminAuctionForm } from "@/components/admin/admin-auction-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/");
  const [pending, users] = await Promise.all([
    prisma.auction.findMany({ where: { status: "PENDING" }, include: { seller: true }, take: 20 }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 20 })
  ]);

  return (
    <div className="container grid gap-8 py-10 lg:grid-cols-[1fr_0.8fr]">
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase text-muted-foreground">Administration</p>
          <h1 className="font-serif text-4xl font-semibold">Auction operations</h1>
        </div>
        <AdminAuctionForm />
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Pending approvals</CardTitle></CardHeader>
          <CardContent className="space-y-2">{pending.map((auction) => <div key={auction.id} className="rounded-md bg-secondary p-3 text-sm">{auction.title} by {auction.seller.name}</div>)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Users</CardTitle></CardHeader>
          <CardContent className="space-y-2">{users.map((member) => <div key={member.id} className="rounded-md bg-secondary p-3 text-sm">{member.name} - {member.role}</div>)}</CardContent>
        </Card>
      </div>
    </div>
  );
}
