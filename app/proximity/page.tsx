import type { Metadata } from "next";
import Link from "next/link";
import ProximityFieldSection from "@/components/ProximityFieldSection";

// Unlisted until the creative page is ready: nothing links here and search
// engines are asked not to index or follow it.
export const metadata: Metadata = {
  title: "Lab, Avto",
  robots: { index: false, follow: false },
};

export default function LabPage() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <Link
        href="/"
        aria-label="Home"
        className="absolute left-0 z-40 flex w-6 justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 md:left-3"
        style={{ top: "calc(12px + env(safe-area-inset-top))" }}
      >
        <img
          src="/a.svg"
          alt="Avto logo"
          className="h-[17px] w-4 dark:invert md:h-[26px] md:w-6"
        />
      </Link>

      <ProximityFieldSection />
    </div>
  );
}
