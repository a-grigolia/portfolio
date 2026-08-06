export default function StatsStrip({ stats = [] }) {
  if (!stats.length) return null;

  return (
    <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-6 border-t border-border pt-6">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt className="font-sans text-[14px] leading-[22px] text-subtle">
            {stat.label}
          </dt>
          <dd className="mt-1 font-sans text-[18px] font-semibold leading-7 tracking-tight text-foreground">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
