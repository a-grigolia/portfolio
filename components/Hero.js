import StatsStrip from "./StatsStrip";

export default function Hero({ title, subtitle, stats }) {
  return (
    <header className="px-2 sm:px-12">
      <h1 className="font-sans text-[20px] font-semibold leading-tight tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-4 font-sans text-[16px] leading-6 text-subtle">
          {subtitle}
        </p>
      ) : null}
      <StatsStrip stats={stats} />
    </header>
  );
}
