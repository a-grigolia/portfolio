import ProximityHero from "./proximity-field/ProximityHero";

// One screen inside the same side rails and hairline border as the homepage hero.
export default function ProximityFieldSection() {
  return (
    <section className="h-svh shrink-0 px-6 md:px-12">
      <div className="h-full border border-border">
        <ProximityHero height="100%" />
      </div>
    </section>
  );
}
