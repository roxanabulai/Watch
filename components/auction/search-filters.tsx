"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = ["All", "Dress", "Diver", "Chronograph", "GMT", "Independent", "Vintage"];
const sorts = [
  ["ending", "Ending soon"],
  ["new", "Newest"],
  ["price-asc", "Price low"],
  ["price-desc", "Price high"]
];

export function SearchFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "All") next.delete(key);
    else next.set(key, value);
    next.delete("page");
    router.push(`/auctions?${next.toString()}`);
  }

  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_180px_180px_auto]">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input defaultValue={params.get("q") ?? ""} onKeyDown={(event) => event.key === "Enter" && update("q", event.currentTarget.value)} placeholder="Search watches, brands, references" className="pl-9" />
      </div>
      <Select defaultValue={params.get("category") ?? "All"} onValueChange={(value) => update("category", value)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
      </Select>
      <Select defaultValue={params.get("sort") ?? "ending"} onValueChange={(value) => update("sort", value)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{sorts.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
      </Select>
      <Button onClick={() => router.push("/auctions")}>Reset</Button>
    </div>
  );
}
