import type { Metadata } from "next";
import Link from "next/link";
import Strata from "@/components/strata/Strata";

export const metadata: Metadata = {
  title: "Strata, Avto",
  description: "Nested half-sphere shells wobbling over a pedestal. Drag to turn the room.",
};

// The piece is dark only, so this page ignores the site theme.
export default function StrataPage() {
  return (
    <div className="relative min-h-svh bg-black">
      <Link
        href="/"
        aria-label="Home"
        className="absolute left-0 z-40 flex w-6 justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 md:left-3"
        style={{ top: "calc(12px + env(safe-area-inset-top))" }}
      >
        <img
          src="/a.svg"
          alt="Avto logo"
          className="h-[17px] w-4 invert md:h-[26px] md:w-6"
        />
      </Link>

      <Strata />
    </div>
  );
}
