import ProximityHero from "./proximity-field/ProximityHero";

// One screen inside the same side gutters as the homepage hero.
export default function ProximityFieldSection() {
  return (
    <section className="h-svh shrink-0 px-6 md:px-12">
      <ProximityHero height="100%" />
    </section>
  );
}
