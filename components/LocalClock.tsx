"use client";

import { useEffect, useState } from "react";

// sv-SE locale formats as "YYYY-MM-DD HH:mm:ss"
const formatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

interface LocalClockProps {
  vertical?: boolean;
}

export default function LocalClock({ vertical = false }: LocalClockProps) {
  // null until mounted so the server render never mismatches the client clock
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className={`whitespace-nowrap text-[12px] text-foreground tabular-nums${
        vertical
          ? " leading-6 [writing-mode:vertical-rl] rotate-180"
          : " leading-[20px]"
      }`}
    >
      {now ? `San Francisco, ${formatter.format(now)}` : "\u00A0"}
    </span>
  );
}
