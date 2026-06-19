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
  bids
}: {
  auctionId: string;
  initialBid: number;
  startingBid: number;
  increment: number;
  endsAt: string | Date;
  bids: Bid[];
}) {
  const csrf = useCsrfToken();
  const [currentBid, setCurrentBid] = useState(initialBid);
  const [endTime, setEndTime] = useState(endsAt);
  const [history, setHistory] = useState(bids);
  const [amount, setAmount] = useState(initialBid ? initialBid + increment : startingBid);
  const [maxAmount, setMaxAmount] = useState("");
  const [message, setMessage] = useState("");

  const socket: Socket = useMemo(() => io({ autoConnect: false }), []);

  useEffect(() => {
    socket.connect();
    socket.emit("auction:join", auctionId);
    socket.on("auction:update", (data) => {
      setCurrentBid(data.currentBid);
      setEndTime(data.endsAt);
      setHistory(data.bids);
      setAmount(Number(data.currentBid) + increment);
    });
    return () => {
      socket.emit("auction:leave", auctionId);
      socket.disconnect();
    };
  }, [auctionId, increment, socket]);

  async function placeBid() {
    setMessage("");
    const payload = { auctionId, amount: Number(amount), maxAmount: maxAmount ? Number(maxAmount) : undefined };
    socket.emit("auction:bid", payload, async (response: { ok: boolean; error?: string }) => {
      if (response?.ok) return setMessage("Bid accepted.");
      const rest = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({ amount: payload.amount, maxAmount: payload.maxAmount })
      });
      const data = await rest.json();
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
        <p className="text-sm uppercase text-muted-foreground">Current bid</p>
        <p className="font-serif text-4xl font-semibold">{money(currentBid || startingBid)}</p>
      </div>
      <Countdown endsAt={endTime} />
      <div className="grid gap-3">
        <Label htmlFor="amount">Your bid</Label>
        <Input id="amount" type="number" min={currentBid + increment} value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
        <Label htmlFor="maxAmount">Proxy max bid</Label>
        <Input id="maxAmount" type="number" value={maxAmount} onChange={(event) => setMaxAmount(event.target.value)} placeholder="Optional maximum" />
        <Button onClick={placeBid} size="lg"><Send className="h-4 w-4" /> Place bid</Button>
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
