import Link from "next/link";

function ArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 8h11M9.5 3.5 14 8l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Dot() {
  return (
    <span
      aria-hidden="true"
      className="absolute left-1/2 top-[25px] size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
    />
  );
}

function EntryBody({ title, subtitle, stats, wip }) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <h3
          className={`text-lg font-semibold leading-tight text-foreground transition-colors ${
            wip ? "opacity-30" : "group-hover:text-accent"
          }`}
        >
          {title}
        </h3>
        {wip ? (
          <span className="text-xs leading-5 text-foreground">WIP</span>
        ) : (
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full text-foreground transition-colors group-hover:bg-card group-hover:text-accent">
            <ArrowIcon />
          </span>
        )}
      </div>
      {subtitle ? (
        <p className={`text-base leading-6 text-subtle ${wip ? "opacity-30" : ""}`}>
          {subtitle}
        </p>
      ) : null}
      {stats ? (
        <p className={`text-base leading-6 text-muted ${wip ? "opacity-30" : ""}`}>
          {stats}
        </p>
      ) : null}
    </>
  );
}

function TimelineRow({ slug, title, subtitle, stats, year, wip, lineClass }) {
  return (
    <div className="flex gap-6">
      {/* Year rail + connecting line */}
      <div className="relative flex w-12 shrink-0 justify-end self-stretch">
        <span className="absolute right-[17px] top-[14px] text-sm leading-[22px] text-subtle">
          {year}
        </span>
        <div className={`relative w-px self-stretch rounded-[1px] ${lineClass}`}>
          <Dot />
        </div>
      </div>

      {/* Entry */}
      {wip ? (
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
          <EntryBody title={title} subtitle={subtitle} stats={stats} wip />
        </div>
      ) : (
        <Link
          href={`/work/${slug}`}
          className="group flex min-w-0 flex-1 flex-col gap-2 rounded-xl p-4 transition-colors hover:bg-card"
        >
          <EntryBody title={title} subtitle={subtitle} stats={stats} />
        </Link>
      )}
    </div>
  );
}

function lineClassFor(index, count) {
  const isFirst = index === 0;
  const isLast = index === count - 1;
  if (isFirst && isLast) {
    return "bg-gradient-to-b from-transparent via-foreground to-transparent";
  }
  if (isFirst) {
    return "bg-gradient-to-t from-foreground from-[60%] to-transparent";
  }
  if (isLast) {
    return "bg-gradient-to-b from-foreground to-transparent";
  }
  return "bg-foreground";
}

export default function Timeline({ items = [] }) {
  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <TimelineRow
          key={item.slug}
          {...item}
          lineClass={lineClassFor(i, items.length)}
        />
      ))}
    </div>
  );
}
