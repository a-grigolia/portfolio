import type { Metadata } from "next";
import Link from "next/link";
import SoccerBreakaway from "@/components/breakaway/SoccerBreakaway";

export const metadata: Metadata = {
  title: "Breakaway, Avto",
  description: "A pixel-art soccer mini game. Beat the keeper and keep the streak going.",
};

export default function BreakawayPage() {
  return (
    <div className="flex min-h-svh items-center justify-center md:px-12">
      <Link
        href="/"
        aria-label="Home"
        className="fixed left-0 z-40 flex w-6 justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 md:left-3"
        style={{ top: "calc(12px + env(safe-area-inset-top))" }}
      >
        <img
          src="/a.svg"
          alt="Avto logo"
          className="h-[17px] w-4 dark:invert md:h-[26px] md:w-6"
        />
      </Link>

      <SoccerBreakaway />
    </div>
  );
}
