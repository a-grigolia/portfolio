import type { Stat } from "@/content/case-studies";

interface StatsStripProps {
  stats?: Stat[];
}

export default function StatsStrip({ stats = [] }: StatsStripProps) {
  if (!stats.length) return null;

  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-6">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt className="font-sans text-[14px] leading-[22px] text-subtle">
            {stat.label}
          </dt>
          <dd className="mt-1 font-sans text-[20px] font-normal leading-7 text-foreground">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
