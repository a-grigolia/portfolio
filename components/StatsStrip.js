export default function StatsStrip({ stats = [] }) {
  if (!stats.length) return null;

  return (
    <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-6 border-t border-border pt-8">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt className="font-sans text-[14px] font-medium normal-case tracking-normal text-muted">
            {stat.label}
          </dt>
          <dd className="mt-1 font-sans font-semibold text-xl tracking-tight text-foreground">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
