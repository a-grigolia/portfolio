import ProximityHero from "./proximity-field/ProximityHero";

// One full-width screen.
export default function ProximityFieldSection() {
  return (
    <section className="h-svh w-full shrink-0">
      <ProximityHero height="100%" />
    </section>
  );
}
