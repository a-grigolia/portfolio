import StatsStrip from "./StatsStrip";

export default function Hero({ eyebrow, title, subtitle, stats }) {
  return (
    <header>
      {eyebrow ? (
        <p className="font-sans text-[16px] font-medium uppercase tracking-[0.22em] text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-5 font-sans text-[36px] font-bold leading-[1.05] tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-5 max-w-2xl font-sans text-[16px] leading-relaxed text-subtle">
          {subtitle}
        </p>
      ) : null}
      <StatsStrip stats={stats} />
    </header>
  );
}
