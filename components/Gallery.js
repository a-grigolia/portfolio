"use client";

import { useState } from "react";
import Lightbox from "./Lightbox";
import Visual from "./Visual";
import Placeholder from "./Placeholder";

const CONTAINERS = {
  "cols-2": "flex flex-col gap-4 sm:flex-row sm:items-start",
  "cols-3": "flex flex-col gap-4 sm:flex-row sm:items-start",
  "cols-6": "grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4",
  "grid-2x2": "grid grid-cols-1 gap-4 sm:grid-cols-2",
  stack: "flex flex-col gap-4",
};

const ROW_LAYOUTS = new Set(["cols-2", "cols-3"]);

function Tile({ item, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={item.label ? `Enlarge: ${item.label}` : "Enlarge image"}
      className={`group block cursor-zoom-in overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:ring-white/5 ${className}`}
    >
      <div style={{ aspectRatio: item.ratio ?? "4 / 3" }} className="w-full overflow-hidden">
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]">
          <Visual
            src={item.src}
            color={item.color}
            label={item.label}
            fit={item.fit ?? "cover"}
          />
        </div>
      </div>
    </button>
  );
}

export default function Gallery({ items = [], caption, layout = "cols-3" }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const active = activeIndex !== null ? items[activeIndex] : null;
  const isRow = ROW_LAYOUTS.has(layout);
  const container = CONTAINERS[layout] ?? CONTAINERS["cols-3"];

  return (
    <figure>
      <div className="rounded-2xl bg-card p-4 sm:p-8">
        {layout === "split-left" ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {items[0] ? (
              <Tile
                item={items[0]}
                onClick={() => setActiveIndex(0)}
                className="w-full sm:flex-1 sm:basis-0 sm:min-w-0"
              />
            ) : null}
            <div className="flex w-full flex-col gap-4 sm:flex-1 sm:basis-0 sm:min-w-0">
              {items.slice(1).map((item, i) => (
                <Tile
                  key={i + 1}
                  item={item}
                  onClick={() => setActiveIndex(i + 1)}
                  className="w-full"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className={container}>
            {items.map((item, i) => (
              <Tile
                key={i}
                item={item}
                onClick={() => setActiveIndex(i)}
                className={isRow ? "w-full sm:flex-1 sm:basis-0 sm:min-w-0" : "w-full"}
              />
            ))}
          </div>
        )}
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-sm text-muted">
          {caption}
        </figcaption>
      ) : null}

      <Lightbox open={active !== null} onClose={() => setActiveIndex(null)}>
        {active ? (
          <>
            {active.src ? (
              <img
                src={active.src}
                alt={active.label || ""}
                className="mx-auto max-h-[85vh] w-auto rounded-xl object-contain"
              />
            ) : (
              <div style={{ aspectRatio: active.ratio ?? "3 / 4" }} className="w-full">
                <Placeholder
                  color={active.color}
                  label={active.label}
                  className="h-full w-full"
                />
              </div>
            )}
            {active.label ? (
              <p className="mt-4 text-center font-sans text-[16px] text-white/70">
                {active.label}
              </p>
            ) : null}
          </>
        ) : null}
      </Lightbox>
    </figure>
  );
}
