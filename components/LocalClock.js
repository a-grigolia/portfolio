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

export default function LocalClock({ vertical = false }) {
  // null until mounted so the server render never mismatches the client clock
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className={`whitespace-nowrap text-[12px] leading-[20px] text-foreground tabular-nums${
        vertical ? " [writing-mode:vertical-rl] rotate-180" : ""
      }`}
    >
      {now ? `San Francisco, ${formatter.format(now)}` : "\u00A0"}
    </span>
  );
}
