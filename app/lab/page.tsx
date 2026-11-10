import type { Metadata } from "next";
import ProximityFieldSection from "@/components/ProximityFieldSection";
import V2Chrome from "@/components/V2Chrome";

// Unlisted until the creative page is ready: nothing links here and search
// engines are asked not to index or follow it.
export const metadata: Metadata = {
  title: "Lab, Avto",
  robots: { index: false, follow: false },
};

export default function LabPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <V2Chrome />
      <ProximityFieldSection />
    </div>
  );
}
