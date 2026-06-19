"use client";

import { useCountdown } from "@/hooks/use-countdown";

export function Countdown({ endsAt }: { endsAt: string | Date }) {
  const time = useCountdown(endsAt);
  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {[
        ["D", time.days],
        ["H", time.hours],
        ["M", time.minutes],
        ["S", time.seconds]
      ].map(([label, value]) => (
        <div key={label} className="rounded-md border bg-background px-2 py-3">
          <div className="text-lg font-semibold tabular-nums">{String(value).padStart(2, "0")}</div>
          <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  );
}
