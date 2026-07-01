import Link from "next/link";

function Dot({ className }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute left-1/2 size-[6px] -translate-x-1/2 rounded-full bg-foreground ${className}`}
    />
  );
}

function TimelineRow({ slug, title, subtitle, stats, year, yearTop, isFirst }) {
  return (
    <div className="flex min-h-[144px] gap-6 sm:min-h-0">
      {/* Year rail + connecting line */}
      <div className="flex w-16 shrink-0 items-stretch justify-end gap-[16px]">
        <div
          className={`flex w-16 flex-col text-right mb-[-10px] text-sm leading-[22px] text-subtle ${
            yearTop ? "justify-between" : "justify-end"
          }`}
        >
          {yearTop ? <span>{yearTop}</span> : null}
          <span>{year}</span>
        </div>
        <div className="relative w-px self-stretch rounded-t-full bg-foreground">
          <Dot className="bottom-0 translate-y-1/2" />
        </div>
      </div>

      {/* Entry */}
      <Link
        href={`/work/${slug}`}
        className="group flex flex-1 flex-col justify-center gap-2 py-4 sm:min-h-0"
      >
        <h3 className="text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-accent">
          {title}
        </h3>
        <p className="text-[16px] leading-6 text-subtle">{subtitle}</p>
        <p className="text-[16px] leading-6 text-muted">{stats}</p>
      </Link>
    </div>
  );
}

export default function Timeline({ items = [] }) {
  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <TimelineRow key={item.slug} {...item} isFirst={i === 0} />
      ))}
    </div>
  );
}
