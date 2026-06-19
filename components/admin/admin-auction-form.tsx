"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCsrfToken } from "@/hooks/use-csrf";

export function AdminAuctionForm() {
  const csrf = useCsrfToken();
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const image = String(formData.get("image"));
    const payload = {
      title: formData.get("title"),
      brand: formData.get("brand"),
      model: formData.get("model"),
      category: formData.get("category"),
      condition: formData.get("condition"),
      description: formData.get("description"),
      estimateLow: Number(formData.get("estimateLow")),
      estimateHigh: Number(formData.get("estimateHigh")),
      startingBid: Number(formData.get("startingBid")),
      endsAt: new Date(String(formData.get("endsAt"))).toISOString(),
      images: [{ url: image, alt: String(formData.get("title")), position: 0 }]
    };
    const response = await fetch("/api/admin/auctions", {
      method: "POST",
      headers: { "content-type": "application/json", "x-csrf-token": csrf },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setMessage(response.ok ? "Auction created." : data.error ?? "Unable to create auction.");
  }

  return (
    <form action={submit} className="grid gap-4 rounded-lg border bg-card p-5">
      <div className="grid gap-2"><Label htmlFor="title">Title</Label><Input id="title" name="title" required /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2"><Label htmlFor="brand">Brand</Label><Input id="brand" name="brand" required /></div>
        <div className="grid gap-2"><Label htmlFor="model">Model</Label><Input id="model" name="model" required /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2"><Label htmlFor="category">Category</Label><Input id="category" name="category" defaultValue="Chronograph" required /></div>
        <div className="grid gap-2"><Label htmlFor="condition">Condition</Label><Input id="condition" name="condition" defaultValue="Excellent" required /></div>
      </div>
      <div className="grid gap-2"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" required /></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-2"><Label htmlFor="estimateLow">Low</Label><Input id="estimateLow" name="estimateLow" type="number" required /></div>
        <div className="grid gap-2"><Label htmlFor="estimateHigh">High</Label><Input id="estimateHigh" name="estimateHigh" type="number" required /></div>
        <div className="grid gap-2"><Label htmlFor="startingBid">Start</Label><Input id="startingBid" name="startingBid" type="number" required /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2"><Label htmlFor="endsAt">Ends at</Label><Input id="endsAt" name="endsAt" type="datetime-local" required /></div>
        <div className="grid gap-2"><Label htmlFor="image">Image URL</Label><Input id="image" name="image" type="url" required /></div>
      </div>
      <Button type="submit">Create auction</Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </form>
  );
}
