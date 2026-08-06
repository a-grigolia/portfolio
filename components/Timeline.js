"use client";

import Link from "next/link";
import { useRef } from "react";

// Must match the duration-300 used on the hover transitions below.
const EXPAND_DURATION_MS = 300;

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
      className="absolute left-1/2 top-[28px] size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
    />
  );
}

function EntryBody({ title, subtitle, stats, wip }) {
  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-4">
          <h3
            className={`text-base font-semibold leading-6 text-foreground ${
              wip ? "opacity-30" : ""
            }`}
          >
            {title}
          </h3>
          {wip ? (
            <span className="text-xs leading-5 text-foreground">WIP</span>
          ) : (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full text-foreground transition-colors delay-[var(--exit-delay,0ms)] sm:group-hover:bg-card sm:group-hover:delay-0">
              <ArrowIcon />
            </span>
          )}
        </div>
        {subtitle ? (
          <p className={`text-base leading-6 text-subtle ${wip ? "opacity-30" : ""}`}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {stats ? (
        <p className={`text-sm leading-[22px] text-muted ${wip ? "opacity-30" : ""}`}>
          {stats}
        </p>
      ) : null}
    </>
  );
}

function isVideo(src) {
  return /\.(mov|mp4|webm)$/i.test(src);
}

function HoverMedia({ media, mediaFit }) {
  if (!media) return null;
  return (
    // The backdrop must match the hover card tone in dark mode: the image
    // clips inside the rounded corners, and any lighter backdrop bleeds
    // through the antialiased edge as a visible outline.
    <div className="pointer-events-none relative h-full w-0 shrink-0 overflow-hidden rounded-[22px] bg-[#fdf8f2] opacity-0 transition-[width,margin,opacity] delay-[var(--exit-delay,0ms)] duration-300 ease-out will-change-[width] dark:bg-card sm:group-hover:mr-2 sm:group-hover:w-[147px] sm:group-hover:opacity-100 sm:group-hover:delay-0">
      {media ? (
        isVideo(media) ? (
          <video
            src={media}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            className="absolute inset-0 h-full w-[147px] max-w-none object-cover"
          />
        ) : mediaFit === "marquee" ? (
          <div className="absolute inset-0 flex w-max animate-[timeline-marquee_20s_linear_infinite] motion-reduce:animate-none">
            <img src={media} alt="" className="h-full w-auto max-w-none shrink-0" />
            <img
              src={media}
              alt=""
              aria-hidden="true"
              className="h-full w-auto max-w-none shrink-0"
            />
          </div>
        ) : mediaFit === "cover" ? (
          <img
            src={media}
            alt=""
            className="absolute inset-0 h-full w-[147px] max-w-none object-cover"
          />
        ) : (
          <div className="absolute inset-y-0 left-0 flex w-[147px] items-center justify-center px-6">
            <img src={media} alt="" className="h-[88px] w-full object-cover" />
          </div>
        )
      ) : null}
    </div>
  );
}

function TimelineRow({ slug, title, subtitle, stats, year, wip, media, mediaFit, lineClass, isLast }) {
  const gapClass = isLast ? "" : "mb-2";
  const hoverStartRef = useRef(0);
  const linkRef = useRef(null);

  // The 250ms exit delay (which keeps the row expanded while the mouse briefly
  // dips out) only applies once the expansion has fully finished. If the mouse
  // leaves mid-animation, collapse immediately so fast passes don't freeze.
  const handleMouseEnter = () => {
    hoverStartRef.current = performance.now();
  };
  const handleMouseLeave = () => {
    const hoveredLongEnough =
      performance.now() - hoverStartRef.current >= EXPAND_DURATION_MS;
    linkRef.current?.style.setProperty(
      "--exit-delay",
      hoveredLongEnough ? "250ms" : "0ms"
    );
  };
  return (
    <div className="flex gap-6">
      {/* Year rail + connecting line */}
      <div className="relative flex w-12 shrink-0 justify-end self-stretch">
        {/* Centered on the title line: 16px content offset + half the 24px
            line height = 28px. Year is 22px tall (28 - 11), dot self-centers
            via translate. */}
        <span className="absolute right-[17px] top-[17px] text-sm leading-[22px] text-subtle">
          {year}
        </span>
        <div className={`relative w-px self-stretch rounded-[1px] ${lineClass}`}>
          <Dot />
        </div>
      </div>

      {/* Entry */}
      {wip ? (
        <div className={`flex min-w-0 flex-1 flex-col gap-4 px-0 py-4 sm:px-4 ${gapClass}`}>
          <EntryBody title={title} subtitle={subtitle} stats={stats} wip />
        </div>
      ) : (
        <Link
          ref={linkRef}
          href={`/work/${slug}`}
          draggable={false}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`group flex min-w-0 flex-1 select-none items-stretch rounded-[30px] px-0 py-2 transition-[background-color,box-shadow] delay-[var(--exit-delay,0ms)] duration-300 ease-out sm:px-2 sm:hover:bg-white sm:hover:shadow-[0px_2px_6px_rgba(0,0,0,0.15)] sm:hover:delay-0 dark:sm:hover:bg-card dark:sm:hover:shadow-none ${gapClass}`}
        >
          <HoverMedia media={media} mediaFit={mediaFit} />
          <div className="flex min-w-0 flex-1 flex-col gap-4 py-2 sm:px-2">
            <EntryBody title={title} subtitle={subtitle} stats={stats} />
          </div>
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
          isLast={i === items.length - 1}
        />
      ))}
    </div>
  );
}
