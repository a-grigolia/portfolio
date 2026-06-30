import StatsStrip from "./StatsStrip";

export default function Hero({ eyebrow, title, subtitle, stats }) {
  return (
    <header>
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-5 font-serif text-4xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-subtle sm:text-xl">
          {subtitle}
        </p>
      ) : null}
      <StatsStrip stats={stats} />
    </header>
  );
}
