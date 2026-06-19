"use client";

import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCsrfToken } from "@/hooks/use-csrf";
import { money } from "@/lib/utils";
import { Countdown } from "@/components/auction/countdown";

type Bid = { id: string; amount: number; createdAt: string | Date; user?: { name: string } };

export function BidPanel({
  auctionId,
  initialBid,
  startingBid,
  increment,
  endsAt,
  status,
  bids
}: {
  auctionId: string;
  initialBid: number;
  startingBid: number;
  increment: number;
  endsAt: string | Date;
  status: string;
  bids: Bid[];
}) {
  const csrf = useCsrfToken();
  const [currentBid, setCurrentBid] = useState(initialBid);
  const [endTime, setEndTime] = useState(endsAt);
  const [history, setHistory] = useState(bids);
  const [amount, setAmount] = useState(initialBid ? initialBid + increment : startingBid);
  const [maxAmount, setMaxAmount] = useState("");
  const [message, setMessage] = useState("");
  const [live, setLive] = useState(false);
  const [auctionStatus, setAuctionStatus] = useState(status);

  const socket: Socket = useMemo(() => io({ autoConnect: false }), []);

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => setLive(true));
    socket.on("disconnect", () => setLive(false));
    socket.emit("auction:join", auctionId);
    socket.on("auction:update", (data) => {
      setCurrentBid(data.currentBid);
      setEndTime(data.endsAt);
      setHistory(data.bids);
      if (data.status) setAuctionStatus(data.status);
      setAmount(Number(data.currentBid) + increment);
    });
    return () => {
      socket.emit("auction:leave", auctionId);
      socket.disconnect();
    };
  }, [auctionId, increment, socket]);

  async function placeBid() {
    setMessage("");
    if (auctionStatus === "ENDED" || auctionStatus === "PAID") {
      setMessage("This auction has ended.");
      return;
    }
    const payload = { auctionId, amount: Number(amount), maxAmount: maxAmount ? Number(maxAmount) : undefined };
    socket.emit("auction:bid", payload, async (response: { ok: boolean; error?: string }) => {
      if (response?.ok) return setMessage("Bid accepted.");
      const rest = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({ amount: payload.amount, maxAmount: payload.maxAmount })
      });
      const data = await rest.json();
      if (rest.ok && data.auction) {
        setCurrentBid(data.auction.currentBid);
        setEndTime(data.auction.endsAt);
        setHistory(data.auction.bids);
        setAuctionStatus(data.auction.status);
      }
      setMessage(rest.ok ? "Bid accepted." : data.error ?? response?.error ?? "Bid failed.");
    });
  }

  async function toggleWatchlist() {
    const response = await fetch(`/api/auctions/${auctionId}/watchlist`, { method: "POST", headers: { "x-csrf-token": csrf } });
    const data = await response.json();
    setMessage(data.message ?? "Watchlist updated.");
  }

  return (
    <aside className="space-y-6 rounded-lg border bg-card p-5">
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm uppercase text-muted-foreground">{auctionStatus === "ENDED" ? "Winning bid" : "Current bid"}</p>
          <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">{live ? "Live connected" : "Connecting"}</span>
        </div>
        <p className="font-serif text-4xl font-semibold">{money(currentBid || startingBid)}</p>
      </div>
      <Countdown endsAt={endTime} />
      {auctionStatus === "ENDED" ? (
        <div className="rounded-md border bg-secondary p-3 text-sm text-muted-foreground">
          This auction has ended. The winning bidder will receive payment instructions after admin confirmation.
        </div>
      ) : null}
      <div className="grid gap-3">
        <Label htmlFor="amount">Your bid</Label>
        <Input id="amount" type="number" min={currentBid + increment} value={amount} disabled={auctionStatus === "ENDED" || auctionStatus === "PAID"} onChange={(event) => setAmount(Number(event.target.value))} />
        <Label htmlFor="maxAmount">Proxy max bid</Label>
        <Input id="maxAmount" type="number" value={maxAmount} disabled={auctionStatus === "ENDED" || auctionStatus === "PAID"} onChange={(event) => setMaxAmount(event.target.value)} placeholder="Optional maximum" />
        <Button onClick={placeBid} disabled={auctionStatus === "ENDED" || auctionStatus === "PAID"} size="lg"><Send className="h-4 w-4" /> Place bid</Button>
        <Button onClick={toggleWatchlist} variant="outline"><Heart className="h-4 w-4" /> Watchlist</Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
      <div>
        <h3 className="mb-3 font-semibold">Bid history</h3>
        <div className="space-y-2">
          {history.slice(0, 6).map((bid) => (
            <div key={bid.id} className="flex justify-between rounded-md bg-secondary px-3 py-2 text-sm">
              <span>{bid.user?.name ?? "Bidder"}</span>
              <span className="font-medium">{money(bid.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
