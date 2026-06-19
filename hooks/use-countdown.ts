"use client";

import { useEffect, useState } from "react";

export function useCountdown(target: string | Date) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(target).getTime() - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => setRemaining(Math.max(0, new Date(target).getTime() - Date.now())), 1000);
    return () => clearInterval(interval);
  }, [target]);

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { remaining, days, hours, minutes, seconds };
}
