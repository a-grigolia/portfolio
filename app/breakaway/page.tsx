import type { Metadata } from "next";
import Link from "next/link";
import SoccerBreakaway from "@/components/breakaway/SoccerBreakaway";

const title = "Breakaway";
const description = "Soccer mini game, beat the keeper and keep the streak going.";

// The share image is opengraph-image.png in this folder, a still of the game.
export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/breakaway",
    siteName: "Avto Grigolia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function BreakawayPage() {
  return (
    <div data-breakaway className="flex min-h-svh items-center justify-center md:px-12">
      <Link
        href="/"
        aria-label="Home"
        className="fixed left-0 z-40 flex w-6 justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 md:left-3"
        style={{ top: "calc(12px + env(safe-area-inset-top))" }}
      >
        <img
          src="/a.svg"
          alt="Avto logo"
          className="h-[17px] w-4 invert md:h-[26px] md:w-6"
        />
      </Link>

      <SoccerBreakaway />
    </div>
  );
}
