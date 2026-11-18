import type { Metadata } from "next";
import Link from "next/link";
import Strata from "@/components/strata/Strata";

const title = "Strata • Avto Grigolia";
const description = "Nested half-sphere shells wobbling over a pedestal. Drag to turn the room.";

// The share image is opengraph-image.png in this folder, a still of the scene.
export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/strata",
    siteName: "Avto Grigolia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
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
