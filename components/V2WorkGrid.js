"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Fades/rises a card in the first time it scrolls into view.
function useInView(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

function CardInner({ item }) {
  const comingSoon = Boolean(item.comingSoon);
  return (
    <>
      {/* Header: title/subtitle have no gap; year stays opposite. */}
      <div className="flex min-h-20 shrink-0 items-start justify-between gap-4 px-6 pt-6 sm:min-h-24 sm:px-8 sm:pt-8">
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium leading-5 text-foreground">
                {item.title}
              </p>
              {!comingSoon ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  className="v2-card-arrow shrink-0"
                >
                  <path
                    d="M3 9 9 3M4 3h5v5"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </div>
            {item.subtitle ? (
              <p
                className={`text-sm leading-5 text-subtle ${
                  comingSoon ? "" : "v2-card-subtitle"
                }`}
              >
                {item.subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <p className="text-xs leading-4 text-muted">{item.year}</p>
      </div>

      {/* Media: each cover keeps its own natural size and aspect ratio */}
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div
          className={`relative rounded-2xl ${
            comingSoon
              ? "overflow-hidden border border-white bg-[#b9b9b9] shadow-[0px_2px_3px_rgba(0,0,0,0.15)] dark:border-border dark:bg-card"
              : "v2-media-group"
          }`}
          style={{
            width: item.mediaWidth,
            maxWidth: item.mediaMaxWidth,
            aspectRatio: item.aspect,
            maxHeight: "100%",
            "--media-shadow": item.shadowColor,
          }}
        >
          {!comingSoon ? (
            <div
              aria-hidden="true"
              className="v2-media-shadow absolute inset-0 rounded-2xl"
            />
          ) : null}
          {item.media ? (
            <div className="v2-media-image absolute inset-0 overflow-hidden rounded-2xl border border-white shadow-[0px_2px_3px_rgba(0,0,0,0.15)] dark:border-border">
              <img
                src={item.media}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Outcome anchors the opposite corner and reveals after the subtitle. */}
      <div className="flex h-20 shrink-0 items-end justify-end px-6 pb-6 sm:h-24 sm:px-8 sm:pb-8">
        {!comingSoon && item.stats ? (
          <p className="v2-card-stats text-right text-sm leading-5 text-subtle">
            {item.stats}
          </p>
        ) : null}
      </div>
    </>
  );
}

function Card({ item }) {
  const ref = useRef(null);
  const visible = useInView(ref);

  const cellClass = `v2-card-reveal ${
    visible ? "is-visible" : ""
  } flex aspect-square flex-col border-b border-border`;

  if (item.comingSoon) {
    return (
      <div ref={ref} className={cellClass}>
        <CardInner item={item} />
      </div>
    );
  }

  // The whole square is the link.
  return (
    <Link
      ref={ref}
      href={`/work/${item.slug}`}
      draggable={false}
      className={`${cellClass} v2-work-card group select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/60`}
    >
      <CardInner item={item} />
    </Link>
  );
}

export default function V2WorkGrid({ items }) {
  return (
    <div className="relative grid border-t border-border md:grid-cols-2">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-px -translate-x-1/2 bg-border md:block"
      />
      {items.map((item) => (
        <Card key={item.slug} item={item} />
      ))}
    </div>
  );
}
