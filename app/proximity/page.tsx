import type { Metadata } from "next";
import Link from "next/link";
import ProximityFieldSection from "@/components/ProximityFieldSection";

const title = "Proximity • Avto Grigolia";
const description = "Digital sculpture. A field of blocks that rises under your cursor.";

// The share image is opengraph-image.png in this folder, a still of the field.
export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/proximity",
    siteName: "Avto Grigolia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function ProximityPage() {
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
