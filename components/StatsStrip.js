export default function StatsStrip({ stats = [] }) {
  if (!stats.length) return null;

  return (
    <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-6 border-t border-border pt-8">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt className="text-xs uppercase tracking-[0.14em] text-muted">
            {stat.label}
          </dt>
          <dd className="mt-1 font-serif text-2xl tracking-tight text-foreground">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
