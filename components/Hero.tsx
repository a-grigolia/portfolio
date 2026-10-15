import type { ReactNode } from "react";
import StatsStrip from "./StatsStrip";
import type { LiveSite, Stat } from "@/content/case-studies";

interface HeroProps {
  title: string;
  subtitle?: ReactNode;
  stats?: Stat[];
  liveSite?: LiveSite;
}

export default function Hero({ title, subtitle, stats = [], liveSite }: HeroProps) {
  return (
    <header className="flex flex-col gap-6 px-2 sm:px-12">
      <div className="flex flex-col gap-4">
        <h1 className="font-sans text-[28px] font-normal leading-normal text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="font-sans text-[15px] leading-6 text-subtle">{subtitle}</p>
        ) : null}
      </div>
      {liveSite ? (
        <a
          href={liveSite.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-fit font-sans text-[15px] font-medium leading-[23px] underline underline-offset-2 transition-opacity hover:opacity-70 ${
            liveSite.color ? "" : "text-foreground"
          }`}
          style={liveSite.color ? { color: liveSite.color } : undefined}
        >
          Visit live site↗
        </a>
      ) : null}
      {stats.length ? (
        <>
          <div className="h-px w-full rounded-[2px] bg-border" />
          <StatsStrip stats={stats} />
        </>
      ) : null}
    </header>
  );
}
